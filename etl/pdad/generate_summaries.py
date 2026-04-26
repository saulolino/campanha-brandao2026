#!/usr/bin/env python3
"""
CRIVO - Gerador de Resumos Estratégicos Territoriais
=====================================================
Gera resumos estratégicos para cada Região Administrativa do DF
a partir dos indicadores PDAD armazenados no banco de dados.

O resumo inclui:
  - Perfil socioeconômico
  - Vulnerabilidades identificadas
  - Oportunidades de política pública
  - Pautas eleitorais com maior ressonância
  - Alertas de comunicação territorial

Modo de operação:
  - Com LLM (OpenAI/Gemini): gera análises qualitativas aprofundadas
  - Sem LLM (fallback): usa lógica determinística baseada nos indicadores

Uso:
  python3 generate_summaries.py [--ra RA09] [--ano 2021] [--dry-run] [--no-llm]
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime
from typing import Optional
import mysql.connector
from mysql.connector import Error as MySQLError

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("generate_summaries")

# ---------------------------------------------------------------------------
# Conexão com banco
# ---------------------------------------------------------------------------

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL não definida.")
    import re
    match = re.match(r"mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", db_url)
    if not match:
        match = re.match(r"mysql://([^:]+):([^@]+)@([^/]+)/(.+)", db_url)
        if match:
            user, password, host, database = match.groups()
            port = 3306
        else:
            raise ValueError(f"DATABASE_URL inválida")
    else:
        user, password, host, port, database = match.groups()
        port = int(port)
    database = database.split("?")[0]
    return mysql.connector.connect(
        host=host, port=port, user=user, password=password,
        database=database, charset="utf8mb4", collation="utf8mb4_unicode_ci",
    )


# ---------------------------------------------------------------------------
# Busca indicadores de uma RA
# ---------------------------------------------------------------------------

def get_ra_indicators(conn, ra_codigo: str, ano: int) -> dict:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT indicador, categoria, valor, unidade FROM pdad_indicators "
        "WHERE ra_codigo = %s AND ano = %s",
        (ra_codigo, ano)
    )
    rows = cursor.fetchall()
    cursor.close()
    result = {}
    for row in rows:
        result[row["indicador"]] = {
            "valor": float(row["valor"]) if row["valor"] is not None else None,
            "unidade": row["unidade"],
            "categoria": row["categoria"],
        }
    return result


def get_all_ras(conn, ano: int) -> list:
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT DISTINCT ra_codigo, ra_nome FROM pdad_indicators WHERE ano = %s ORDER BY ra_codigo",
        (ano,)
    )
    rows = cursor.fetchall()
    cursor.close()
    return rows


# ---------------------------------------------------------------------------
# Geração de resumo determinístico (fallback sem LLM)
# ---------------------------------------------------------------------------

def classify_ra(ind: dict) -> tuple:
    """Retorna (classificacao, indice_vulnerabilidade)."""
    renda_pc = ind.get("renda_per_capita", {}).get("valor") or 0
    desemprego = ind.get("taxa_desemprego", {}).get("valor") or 0

    if renda_pc >= 5000:
        cls = "muito_alto"
        idx = 10 + desemprego * 0.5
    elif renda_pc >= 3000:
        cls = "alto"
        idx = 20 + desemprego * 0.8
    elif renda_pc >= 2000:
        cls = "medio_alto"
        idx = 30 + desemprego
    elif renda_pc >= 1500:
        cls = "medio"
        idx = 40 + desemprego * 1.2
    elif renda_pc >= 1000:
        cls = "medio_baixo"
        idx = 55 + desemprego * 1.5
    elif renda_pc >= 700:
        cls = "baixo"
        idx = 70 + desemprego * 1.8
    else:
        cls = "muito_baixo"
        idx = 85 + desemprego * 2

    return cls, round(min(100, max(0, idx)), 2)


def generate_deterministic_summary(ra_codigo: str, ra_nome: str, ind: dict) -> dict:
    """Gera resumo estratégico baseado em regras determinísticas."""

    def v(key: str) -> float:
        return ind.get(key, {}).get("valor") or 0

    pop = v("populacao_total")
    renda = v("renda_domiciliar_media")
    renda_pc = v("renda_per_capita")
    desemprego = v("taxa_desemprego")
    superior = v("escolaridade_superior")
    bolsa = v("beneficiarios_bolsa_familia_pct")
    agua = v("abastecimento_agua_rede_pct") or 100
    esgoto = v("esgotamento_rede_pct") or 100
    internet = v("acesso_internet_pct")
    jovens = v("populacao_0_14_pct")
    idosos = v("populacao_60_mais_pct")
    mulheres_chefes = v("chefes_mulheres_pct")

    cls, idx_vuln = classify_ra(ind)

    # --- Perfil socioeconômico ---
    perfil_parts = [
        f"{ra_nome} ({ra_codigo}) é uma Região Administrativa do Distrito Federal "
        f"com população estimada de {int(pop):,} habitantes e {int(v('domicilios_total')):,} domicílios.",
        f"A renda domiciliar média é de R$ {renda:,.2f} mensais, com renda per capita de R$ {renda_pc:,.2f}.",
        f"A taxa de desemprego é de {desemprego:.1f}% e {superior:.1f}% da população possui ensino superior.",
        f"A densidade domiciliar é de {v('densidade_domiciliar'):.2f} pessoas por domicílio.",
        f"Mulheres são chefes de família em {mulheres_chefes:.1f}% dos domicílios.",
        f"Classificação socioeconômica: {cls.replace('_', ' ')}.",
    ]
    perfil = " ".join(perfil_parts)

    # --- Vulnerabilidades ---
    vulns = []
    if desemprego > 18:
        vulns.append(f"desemprego crítico ({desemprego:.1f}%), muito acima da média distrital")
    elif desemprego > 14:
        vulns.append(f"taxa de desemprego elevada ({desemprego:.1f}%)")
    if bolsa > 15:
        vulns.append(f"alta dependência de programas de transferência de renda ({bolsa:.1f}% beneficiários do Bolsa Família)")
    elif bolsa > 8:
        vulns.append(f"dependência moderada de programas sociais ({bolsa:.1f}%)")
    if agua < 96:
        vulns.append(f"déficit crítico de abastecimento de água ({agua:.1f}% de cobertura)")
    elif agua < 99:
        vulns.append(f"cobertura incompleta de abastecimento de água ({agua:.1f}%)")
    if esgoto < 94:
        vulns.append(f"déficit crítico de esgotamento sanitário ({esgoto:.1f}%)")
    elif esgoto < 98:
        vulns.append(f"déficit de esgotamento sanitário ({esgoto:.1f}%)")
    if internet < 65:
        vulns.append(f"exclusão digital severa ({internet:.1f}% com acesso à internet)")
    elif internet < 75:
        vulns.append(f"baixo acesso à internet ({internet:.1f}%)")
    if superior < 10:
        vulns.append(f"baixíssima escolaridade superior ({superior:.1f}%), limitando mobilidade social")
    elif superior < 15:
        vulns.append(f"baixa escolaridade superior ({superior:.1f}%)")
    if jovens > 26:
        vulns.append(f"alta proporção de crianças e adolescentes ({jovens:.1f}%), gerando pressão sobre serviços de educação e saúde")

    vulnerabilidades = (
        "Principais vulnerabilidades identificadas: " + "; ".join(vulns) + "."
        if vulns else
        "Nenhuma vulnerabilidade crítica identificada nos indicadores disponíveis. "
        "A RA apresenta indicadores satisfatórios em todas as dimensões analisadas."
    )

    # --- Oportunidades de política pública ---
    opps = []
    if desemprego > 12:
        opps.append("programas de qualificação profissional, capacitação técnica e geração de emprego e renda")
    if bolsa > 8:
        opps.append("expansão de programas de inclusão produtiva e empreendedorismo popular")
    if agua < 99 or esgoto < 97:
        opps.append("investimento em infraestrutura de saneamento básico (água, esgoto e drenagem)")
    if internet < 80:
        opps.append("programas de inclusão digital, telecentros e conectividade comunitária")
    if superior < 20:
        opps.append("ampliação do acesso ao ensino superior, técnico e profissionalizante")
    if jovens > 20:
        opps.append("equipamentos e programas voltados à infância e juventude (creches, escolas, esporte e cultura)")
    if idosos > 15:
        opps.append("serviços de saúde, lazer e assistência social para a população idosa")
    if mulheres_chefes > 42:
        opps.append("políticas de apoio a famílias chefiadas por mulheres (creches, microcrédito, capacitação)")

    oportunidades = (
        "Oportunidades prioritárias de política pública: " + "; ".join(opps) + "."
        if opps else
        "Região com indicadores satisfatórios. Foco em manutenção da qualidade dos serviços "
        "e inovação na gestão pública para elevar ainda mais o padrão de vida."
    )

    # --- Pautas eleitorais ---
    pautas = []
    if desemprego > 15:
        pautas.append("emprego, trabalho e geração de renda — pauta prioritária")
    if bolsa > 10:
        pautas.append("proteção social, assistência às famílias e combate à pobreza")
    if agua < 98 or esgoto < 97:
        pautas.append("saneamento básico, infraestrutura urbana e habitação")
    if internet < 75:
        pautas.append("inclusão digital, tecnologia e acesso à informação")
    if jovens > 22:
        pautas.append("educação pública de qualidade, juventude e oportunidades para jovens")
    if idosos > 15:
        pautas.append("saúde, qualidade de vida e direitos da terceira idade")
    if superior > 40:
        pautas.append("inovação, ciência, tecnologia e economia do conhecimento")
    if renda > 8000:
        pautas.append("segurança pública, mobilidade urbana e qualidade de vida")
    if mulheres_chefes > 42:
        pautas.append("igualdade de gênero, direitos das mulheres e políticas de cuidado")

    pautas_eleitorais = (
        f"Pautas com maior ressonância eleitoral em {ra_nome}: " + "; ".join(pautas) + "."
        if pautas else
        "Pautas transversais de gestão eficiente, qualidade dos serviços públicos e bem-estar social."
    )

    # --- Alertas de comunicação ---
    alertas = []
    if bolsa > 15:
        alertas.append(
            "⚠️ ATENÇÃO: alta concentração de beneficiários de programas sociais — "
            "discurso deve ser empático, propositivo e evitar estigmatização"
        )
    if desemprego > 18:
        alertas.append(
            "🚨 ALERTA: desemprego em nível crítico — "
            "evitar narrativas de prosperidade sem propostas concretas e verificáveis"
        )
    if internet < 65:
        alertas.append(
            "📡 ATENÇÃO: baixa conectividade digital — "
            "priorizar comunicação presencial, panfletagem, rádio comunitária e TV aberta"
        )
    if jovens > 25:
        alertas.append(
            "👥 OPORTUNIDADE: população jovem expressiva — "
            "conteúdo deve contemplar linguagem, plataformas e pautas da juventude"
        )
    if idosos > 18:
        alertas.append(
            "👴 OPORTUNIDADE: população idosa significativa — "
            "comunicação deve incluir formatos acessíveis (letra grande, áudio, presencial)"
        )
    if superior > 50:
        alertas.append(
            "🎓 NOTA: alta escolaridade — "
            "público exige profundidade, evidências e consistência nos argumentos"
        )
    if mulheres_chefes > 44:
        alertas.append(
            "👩 OPORTUNIDADE: alta proporção de mulheres chefes de família — "
            "pautas de cuidado, segurança e autonomia feminina têm alto potencial de engajamento"
        )
    if idx_vuln > 70:
        alertas.append(
            "🔴 VULNERABILIDADE ALTA: região com índice de vulnerabilidade elevado — "
            "abordagem deve ser sensível ao contexto de privação e urgência social"
        )

    alertas_comunicacao = (
        " | ".join(alertas)
        if alertas else
        "✅ Perfil comunicacional padrão. Adaptar mensagem ao contexto socioeconômico da RA."
    )

    return {
        "perfil_socioeconomico": perfil,
        "vulnerabilidades": vulnerabilidades,
        "oportunidades": oportunidades,
        "pautas_eleitorais": pautas_eleitorais,
        "alertas_comunicacao": alertas_comunicacao,
        "indice_vulnerabilidade": idx_vuln,
        "classificacao": cls,
    }


# ---------------------------------------------------------------------------
# Geração de resumo com LLM (OpenAI/Gemini)
# ---------------------------------------------------------------------------

def generate_llm_summary(ra_codigo: str, ra_nome: str, ind: dict) -> Optional[dict]:
    """Gera resumo aprofundado usando LLM via OpenAI API."""
    try:
        from openai import OpenAI
        client = OpenAI()

        # Prepara contexto dos indicadores
        ind_text = "\n".join([
            f"  - {k}: {v['valor']} {v.get('unidade','')}"
            for k, v in sorted(ind.items())
            if v.get('valor') is not None
        ])

        prompt = f"""Você é um analista de dados socioeconômicos e estrategista político especializado no Distrito Federal.

Com base nos indicadores da PDAD 2021 para {ra_nome} ({ra_codigo}), produza uma análise estratégica territorial estruturada.

INDICADORES DISPONÍVEIS:
{ind_text}

Produza uma análise em JSON com exatamente estes campos:
1. "perfil_socioeconomico": Parágrafo descritivo do perfil da RA (3-4 frases)
2. "vulnerabilidades": Principais vulnerabilidades sociais e econômicas identificadas (2-4 itens)
3. "oportunidades": Oportunidades prioritárias de política pública (2-4 itens)
4. "pautas_eleitorais": Temas e pautas com maior ressonância eleitoral nesta RA (3-5 itens)
5. "alertas_comunicacao": Alertas estratégicos para comunicação política territorial (2-3 itens)

Responda APENAS com o JSON, sem texto adicional."""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000,
        )

        content = response.choices[0].message.content.strip()
        # Remove markdown code blocks se presentes
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        data = json.loads(content)

        # Adiciona campos calculados deterministicamente
        cls, idx_vuln = classify_ra(ind)
        data["indice_vulnerabilidade"] = idx_vuln
        data["classificacao"] = cls

        return data

    except Exception as e:
        log.warning(f"Falha ao gerar resumo LLM para {ra_codigo}: {e}")
        return None


# ---------------------------------------------------------------------------
# Persistência do resumo
# ---------------------------------------------------------------------------

UPSERT_SUMMARY_SQL = """
INSERT INTO pdad_ra_summaries
    (ano, ra_codigo, ra_nome, perfil_socioeconomico, vulnerabilidades,
     oportunidades, pautas_eleitorais, alertas_comunicacao,
     indice_vulnerabilidade, classificacao, gerado_por)
VALUES
    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE
    perfil_socioeconomico  = VALUES(perfil_socioeconomico),
    vulnerabilidades       = VALUES(vulnerabilidades),
    oportunidades          = VALUES(oportunidades),
    pautas_eleitorais      = VALUES(pautas_eleitorais),
    alertas_comunicacao    = VALUES(alertas_comunicacao),
    indice_vulnerabilidade = VALUES(indice_vulnerabilidade),
    classificacao          = VALUES(classificacao),
    gerado_por             = VALUES(gerado_por),
    updated_at             = CURRENT_TIMESTAMP
"""


def save_summary(conn, ano: int, ra_codigo: str, ra_nome: str, summary: dict, gerado_por: str) -> bool:
    cursor = conn.cursor()
    try:
        cursor.execute(UPSERT_SUMMARY_SQL, (
            ano,
            ra_codigo,
            ra_nome,
            summary.get("perfil_socioeconomico"),
            summary.get("vulnerabilidades"),
            summary.get("oportunidades"),
            summary.get("pautas_eleitorais"),
            summary.get("alertas_comunicacao"),
            summary.get("indice_vulnerabilidade"),
            summary.get("classificacao"),
            gerado_por,
        ))
        conn.commit()
        cursor.close()
        return True
    except MySQLError as e:
        log.error(f"Erro ao salvar resumo para {ra_codigo}: {e}")
        cursor.close()
        return False


# ---------------------------------------------------------------------------
# Ponto de entrada
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Gerador de Resumos Estratégicos PDAD/CRIVO")
    parser.add_argument("--ra", type=str, help="Processar apenas uma RA específica (ex: RA09)")
    parser.add_argument("--ano", type=int, default=2021, help="Ano de referência")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem gravar no banco")
    parser.add_argument("--no-llm", action="store_true", help="Usa apenas lógica determinística (sem LLM)")
    parser.add_argument("--output-json", type=str, help="Salva resumos em arquivo JSON")
    args = parser.parse_args()

    log.info("=" * 60)
    log.info(f"CRIVO - Gerador de Resumos Estratégicos PDAD {args.ano}")
    log.info("=" * 60)

    try:
        conn = get_db_connection()
        log.info("Conexão com banco estabelecida.")
    except Exception as e:
        log.error(f"Falha na conexão: {e}")
        sys.exit(1)

    # Lista de RAs a processar
    if args.ra:
        ras = [{"ra_codigo": args.ra.upper(), "ra_nome": ""}]
        # Busca nome da RA
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT DISTINCT ra_nome FROM pdad_indicators WHERE ra_codigo = %s AND ano = %s LIMIT 1",
            (args.ra.upper(), args.ano)
        )
        row = cursor.fetchone()
        cursor.close()
        if row:
            ras[0]["ra_nome"] = row["ra_nome"]
    else:
        ras = get_all_ras(conn, args.ano)

    log.info(f"Processando {len(ras)} RAs...")

    all_summaries = {}
    success_count = 0

    for ra in ras:
        ra_codigo = ra["ra_codigo"]
        ra_nome = ra["ra_nome"]

        log.info(f"Gerando resumo para {ra_codigo} - {ra_nome}...")

        # Busca indicadores
        ind = get_ra_indicators(conn, ra_codigo, args.ano)
        if not ind:
            log.warning(f"Nenhum indicador encontrado para {ra_codigo}")
            continue

        # Tenta LLM primeiro, fallback determinístico
        summary = None
        gerado_por = "crivo-deterministic"

        if not args.no_llm and os.getenv("OPENAI_API_KEY"):
            summary = generate_llm_summary(ra_codigo, ra_nome, ind)
            if summary:
                gerado_por = "crivo-llm-gpt4"

        if not summary:
            summary = generate_deterministic_summary(ra_codigo, ra_nome, ind)

        all_summaries[ra_codigo] = {
            "ra_codigo": ra_codigo,
            "ra_nome": ra_nome,
            "ano": args.ano,
            "gerado_por": gerado_por,
            **summary,
        }

        if args.dry_run:
            log.info(f"[DRY-RUN] {ra_codigo}: resumo gerado (não salvo)")
            log.info(f"  Classificação: {summary['classificacao']}")
            log.info(f"  Índice vulnerabilidade: {summary['indice_vulnerabilidade']}")
        else:
            if save_summary(conn, args.ano, ra_codigo, ra_nome, summary, gerado_por):
                success_count += 1
                log.info(f"  ✓ Salvo | Classificação: {summary['classificacao']} | Vulnerabilidade: {summary['indice_vulnerabilidade']}")
            else:
                log.error(f"  ✗ Falha ao salvar {ra_codigo}")

    # Salva JSON se solicitado
    if args.output_json:
        with open(args.output_json, "w", encoding="utf-8") as f:
            json.dump(all_summaries, f, ensure_ascii=False, indent=2)
        log.info(f"Resumos salvos em: {args.output_json}")

    conn.close()

    if not args.dry_run:
        log.info(f"\nConcluído: {success_count}/{len(ras)} resumos salvos com sucesso.")
    else:
        log.info(f"\n[DRY-RUN] {len(all_summaries)} resumos gerados (nenhum salvo).")

    return all_summaries


if __name__ == "__main__":
    main()
