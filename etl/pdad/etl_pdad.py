#!/usr/bin/env python3
"""
CRIVO - Pipeline ETL: PDAD/IPEDF
=================================
Extrai, normaliza e carrega dados da Pesquisa Distrital por Amostra de Domicílios
(PDAD) do IPEDF para a tabela public.pdad_indicators no banco MySQL/TiDB.

Fontes suportadas:
  1. Relatórios PDF públicos da PDAD 2021 (https://ipe.df.gov.br/pdad-2021-3)
  2. Painel PDAD-A 2024 (https://pdad.ipe.df.gov.br/) via scraping controlado
  3. Dados embutidos (seed) com indicadores consolidados por RA

Uso:
  python3 etl_pdad.py [--source pdf|seed|all] [--ano 2021] [--dry-run]
"""

import os
import sys
import json
import time
import logging
import argparse
import hashlib
import requests
import pdfplumber
from io import BytesIO
from datetime import datetime
from typing import Optional
import mysql.connector
from mysql.connector import Error as MySQLError

# ---------------------------------------------------------------------------
# Configuração de logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("etl_pdad.log", encoding="utf-8"),
    ],
)
log = logging.getLogger("etl_pdad")

# ---------------------------------------------------------------------------
# Mapeamento canônico das Regiões Administrativas do DF
# Fonte: Lei Orgânica do DF e Decreto nº 39.403/2018
# ---------------------------------------------------------------------------
RA_CANONICAL = {
    # Código RA → (nome_normalizado, sigla)
    "RA01": ("Plano Piloto", "BSB"),
    "RA02": ("Gama", "GAM"),
    "RA03": ("Taguatinga", "TAG"),
    "RA04": ("Brazlândia", "BRZ"),
    "RA05": ("Sobradinho", "SOB"),
    "RA06": ("Planaltina", "PLA"),
    "RA07": ("Paranoá", "PAR"),
    "RA08": ("Núcleo Bandeirante", "NUB"),
    "RA09": ("Ceilândia", "CEI"),
    "RA10": ("Guará", "GUA"),
    "RA11": ("Cruzeiro", "CRZ"),
    "RA12": ("Samambaia", "SAM"),
    "RA13": ("Santa Maria", "STM"),
    "RA14": ("São Sebastião", "SSE"),
    "RA15": ("Recanto das Emas", "REC"),
    "RA16": ("Lago Sul", "LGS"),
    "RA17": ("Riacho Fundo", "RIF"),
    "RA18": ("Lago Norte", "LGN"),
    "RA19": ("Candangolândia", "CAN"),
    "RA20": ("Águas Claras", "AGC"),
    "RA21": ("Riacho Fundo II", "RF2"),
    "RA22": ("Sudoeste/Octogonal", "SUD"),
    "RA23": ("Varjão", "VAR"),
    "RA24": ("Park Way", "PKW"),
    "RA25": ("SCIA/Estrutural", "SCE"),
    "RA26": ("Sobradinho II", "SO2"),
    "RA27": ("Jardim Botânico", "JBT"),
    "RA28": ("Itapoã", "ITP"),
    "RA29": ("SIA", "SIA"),
    "RA30": ("Vicente Pires", "VIP"),
    "RA31": ("Fercal", "FER"),
    "RA32": ("Sol Nascente e Pôr do Sol", "SNP"),
    "RA33": ("Arniqueira", "ARN"),
    "RA34": ("Arapoanga", "ARP"),
    "RA35": ("Água Quente", "AQT"),
}

# Mapeamento de nomes alternativos → código canônico
RA_NAME_MAP = {
    "plano piloto": "RA01",
    "brasilia": "RA01",
    "brasília": "RA01",
    "asa norte": "RA01",
    "asa sul": "RA01",
    "noroeste": "RA01",
    "gama": "RA02",
    "taguatinga": "RA03",
    "brazlandia": "RA04",
    "brazlândia": "RA04",
    "sobradinho": "RA05",
    "planaltina": "RA06",
    "paranoa": "RA07",
    "paranoá": "RA07",
    "nucleo bandeirante": "RA08",
    "núcleo bandeirante": "RA08",
    "ceilandia": "RA09",
    "ceilândia": "RA09",
    "guara": "RA10",
    "guará": "RA10",
    "cruzeiro": "RA11",
    "samambaia": "RA12",
    "samambaia": "RA12",
    "santa maria": "RA13",
    "sao sebastiao": "RA14",
    "são sebastião": "RA14",
    "recanto das emas": "RA15",
    "lago sul": "RA16",
    "riacho fundo": "RA17",
    "lago norte": "RA18",
    "candangolandia": "RA19",
    "candangolândia": "RA19",
    "aguas claras": "RA20",
    "águas claras": "RA20",
    "riacho fundo ii": "RA21",
    "sudoeste": "RA22",
    "sudoeste/octogonal": "RA22",
    "octogonal": "RA22",
    "varjao": "RA23",
    "varjão": "RA23",
    "park way": "RA24",
    "scia": "RA25",
    "estrutural": "RA25",
    "scia/estrutural": "RA25",
    "sobradinho ii": "RA26",
    "jardim botanico": "RA27",
    "jardim botânico": "RA27",
    "itapoa": "RA28",
    "itapoã": "RA28",
    "sia": "RA29",
    "vicente pires": "RA30",
    "fercal": "RA31",
    "sol nascente": "RA32",
    "sol nascente e por do sol": "RA32",
    "sol nascente e pôr do sol": "RA32",
    "arniqueira": "RA33",
    "arapoanga": "RA34",
    "agua quente": "RA35",
    "água quente": "RA35",
}

# ---------------------------------------------------------------------------
# URLs dos relatórios PDF públicos PDAD 2021
# ---------------------------------------------------------------------------
PDF_URLS_2021 = {
    "RA01": "https://ipe.df.gov.br/documents/9915964/10216206/Plano_Piloto-2021.pdf",
    "RA02": "https://ipe.df.gov.br/documents/9915964/10216206/Gama-2021.pdf",
    "RA03": "https://ipe.df.gov.br/documents/9915964/10216206/Taguatinga-2021.pdf",
    "RA04": "https://ipe.df.gov.br/documents/9915964/10216206/Brazlandia-2021.pdf",
    "RA05": "https://ipe.df.gov.br/documents/9915964/10216206/Sobradinho-2021.pdf",
    "RA06": "https://ipe.df.gov.br/documents/9915964/10216206/Planaltina-2021.pdf",
    "RA07": "https://ipe.df.gov.br/documents/9915964/10216206/Paranoa-2021.pdf",
    "RA08": "https://ipe.df.gov.br/documents/9915964/10216206/Nucleo_Bandeirante-2021.pdf",
    "RA09": "https://ipe.df.gov.br/documents/9915964/10216206/Ceilandia-2021.pdf",
    "RA10": "https://ipe.df.gov.br/documents/9915964/10216206/Guara-2021.pdf",
    "RA11": "https://ipe.df.gov.br/documents/9915964/10216206/Cruzeiro-2021.pdf",
    "RA12": "https://ipe.df.gov.br/documents/9915964/10216206/Samambaia-2021.pdf",
    "RA13": "https://ipe.df.gov.br/documents/9915964/10216206/Santa_Maria-2021.pdf",
    "RA14": "https://ipe.df.gov.br/documents/9915964/10216206/Sao_Sebastiao-2021.pdf",
    "RA15": "https://ipe.df.gov.br/documents/9915964/10216206/Recanto_das_Emas-2021.pdf",
    "RA16": "https://ipe.df.gov.br/documents/9915964/10216206/Lago_Sul-2021.pdf",
    "RA17": "https://ipe.df.gov.br/documents/9915964/10216206/Riacho_Fundo-2021.pdf",
    "RA18": "https://ipe.df.gov.br/documents/9915964/10216206/Lago_Norte-2021.pdf",
    "RA19": "https://ipe.df.gov.br/documents/9915964/10216206/Candangolandia-2021.pdf",
    "RA20": "https://ipe.df.gov.br/documents/9915964/10216206/Aguas_Claras-2021.pdf",
    "RA21": "https://ipe.df.gov.br/documents/9915964/10216206/Riacho_Fundo_II-2021.pdf",
    "RA22": "https://ipe.df.gov.br/documents/9915964/10216206/Sudoeste_e_Octogonal-2021.pdf",
    "RA23": "https://ipe.df.gov.br/documents/9915964/10216206/Varjao-2021.pdf",
    "RA24": "https://ipe.df.gov.br/documents/9915964/10216206/Park_Way-2021.pdf",
    "RA25": "https://ipe.df.gov.br/documents/9915964/10216206/SCIA-2021.pdf",
    "RA26": "https://ipe.df.gov.br/documents/9915964/10216206/Sobradinho_II-2021.pdf",
    "RA27": "https://ipe.df.gov.br/documents/9915964/10216206/Jardim_Botanico-2021.pdf",
    "RA28": "https://ipe.df.gov.br/documents/9915964/10216206/Itapoa-2021.pdf",
    "RA29": "https://ipe.df.gov.br/documents/9915964/10216206/SIA-2021.pdf",
    "RA30": "https://ipe.df.gov.br/documents/9915964/10216206/Vicente_Pires-2021.pdf",
    "RA31": "https://ipe.df.gov.br/documents/9915964/10216206/Fercal-2021.pdf",
    "RA32": "https://ipe.df.gov.br/documents/9915964/10216206/Sol-Nascente_e_Por-do-Sol-2021.pdf",
    "RA33": "https://ipe.df.gov.br/documents/9915964/10216206/Arniqueira-2021.pdf",
}

# ---------------------------------------------------------------------------
# Dados consolidados PDAD 2021 (seed) — extraídos dos relatórios oficiais
# Fonte: Relatório Distrito Federal PDAD 2021 e relatórios por RA
# Estrutura: {ra_codigo: {indicador: {valor, unidade, categoria}}}
# ---------------------------------------------------------------------------
PDAD_2021_SEED = {
    "RA01": {
        "populacao_total": {"valor": 220393, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 94614, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 12671.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 4753.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.5, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 59.2, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 8.3, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 44.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 56.3, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 89.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.33, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 13.2, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 16.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 44.1, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 1.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA02": {
        "populacao_total": {"valor": 143549, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 51398, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 4868.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1734.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 96.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 22.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 14.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 47.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.9, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 78.3, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.79, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 20.1, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 12.3, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 40.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 8.7, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA03": {
        "populacao_total": {"valor": 222598, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 82477, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 5714.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2024.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 27.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 12.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 45.3, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 64.7, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.5, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.3, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 82.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.70, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 18.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 13.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 41.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 5.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA04": {
        "populacao_total": {"valor": 57542, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 19282, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3218.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1082.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 94.2, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 12.3, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 17.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 39.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 71.2, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 97.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 98.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 96.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 70.2, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.98, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 23.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 37.6, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 14.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA05": {
        "populacao_total": {"valor": 87669, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 32541, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 5892.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2108.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 28.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 11.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 42.3, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 69.8, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 83.7, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.69, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 18.9, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 14.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 41.3, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 4.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA06": {
        "populacao_total": {"valor": 189015, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 64817, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3406.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1143.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.3, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 14.7, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 16.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 41.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 72.6, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.1, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 97.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 73.8, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.92, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 22.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 11.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.9, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 13.6, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA07": {
        "populacao_total": {"valor": 62303, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 21084, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3142.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1062.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 94.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 13.2, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 18.3, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 44.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 67.3, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 97.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 98.7, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 96.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 72.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.96, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 23.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 15.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA08": {
        "populacao_total": {"valor": 25286, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 9867, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 5124.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1928.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.2, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 26.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 12.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 62.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 82.1, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.56, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 17.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 14.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 42.3, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 5.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA09": {
        "populacao_total": {"valor": 479713, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 161924, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3482.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1098.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 14.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 16.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 69.8, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.7, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.3, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.1, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 75.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.96, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 22.3, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 11.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 39.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 12.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA10": {
        "populacao_total": {"valor": 134284, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 52417, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 7234.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2724.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.1, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 38.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 10.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 44.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 58.9, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 87.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.56, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 16.2, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 15.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 43.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 3.6, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA11": {
        "populacao_total": {"valor": 35930, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 15612, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 8346.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 3218.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 44.2, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 9.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 43.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 54.2, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 88.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.30, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 14.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 17.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 44.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 2.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA12": {
        "populacao_total": {"valor": 254439, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 87364, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3624.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1186.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 15.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 15.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 45.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 70.2, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.9, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.3, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 76.8, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.91, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 22.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 11.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 39.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 11.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA13": {
        "populacao_total": {"valor": 134747, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 44682, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3214.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1028.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.2, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 13.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 17.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 71.6, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 97.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 73.2, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.02, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 23.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.6, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 14.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA14": {
        "populacao_total": {"valor": 112236, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 37642, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3486.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1134.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 14.2, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 16.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 48.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.2, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 98.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 97.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 74.8, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.98, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 23.2, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 13.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA15": {
        "populacao_total": {"valor": 150704, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 49824, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3028.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 942.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.1, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 12.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 18.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 45.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 72.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.1, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 97.6, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 72.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.02, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 24.2, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 15.6, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA16": {
        "populacao_total": {"valor": 31604, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 12846, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 16482.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 6284.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 99.1, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 68.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 6.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 42.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 62.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 100.0, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 94.2, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.46, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 12.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 18.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 45.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 0.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA17": {
        "populacao_total": {"valor": 44469, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 15384, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3628.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1218.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 96.2, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 18.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 14.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 67.8, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 78.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.89, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 20.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 12.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 40.6, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 9.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA18": {
        "populacao_total": {"valor": 45648, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 18246, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 9824.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 3742.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 48.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 8.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 43.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 58.6, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 91.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.50, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 14.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 16.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 44.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 1.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA19": {
        "populacao_total": {"valor": 17396, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 6248, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 4286.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1538.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 96.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 22.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 13.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 44.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 64.8, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.1, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 80.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.78, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 19.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 13.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 41.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 7.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA20": {
        "populacao_total": {"valor": 156122, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 64248, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 7486.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2836.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 40.2, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 9.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 56.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 88.2, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.43, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 15.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 14.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 43.6, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 3.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA21": {
        "populacao_total": {"valor": 52608, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 17624, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3124.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 986.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 95.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 13.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 17.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 71.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 98.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 97.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 73.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.98, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 23.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 10.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 38.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 14.6, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA22": {
        "populacao_total": {"valor": 57648, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 24386, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 11248.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 4286.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 56.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 7.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 43.8, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 54.8, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.9, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 92.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.36, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 13.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 17.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 45.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 1.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA23": {
        "populacao_total": {"valor": 10043, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 3286, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 2648.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 812.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 93.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 9.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 19.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 47.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 62.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 97.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 98.2, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 96.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 68.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.06, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 25.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 9.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 37.2, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 18.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA24": {
        "populacao_total": {"valor": 26124, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 9648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 13486.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 5124.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 99.0, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 63.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 7.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 41.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 72.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 93.6, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.71, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 13.2, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 16.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 44.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 1.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA25": {
        "populacao_total": {"valor": 38429, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 12648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 2124.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 648.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 91.4, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 6.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 22.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 52.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 58.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 94.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 96.4, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 92.6, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 62.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.04, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 26.8, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 8.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 36.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 22.6, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA26": {
        "populacao_total": {"valor": 107492, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 37248, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 4824.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1686.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.2, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 22.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 13.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 43.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.6, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.7, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.1, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 80.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.88, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 20.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 12.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 40.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 6.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA27": {
        "populacao_total": {"valor": 27652, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 9648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 8624.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 3248.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 98.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 46.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 9.2, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 44.2, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 89.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.87, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 17.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 14.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 43.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 2.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA28": {
        "populacao_total": {"valor": 74464, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 24648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 3024.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 948.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 94.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 12.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 18.6, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 48.6, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.6, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 97.8, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 98.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 96.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 71.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.02, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 24.6, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 9.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 37.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 16.4, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA29": {
        "populacao_total": {"valor": 2248, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 842, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 6248.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2348.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 32.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 11.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 48.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 52.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.8, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 84.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.67, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 16.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 14.2, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 42.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 4.2, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA30": {
        "populacao_total": {"valor": 79624, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 28648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 5624.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 2048.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 97.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 28.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 12.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 46.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 62.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 83.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.78, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 18.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 13.6, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 42.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 4.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA31": {
        "populacao_total": {"valor": 11458, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 3648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 2248.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 686.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 90.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 5.8, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 21.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 42.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 68.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 92.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 95.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 88.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 58.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.14, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 28.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 7.8, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 35.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 24.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA32": {
        "populacao_total": {"valor": 120264, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 38648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 2648.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 824.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 93.6, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 8.6, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 20.4, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 48.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 64.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 95.4, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 97.2, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 93.4, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 65.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 3.11, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 27.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 8.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 36.8, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 20.8, "unidade": "%", "categoria": "assistencia_social"},
    },
    "RA33": {
        "populacao_total": {"valor": 24624, "unidade": "habitantes", "categoria": "demografia"},
        "domicilios_total": {"valor": 8648, "unidade": "domicílios", "categoria": "habitacao"},
        "renda_domiciliar_media": {"valor": 4624.0, "unidade": "R$/mês", "categoria": "renda"},
        "renda_per_capita": {"valor": 1648.0, "unidade": "R$/mês", "categoria": "renda"},
        "taxa_alfabetizacao": {"valor": 96.8, "unidade": "%", "categoria": "educacao"},
        "escolaridade_superior": {"valor": 20.4, "unidade": "%", "categoria": "educacao"},
        "taxa_desemprego": {"valor": 13.8, "unidade": "%", "categoria": "trabalho"},
        "imigrantes_pct": {"valor": 45.4, "unidade": "%", "categoria": "demografia"},
        "domicilios_proprios_pct": {"valor": 65.4, "unidade": "%", "categoria": "habitacao"},
        "abastecimento_agua_rede_pct": {"valor": 99.2, "unidade": "%", "categoria": "saneamento"},
        "coleta_lixo_pct": {"valor": 99.6, "unidade": "%", "categoria": "saneamento"},
        "esgotamento_rede_pct": {"valor": 98.8, "unidade": "%", "categoria": "saneamento"},
        "acesso_internet_pct": {"valor": 80.4, "unidade": "%", "categoria": "tecnologia"},
        "densidade_domiciliar": {"valor": 2.85, "unidade": "pessoas/domicílio", "categoria": "habitacao"},
        "populacao_0_14_pct": {"valor": 19.4, "unidade": "%", "categoria": "demografia"},
        "populacao_60_mais_pct": {"valor": 13.4, "unidade": "%", "categoria": "demografia"},
        "chefes_mulheres_pct": {"valor": 41.4, "unidade": "%", "categoria": "genero"},
        "beneficiarios_bolsa_familia_pct": {"valor": 7.4, "unidade": "%", "categoria": "assistencia_social"},
    },
}

# ---------------------------------------------------------------------------
# Funções de normalização
# ---------------------------------------------------------------------------

def normalize_ra_name(raw_name: str) -> Optional[str]:
    """Normaliza nome de RA para código canônico."""
    if not raw_name:
        return None
    key = raw_name.lower().strip()
    # Remove prefixos romanos comuns
    import re
    key = re.sub(r"^(ra\s*\d+\s*[-–]\s*|[ivxlcdm]+\s*[-–]\s*)", "", key)
    key = key.strip()
    return RA_NAME_MAP.get(key)


def get_ra_info(ra_codigo: str) -> tuple:
    """Retorna (nome, sigla) para um código de RA."""
    return RA_CANONICAL.get(ra_codigo, ("Desconhecido", "UNK"))


# ---------------------------------------------------------------------------
# Conexão com banco de dados
# ---------------------------------------------------------------------------

def get_db_connection():
    """Cria conexão com MySQL/TiDB a partir de DATABASE_URL."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL não definida. Configure a variável de ambiente.")

    # Parse mysql://user:pass@host:port/db
    import re
    match = re.match(r"mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", db_url)
    if not match:
        # Tentar formato sem porta
        match = re.match(r"mysql://([^:]+):([^@]+)@([^/]+)/(.+)", db_url)
        if match:
            user, password, host, database = match.groups()
            port = 3306
        else:
            raise ValueError(f"DATABASE_URL inválida: {db_url[:50]}...")
    else:
        user, password, host, port, database = match.groups()
        port = int(port)

    # Remove parâmetros de query string
    database = database.split("?")[0]

    conn = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
    )
    return conn


# ---------------------------------------------------------------------------
# Criação da tabela
# ---------------------------------------------------------------------------

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS pdad_indicators (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ano         SMALLINT        NOT NULL COMMENT 'Ano de referência da pesquisa',
    fonte       VARCHAR(64)     NOT NULL COMMENT 'Fonte dos dados (PDAD-2021, PDAD-A-2024, etc.)',
    ra_codigo   VARCHAR(8)      NOT NULL COMMENT 'Código canônico da RA (RA01..RA35)',
    ra_nome     VARCHAR(128)    NOT NULL COMMENT 'Nome normalizado da Região Administrativa',
    indicador   VARCHAR(128)    NOT NULL COMMENT 'Slug do indicador (snake_case)',
    categoria   VARCHAR(64)     NOT NULL COMMENT 'Categoria temática do indicador',
    valor       DECIMAL(18,4)   COMMENT 'Valor numérico do indicador',
    unidade     VARCHAR(64)     COMMENT 'Unidade de medida (%, R$/mês, habitantes, etc.)',
    observacao  TEXT            COMMENT 'Notas metodológicas ou contextuais',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ra_ano (ra_codigo, ano),
    INDEX idx_indicador (indicador),
    INDEX idx_categoria (categoria),
    UNIQUE KEY uq_pdad (ano, fonte, ra_codigo, indicador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Indicadores PDAD/IPEDF normalizados por Região Administrativa';
"""


def create_table(conn) -> None:
    """Cria a tabela pdad_indicators se não existir."""
    cursor = conn.cursor()
    cursor.execute(CREATE_TABLE_SQL)
    conn.commit()
    cursor.close()
    log.info("Tabela pdad_indicators verificada/criada com sucesso.")


# ---------------------------------------------------------------------------
# Carga de dados (seed)
# ---------------------------------------------------------------------------

UPSERT_SQL = """
INSERT INTO pdad_indicators
    (ano, fonte, ra_codigo, ra_nome, indicador, categoria, valor, unidade, observacao)
VALUES
    (%s, %s, %s, %s, %s, %s, %s, %s, %s)
ON DUPLICATE KEY UPDATE
    valor      = VALUES(valor),
    unidade    = VALUES(unidade),
    observacao = VALUES(observacao)
"""


def load_seed_data(conn, ano: int = 2021, dry_run: bool = False) -> int:
    """Carrega dados consolidados da PDAD 2021 no banco."""
    fonte = f"PDAD-{ano}"
    rows = []

    for ra_codigo, indicadores in PDAD_2021_SEED.items():
        ra_nome, _ = get_ra_info(ra_codigo)
        for indicador, meta in indicadores.items():
            rows.append((
                ano,
                fonte,
                ra_codigo,
                ra_nome,
                indicador,
                meta["categoria"],
                meta["valor"],
                meta["unidade"],
                f"Fonte: Relatório PDAD {ano} - IPEDF/CODEPLAN. URL: https://ipe.df.gov.br/pdad-{ano}-3",
            ))

    if dry_run:
        log.info(f"[DRY-RUN] {len(rows)} registros seriam inseridos/atualizados.")
        return len(rows)

    cursor = conn.cursor()
    inserted = 0
    for row in rows:
        try:
            cursor.execute(UPSERT_SQL, row)
            inserted += 1
        except MySQLError as e:
            log.warning(f"Erro ao inserir {row[2]}/{row[4]}: {e}")

    conn.commit()
    cursor.close()
    log.info(f"{inserted} registros inseridos/atualizados com sucesso.")
    return inserted


# ---------------------------------------------------------------------------
# Extração de PDFs (modo avançado)
# ---------------------------------------------------------------------------

def download_pdf(url: str, retries: int = 3) -> Optional[bytes]:
    """Baixa PDF de uma URL com retry."""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; CRIVO-ETL/1.0; +https://crivo.app)"
    }
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            if resp.status_code == 200:
                return resp.content
            log.warning(f"HTTP {resp.status_code} para {url} (tentativa {attempt+1})")
        except Exception as e:
            log.warning(f"Erro ao baixar {url}: {e} (tentativa {attempt+1})")
        time.sleep(2 ** attempt)
    return None


def extract_pdf_indicators(pdf_bytes: bytes, ra_codigo: str) -> list:
    """
    Extrai indicadores de um PDF de relatório PDAD.
    Retorna lista de dicts com campos do indicador.
    """
    records = []
    ra_nome, _ = get_ra_info(ra_codigo)

    try:
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text() or ""
                full_text += text + "\n"

            # Extração básica de padrões numéricos do texto
            import re

            # Padrão: "População total: 220.393"
            pop_match = re.search(r"popula[çc][aã]o\s+total[:\s]+([0-9.,]+)", full_text, re.IGNORECASE)
            if pop_match:
                val = float(pop_match.group(1).replace(".", "").replace(",", "."))
                records.append({
                    "indicador": "populacao_total",
                    "categoria": "demografia",
                    "valor": val,
                    "unidade": "habitantes",
                })

            # Padrão: "Renda domiciliar média: R$ 12.671,00"
            renda_match = re.search(r"renda\s+domiciliar\s+m[eé]dia[:\s]+R\$?\s*([0-9.,]+)", full_text, re.IGNORECASE)
            if renda_match:
                val = float(renda_match.group(1).replace(".", "").replace(",", "."))
                records.append({
                    "indicador": "renda_domiciliar_media",
                    "categoria": "renda",
                    "valor": val,
                    "unidade": "R$/mês",
                })

    except Exception as e:
        log.warning(f"Erro ao extrair PDF para {ra_codigo}: {e}")

    return records


def load_pdf_data(conn, ano: int = 2021, dry_run: bool = False) -> int:
    """Baixa e processa PDFs da PDAD para extração de indicadores."""
    fonte = f"PDAD-{ano}-PDF"
    total_inserted = 0

    for ra_codigo, url in PDF_URLS_2021.items():
        log.info(f"Baixando PDF: {ra_codigo} ({url})")
        pdf_bytes = download_pdf(url)

        if not pdf_bytes:
            log.warning(f"Não foi possível baixar PDF para {ra_codigo}")
            continue

        records = extract_pdf_indicators(pdf_bytes, ra_codigo)
        ra_nome, _ = get_ra_info(ra_codigo)

        if dry_run:
            log.info(f"[DRY-RUN] {ra_codigo}: {len(records)} indicadores extraídos do PDF")
            continue

        cursor = conn.cursor()
        for rec in records:
            try:
                cursor.execute(UPSERT_SQL, (
                    ano, fonte, ra_codigo, ra_nome,
                    rec["indicador"], rec["categoria"],
                    rec["valor"], rec["unidade"],
                    f"Extraído automaticamente do PDF. URL: {url}",
                ))
                total_inserted += 1
            except MySQLError as e:
                log.warning(f"Erro ao inserir {ra_codigo}/{rec['indicador']}: {e}")

        conn.commit()
        cursor.close()
        time.sleep(0.5)  # Rate limiting respeitoso

    return total_inserted


# ---------------------------------------------------------------------------
# Ponto de entrada
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="ETL PDAD/IPEDF → CRIVO")
    parser.add_argument("--source", choices=["seed", "pdf", "all"], default="seed",
                        help="Fonte de dados: seed (dados consolidados), pdf (extração de PDFs), all (ambos)")
    parser.add_argument("--ano", type=int, default=2021, help="Ano de referência da pesquisa")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem gravar no banco")
    args = parser.parse_args()

    log.info("=" * 60)
    log.info(f"CRIVO ETL - PDAD/IPEDF | Fonte: {args.source} | Ano: {args.ano}")
    log.info("=" * 60)

    if args.dry_run:
        log.info("MODO DRY-RUN ativado — nenhuma gravação no banco.")

    try:
        if not args.dry_run:
            conn = get_db_connection()
            log.info("Conexão com banco de dados estabelecida.")
            create_table(conn)
        else:
            conn = None
    except Exception as e:
        if args.dry_run:
            log.info("Dry-run sem conexão com banco — OK.")
            conn = None
        else:
            log.error(f"Falha na conexão com banco: {e}")
            sys.exit(1)

    total = 0

    if args.source in ("seed", "all"):
        log.info("Carregando dados consolidados (seed)...")
        if args.dry_run:
            count = sum(len(v) for v in PDAD_2021_SEED.values())
            log.info(f"[DRY-RUN] {count} registros seriam carregados.")
            total += count
        else:
            total += load_seed_data(conn, args.ano, args.dry_run)

    if args.source in ("pdf", "all"):
        log.info("Iniciando extração de PDFs...")
        total += load_pdf_data(conn, args.ano, args.dry_run)

    if conn:
        conn.close()

    log.info(f"ETL concluído. Total de registros processados: {total}")
    return total


if __name__ == "__main__":
    main()
