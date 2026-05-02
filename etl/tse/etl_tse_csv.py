#!/usr/bin/env python3
"""
etl_tse_csv.py — Pipeline ETL para dados eleitorais do TSE (Distrito Federal)
=============================================================================

Baixa os CSVs de resultados eleitorais do portal de Dados Abertos do TSE,
filtra pelo Distrito Federal, normaliza zonas eleitorais para Regiões
Administrativas (RAs) e insere no banco MySQL/TiDB do projeto CRIVO.

Fontes suportadas:
  - votacao_candidato_munzona_<ANO>.zip  → votos por candidato/zona (todas as UFs)
  - votacao_secao_<ANO>_DF.zip          → votos por seção eleitoral (DF, 2022+)
  - detalhe_votacao_munzona_<ANO>.zip   → detalhe apuração por zona (todas as UFs)

Uso:
  # Validar sem gravar no banco
  python etl_tse_csv.py --ano 2024 --tipo candidato --dry-run

  # Executar com banco real
  DATABASE_URL="mysql://user:pass@host/db" python etl_tse_csv.py --ano 2024 --tipo candidato

  # Usar arquivo local já baixado
  python etl_tse_csv.py --arquivo /tmp/votacao_candidato_munzona_2024.zip --tipo candidato

Requisitos:
  pip install requests pandas mysql-connector-python python-dotenv

NOTA SOBRE O CDN DO TSE:
  O CDN cdn.tse.jus.br bloqueia downloads diretos de IPs de servidores/cloud.
  Para ambientes de produção, baixe os arquivos manualmente em:
    https://dadosabertos.tse.jus.br/dataset/resultados-<ANO>
  e use a opção --arquivo para apontar para o ZIP local.
"""

import argparse
import csv
import io
import json
import os
import sys
import zipfile
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Mapeamento de Zona Eleitoral → Região Administrativa do DF
# Fonte: TRE-DF (https://www.tre-df.jus.br/servicos-eleitorais/zonas-eleitorais)
# e repositório mapaslivres/zonas-eleitorais (github.com/mapaslivres/zonas-eleitorais)
# ---------------------------------------------------------------------------
ZONA_TO_RA: dict[int, dict] = {
    1:  {"ra_codigo": "RA01", "ra_nome": "Brasília",        "descricao": "Asa Sul, Plano Piloto"},
    2:  {"ra_codigo": "RA27", "ra_nome": "Jardim Botânico", "descricao": "Paranoá, Jardim Botânico, São Sebastião (parcial)"},
    3:  {"ra_codigo": "RA03", "ra_nome": "Taguatinga",      "descricao": "Taguatinga Norte"},
    4:  {"ra_codigo": "RA02", "ra_nome": "Gama",            "descricao": "Gama Setor Central"},
    5:  {"ra_codigo": "RA05", "ra_nome": "Sobradinho",      "descricao": "Sobradinho, Sobradinho II (parcial)"},
    6:  {"ra_codigo": "RA06", "ra_nome": "Planaltina",      "descricao": "Planaltina"},
    7:  {"ra_codigo": "RA04", "ra_nome": "Brazlândia",      "descricao": "Brazlândia"},
    8:  {"ra_codigo": "RA09", "ra_nome": "Ceilândia",       "descricao": "Ceilândia Setor QNM, QNN, P Norte (parcial)"},
    9:  {"ra_codigo": "RA10", "ra_nome": "Guará",           "descricao": "Guará I e II"},
    10: {"ra_codigo": "RA11", "ra_nome": "Cruzeiro",        "descricao": "Núcleo Bandeirante, Cruzeiro"},
    11: {"ra_codigo": "RA11", "ra_nome": "Cruzeiro",        "descricao": "Cruzeiro Novo, Park Way (parcial)"},
    12: {"ra_codigo": "RA09", "ra_nome": "Ceilândia",       "descricao": "Ceilândia Norte (2ª zona)"},
    13: {"ra_codigo": "RA20", "ra_nome": "Samambaia",       "descricao": "Samambaia Norte e Sul"},
    14: {"ra_codigo": "RA01", "ra_nome": "Brasília",        "descricao": "Asa Norte, Plano Piloto Norte"},
    15: {"ra_codigo": "RA25", "ra_nome": "Águas Claras",    "descricao": "Águas Claras, Taguatinga Sul"},
    16: {"ra_codigo": "RA09", "ra_nome": "Ceilândia",       "descricao": "Ceilândia Norte (3ª zona), Sol Nascente"},
    17: {"ra_codigo": "RA02", "ra_nome": "Gama",            "descricao": "Gama (2ª zona)"},
    18: {"ra_codigo": "RA16", "ra_nome": "Lago Sul",        "descricao": "Lago Sul, Jardim Botânico (parcial)"},
    19: {"ra_codigo": "RA03", "ra_nome": "Taguatinga",      "descricao": "Taguatinga Norte (2ª zona)"},
    20: {"ra_codigo": "RA09", "ra_nome": "Ceilândia",       "descricao": "Ceilândia Sul"},
    21: {"ra_codigo": "RA23", "ra_nome": "Recanto das Emas","descricao": "Recanto das Emas"},
}

# Zonas com abrangência em múltiplas RAs (zona principal → lista de RAs)
ZONA_MULTI_RA: dict[int, list[str]] = {
    2:  ["RA27", "RA28", "RA14"],  # Jardim Botânico, São Sebastião, Paranoá
    5:  ["RA05", "RA31"],          # Sobradinho, Sobradinho II
    10: ["RA11", "RA10"],          # Cruzeiro, Núcleo Bandeirante
    11: ["RA11", "RA24"],          # Cruzeiro, Park Way
    15: ["RA25", "RA03"],          # Águas Claras, Taguatinga Sul
    18: ["RA16", "RA27"],          # Lago Sul, Jardim Botânico
}

# Colunas esperadas nos arquivos TSE (votacao_candidato_munzona)
COLUNAS_CANDIDATO_MUNZONA = [
    "DT_GERACAO", "HH_GERACAO", "ANO_ELEICAO", "CD_TIPO_ELEICAO",
    "NM_TIPO_ELEICAO", "NR_TURNO", "CD_ELEICAO", "DS_ELEICAO",
    "DT_ELEICAO", "TP_ABRANGENCIA", "SG_UF", "SG_UE", "NM_UE",
    "CD_MUNICIPIO", "NM_MUNICIPIO", "NR_ZONA", "CD_CARGO",
    "DS_CARGO", "SQ_CANDIDATO", "NR_CANDIDATO", "NM_CANDIDATO",
    "NM_URNA_CANDIDATO", "NM_SOCIAL_CANDIDATO", "NR_PARTIDO",
    "SG_PARTIDO", "NM_PARTIDO", "DT_NASCIMENTO", "CD_GENERO",
    "DS_GENERO", "CD_GRAU_INSTRUCAO", "DS_GRAU_INSTRUCAO",
    "CD_ESTADO_CIVIL", "DS_ESTADO_CIVIL", "CD_COR_RACA",
    "DS_COR_RACA", "NM_EMAIL", "CD_SITUACAO_CANDIDATURA",
    "DS_SITUACAO_CANDIDATURA", "CD_DETALHE_SITUACAO_CAND",
    "DS_DETALHE_SITUACAO_CAND", "QT_VOTOS_NOMINAIS",
    "QT_VOTOS_NOMINAIS_VALIDOS",
]

# Colunas esperadas nos arquivos TSE (votacao_secao)
COLUNAS_VOTACAO_SECAO = [
    "DT_GERACAO", "HH_GERACAO", "ANO_ELEICAO", "CD_TIPO_ELEICAO",
    "NM_TIPO_ELEICAO", "NR_TURNO", "CD_ELEICAO", "DS_ELEICAO",
    "DT_ELEICAO", "TP_ABRANGENCIA", "SG_UF", "SG_UE", "NM_UE",
    "CD_MUNICIPIO", "NM_MUNICIPIO", "NR_ZONA", "NR_SECAO",
    "CD_CARGO", "DS_CARGO", "NR_VOTAVEL", "NM_VOTAVEL",
    "QT_VOTOS",
]

# URLs dos arquivos no CDN do TSE (podem ser bloqueadas em ambientes cloud)
TSE_CDN_URLS = {
    "candidato_munzona": "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_{ano}.zip",
    "secao_df": "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_{ano}_DF.zip",
    "detalhe_munzona": "https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_munzona/detalhe_votacao_munzona_{ano}.zip",
}

# API CKAN do TSE para listar recursos
TSE_CKAN_API = "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=resultados-{ano}"


def get_tse_resource_urls(ano: int) -> dict[str, str]:
    """Consulta a API CKAN do TSE para obter URLs dos recursos do ano."""
    import requests
    try:
        resp = requests.get(TSE_CKAN_API.format(ano=ano), timeout=15)
        resp.raise_for_status()
        data = resp.json()
        resources = data.get("result", {}).get("resources", [])
        urls = {}
        for r in resources:
            name = r.get("name", "").lower()
            url = r.get("url", "")
            if "votação nominal" in name or "munzona" in url:
                urls["candidato_munzona"] = url
            elif "seção eleitoral" in name and "DF" in r.get("name", ""):
                urls["secao_df"] = url
            elif "detalhe" in name and "munzona" in url:
                urls["detalhe_munzona"] = url
        return urls
    except Exception as e:
        print(f"[WARN] Não foi possível consultar API CKAN: {e}", file=sys.stderr)
        return {}


def download_tse_zip(url: str, dest_path: Path) -> bool:
    """
    Tenta baixar o ZIP do TSE. Retorna False se bloqueado pelo CDN.
    
    NOTA: O CDN do TSE bloqueia IPs de servidores cloud (AWS, GCP, Azure).
    Para contornar, baixe manualmente via browser e use --arquivo.
    """
    import requests
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://dadosabertos.tse.jus.br/",
        "Accept": "application/zip,*/*",
    }
    try:
        print(f"[INFO] Baixando: {url}")
        resp = requests.get(url, headers=headers, timeout=120, stream=True)
        if resp.status_code == 403:
            print(f"[ERRO] CDN bloqueou o download (HTTP 403).", file=sys.stderr)
            print(f"[ERRO] Baixe manualmente em: https://dadosabertos.tse.jus.br/dataset/resultados-{url.split('_')[-1].replace('.zip','')}", file=sys.stderr)
            print(f"[ERRO] Depois use: --arquivo /caminho/para/arquivo.zip", file=sys.stderr)
            return False
        resp.raise_for_status()
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total > 0:
                    pct = downloaded / total * 100
                    print(f"\r[INFO] {pct:.1f}% ({downloaded/1024/1024:.1f} MB)", end="", flush=True)
        print()
        return True
    except Exception as e:
        print(f"[ERRO] Falha no download: {e}", file=sys.stderr)
        return False


def find_df_csv_in_zip(zip_path: Path, tipo: str) -> Optional[io.TextIOWrapper]:
    """
    Abre o ZIP e retorna o arquivo CSV do DF.
    
    Para arquivos com todas as UFs, o CSV do DF está dentro do ZIP
    com nome como: votacao_candidato_munzona_2024_DF.csv
    """
    with zipfile.ZipFile(zip_path, "r") as zf:
        names = zf.namelist()
        print(f"[INFO] Arquivos no ZIP: {names}")
        
        # Tentar encontrar arquivo específico do DF
        df_candidates = [n for n in names if "_DF" in n.upper() and n.endswith(".csv")]
        if df_candidates:
            target = df_candidates[0]
            print(f"[INFO] Usando arquivo DF: {target}")
            data = zf.read(target)
            return io.StringIO(data.decode("latin-1"))
        
        # Se não há arquivo específico do DF, retornar o CSV principal
        # (filtraremos por SG_UF == 'DF' depois)
        csv_files = [n for n in names if n.endswith(".csv")]
        if csv_files:
            target = csv_files[0]
            print(f"[INFO] Usando arquivo geral (filtraremos por DF): {target}")
            data = zf.read(target)
            return io.StringIO(data.decode("latin-1"))
        
        print(f"[ERRO] Nenhum CSV encontrado no ZIP", file=sys.stderr)
        return None


def parse_candidato_munzona(csv_content: io.StringIO, ano: int) -> list[dict]:
    """
    Parseia o CSV de votação nominal por município e zona.
    Filtra pelo DF e enriquece com mapeamento zona→RA.
    """
    reader = csv.DictReader(csv_content, delimiter=";")
    records = []
    
    for row in reader:
        # Filtrar pelo DF
        sg_uf = row.get("SG_UF", "").strip()
        if sg_uf != "DF":
            continue
        
        try:
            nr_zona = int(row.get("NR_ZONA", 0))
        except (ValueError, TypeError):
            nr_zona = 0
        
        # Mapear zona para RA
        ra_info = ZONA_TO_RA.get(nr_zona, {
            "ra_codigo": "UNKNOWN",
            "ra_nome": f"Zona {nr_zona}",
            "descricao": "Zona sem mapeamento para RA"
        })
        
        try:
            qt_votos = int(row.get("QT_VOTOS_NOMINAIS", 0))
        except (ValueError, TypeError):
            qt_votos = 0
        
        records.append({
            "ano": ano,
            "nr_turno": int(row.get("NR_TURNO", 1)),
            "nr_zona": nr_zona,
            "ra_codigo": ra_info["ra_codigo"],
            "ra_nome": ra_info["ra_nome"],
            "cd_municipio": row.get("CD_MUNICIPIO", "").strip(),
            "nm_municipio": row.get("NM_MUNICIPIO", "").strip(),
            "cd_cargo": row.get("CD_CARGO", "").strip(),
            "ds_cargo": row.get("DS_CARGO", "").strip(),
            "nr_candidato": row.get("NR_CANDIDATO", "").strip(),
            "nm_candidato": row.get("NM_CANDIDATO", "").strip(),
            "nm_urna_candidato": row.get("NM_URNA_CANDIDATO", "").strip(),
            "sg_partido": row.get("SG_PARTIDO", "").strip(),
            "nm_partido": row.get("NM_PARTIDO", "").strip(),
            "qt_votos_nominais": qt_votos,
            "ds_situacao_candidatura": row.get("DS_SITUACAO_CANDIDATURA", "").strip(),
        })
    
    return records


def parse_votacao_secao(csv_content: io.StringIO, ano: int) -> list[dict]:
    """
    Parseia o CSV de votação por seção eleitoral.
    Enriquece com mapeamento zona→RA.
    """
    reader = csv.DictReader(csv_content, delimiter=";")
    records = []
    
    for row in reader:
        sg_uf = row.get("SG_UF", "").strip()
        if sg_uf != "DF":
            continue
        
        try:
            nr_zona = int(row.get("NR_ZONA", 0))
        except (ValueError, TypeError):
            nr_zona = 0
        
        ra_info = ZONA_TO_RA.get(nr_zona, {
            "ra_codigo": "UNKNOWN",
            "ra_nome": f"Zona {nr_zona}",
            "descricao": "Zona sem mapeamento para RA"
        })
        
        try:
            qt_votos = int(row.get("QT_VOTOS", 0))
        except (ValueError, TypeError):
            qt_votos = 0
        
        records.append({
            "ano": ano,
            "nr_turno": int(row.get("NR_TURNO", 1)),
            "nr_zona": nr_zona,
            "nr_secao": row.get("NR_SECAO", "").strip(),
            "ra_codigo": ra_info["ra_codigo"],
            "ra_nome": ra_info["ra_nome"],
            "cd_cargo": row.get("CD_CARGO", "").strip(),
            "ds_cargo": row.get("DS_CARGO", "").strip(),
            "nr_votavel": row.get("NR_VOTAVEL", "").strip(),
            "nm_votavel": row.get("NM_VOTAVEL", "").strip(),
            "qt_votos": qt_votos,
        })
    
    return records


def aggregate_by_ra(records: list[dict], tipo: str) -> list[dict]:
    """
    Agrega os registros por RA, calculando totais de votos por candidato/partido.
    """
    from collections import defaultdict
    
    if tipo == "candidato":
        # Agrupar por ra_codigo + nr_candidato + nr_turno + cd_cargo
        agg: dict = defaultdict(lambda: defaultdict(int))
        meta: dict = {}
        
        for r in records:
            key = (r["ra_codigo"], r["nr_candidato"], r["nr_turno"], r["cd_cargo"])
            agg[key]["qt_votos_nominais"] += r["qt_votos_nominais"]
            if key not in meta:
                meta[key] = {
                    "ra_codigo": r["ra_codigo"],
                    "ra_nome": r["ra_nome"],
                    "ano": r["ano"],
                    "nr_turno": r["nr_turno"],
                    "cd_cargo": r["cd_cargo"],
                    "ds_cargo": r["ds_cargo"],
                    "nr_candidato": r["nr_candidato"],
                    "nm_candidato": r["nm_candidato"],
                    "nm_urna_candidato": r["nm_urna_candidato"],
                    "sg_partido": r["sg_partido"],
                    "nm_partido": r["nm_partido"],
                    "ds_situacao_candidatura": r["ds_situacao_candidatura"],
                }
        
        result = []
        for key, totals in agg.items():
            row = dict(meta[key])
            row.update(totals)
            result.append(row)
        return result
    
    return records


def insert_into_db(records: list[dict], tipo: str, ano: int, dry_run: bool = False) -> int:
    """
    Insere os registros no banco MySQL/TiDB.
    Tabela: tse_resultados_candidato_ra (tipo=candidato) ou tse_resultados_secao (tipo=secao)
    """
    if dry_run:
        print(f"[DRY-RUN] {len(records)} registros seriam inseridos (tipo={tipo}, ano={ano})")
        if records:
            print(f"[DRY-RUN] Exemplo: {json.dumps(records[0], ensure_ascii=False, indent=2)}")
        return len(records)
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("[ERRO] DATABASE_URL não definida. Use --dry-run ou defina a variável.", file=sys.stderr)
        return 0
    
    try:
        import mysql.connector
        from urllib.parse import urlparse
        
        parsed = urlparse(db_url)
        conn = mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port or 3306,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path.lstrip("/"),
            ssl_disabled=False,
        )
        cursor = conn.cursor()
        
        if tipo == "candidato":
            table = "tse_resultados_candidato_ra"
            create_sql = f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ano INT NOT NULL,
                nr_turno TINYINT NOT NULL,
                ra_codigo VARCHAR(6) NOT NULL,
                ra_nome VARCHAR(100) NOT NULL,
                cd_cargo VARCHAR(10),
                ds_cargo VARCHAR(100),
                nr_candidato VARCHAR(20),
                nm_candidato VARCHAR(200),
                nm_urna_candidato VARCHAR(200),
                sg_partido VARCHAR(20),
                nm_partido VARCHAR(100),
                qt_votos_nominais INT DEFAULT 0,
                ds_situacao_candidatura VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_ra_cand_turno (ano, nr_turno, ra_codigo, nr_candidato, cd_cargo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            cursor.execute(create_sql)
            
            insert_sql = f"""
            INSERT INTO {table}
              (ano, nr_turno, ra_codigo, ra_nome, cd_cargo, ds_cargo,
               nr_candidato, nm_candidato, nm_urna_candidato,
               sg_partido, nm_partido, qt_votos_nominais, ds_situacao_candidatura)
            VALUES
              (%(ano)s, %(nr_turno)s, %(ra_codigo)s, %(ra_nome)s, %(cd_cargo)s, %(ds_cargo)s,
               %(nr_candidato)s, %(nm_candidato)s, %(nm_urna_candidato)s,
               %(sg_partido)s, %(nm_partido)s, %(qt_votos_nominais)s, %(ds_situacao_candidatura)s)
            ON DUPLICATE KEY UPDATE
              qt_votos_nominais = VALUES(qt_votos_nominais)
            """
        else:
            table = "tse_resultados_secao"
            create_sql = f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ano INT NOT NULL,
                nr_turno TINYINT NOT NULL,
                nr_zona INT NOT NULL,
                nr_secao VARCHAR(10),
                ra_codigo VARCHAR(6) NOT NULL,
                ra_nome VARCHAR(100) NOT NULL,
                cd_cargo VARCHAR(10),
                ds_cargo VARCHAR(100),
                nr_votavel VARCHAR(20),
                nm_votavel VARCHAR(200),
                qt_votos INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_zona_secao_votavel (ano, nr_turno, nr_zona, nr_secao, nr_votavel, cd_cargo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            cursor.execute(create_sql)
            
            insert_sql = f"""
            INSERT INTO {table}
              (ano, nr_turno, nr_zona, nr_secao, ra_codigo, ra_nome,
               cd_cargo, ds_cargo, nr_votavel, nm_votavel, qt_votos)
            VALUES
              (%(ano)s, %(nr_turno)s, %(nr_zona)s, %(nr_secao)s, %(ra_codigo)s, %(ra_nome)s,
               %(cd_cargo)s, %(ds_cargo)s, %(nr_votavel)s, %(nm_votavel)s, %(qt_votos)s)
            ON DUPLICATE KEY UPDATE
              qt_votos = VALUES(qt_votos)
            """
        
        # Inserir em lotes de 1000
        batch_size = 1000
        inserted = 0
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            cursor.executemany(insert_sql, batch)
            inserted += len(batch)
            print(f"\r[INFO] Inseridos: {inserted}/{len(records)}", end="", flush=True)
        
        conn.commit()
        print()
        cursor.close()
        conn.close()
        return inserted
        
    except Exception as e:
        print(f"\n[ERRO] Falha ao inserir no banco: {e}", file=sys.stderr)
        return 0


def print_summary(records: list[dict], tipo: str) -> None:
    """Imprime um resumo dos dados processados."""
    from collections import Counter
    
    print(f"\n{'='*60}")
    print(f"RESUMO — {len(records)} registros processados")
    print(f"{'='*60}")
    
    if tipo == "candidato":
        # Totais por RA
        ra_totals: dict = {}
        for r in records:
            ra = r["ra_codigo"]
            if ra not in ra_totals:
                ra_totals[ra] = {"nome": r["ra_nome"], "votos": 0, "candidatos": set()}
            ra_totals[ra]["votos"] += r.get("qt_votos_nominais", 0)
            ra_totals[ra]["candidatos"].add(r["nr_candidato"])
        
        print(f"\nVotos por RA (top 10):")
        for ra, info in sorted(ra_totals.items(), key=lambda x: x[1]["votos"], reverse=True)[:10]:
            print(f"  {ra} {info['nome']:25s}: {info['votos']:>10,} votos | {len(info['candidatos'])} candidatos")
        
        # Cargos
        cargos = Counter(r["ds_cargo"] for r in records)
        print(f"\nCargos:")
        for cargo, count in cargos.most_common():
            print(f"  {cargo}: {count} registros")
    
    elif tipo == "secao":
        zonas = Counter(r["nr_zona"] for r in records)
        print(f"\nZonas eleitorais: {len(zonas)}")
        for zona, count in sorted(zonas.items()):
            ra = ZONA_TO_RA.get(zona, {}).get("ra_nome", "?")
            print(f"  Zona {zona:2d} ({ra}): {count} seções")


def main():
    parser = argparse.ArgumentParser(
        description="ETL de dados eleitorais TSE para o CRIVO (Distrito Federal)"
    )
    parser.add_argument("--ano", type=int, default=2024,
                        help="Ano da eleição (padrão: 2024)")
    parser.add_argument("--tipo", choices=["candidato", "secao", "detalhe"],
                        default="candidato",
                        help="Tipo de arquivo TSE (padrão: candidato)")
    parser.add_argument("--arquivo", type=Path,
                        help="Caminho para o ZIP já baixado (evita download do CDN)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validar sem gravar no banco")
    parser.add_argument("--output-json", type=Path,
                        help="Salvar registros processados em JSON")
    parser.add_argument("--agregar-ra", action="store_true",
                        help="Agregar votos por RA antes de inserir no banco")
    args = parser.parse_args()
    
    print(f"[INFO] CRIVO ETL — TSE Dados Eleitorais DF")
    print(f"[INFO] Ano: {args.ano} | Tipo: {args.tipo} | Dry-run: {args.dry_run}")
    
    # Determinar arquivo ZIP
    zip_path = args.arquivo
    if zip_path is None:
        # Tentar baixar do CDN
        url_template = TSE_CDN_URLS.get(
            "secao_df" if args.tipo == "secao" else "candidato_munzona"
        )
        url = url_template.format(ano=args.ano)
        zip_path = Path(f"/tmp/tse_{args.tipo}_{args.ano}.zip")
        
        if not zip_path.exists():
            success = download_tse_zip(url, zip_path)
            if not success:
                print(f"\n[INSTRUÇÃO] Para baixar manualmente:", file=sys.stderr)
                print(f"  1. Acesse: https://dadosabertos.tse.jus.br/dataset/resultados-{args.ano}", file=sys.stderr)
                print(f"  2. Baixe o arquivo ZIP correspondente", file=sys.stderr)
                print(f"  3. Execute: python etl_tse_csv.py --arquivo /caminho/para/arquivo.zip --tipo {args.tipo} --ano {args.ano}", file=sys.stderr)
                sys.exit(1)
        else:
            print(f"[INFO] Usando arquivo em cache: {zip_path}")
    
    # Abrir ZIP e encontrar CSV do DF
    print(f"[INFO] Processando: {zip_path}")
    csv_content = find_df_csv_in_zip(zip_path, args.tipo)
    if csv_content is None:
        sys.exit(1)
    
    # Parsear registros
    if args.tipo == "candidato":
        records = parse_candidato_munzona(csv_content, args.ano)
    elif args.tipo == "secao":
        records = parse_votacao_secao(csv_content, args.ano)
    else:
        print(f"[ERRO] Tipo '{args.tipo}' ainda não implementado", file=sys.stderr)
        sys.exit(1)
    
    print(f"[INFO] Registros DF encontrados: {len(records)}")
    
    # Agregar por RA se solicitado
    if args.agregar_ra:
        records = aggregate_by_ra(records, args.tipo)
        print(f"[INFO] Registros após agregação por RA: {len(records)}")
    
    # Resumo
    print_summary(records, args.tipo)
    
    # Salvar JSON se solicitado
    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        print(f"[INFO] JSON salvo em: {args.output_json}")
    
    # Inserir no banco
    inserted = insert_into_db(records, args.tipo, args.ano, dry_run=args.dry_run)
    
    if args.dry_run:
        print(f"\n[OK] Dry-run concluído. {inserted} registros validados.")
    else:
        print(f"\n[OK] {inserted} registros inseridos no banco.")


if __name__ == "__main__":
    main()
