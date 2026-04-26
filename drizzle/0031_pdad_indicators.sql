-- ============================================================================
-- CRIVO - Migration: pdad_indicators
-- Integração PDAD/IPEDF — Camada Territorial
-- Criado em: 2026-04-26
-- Compatível com: MySQL 8.0+ / TiDB
-- ============================================================================

-- Tabela principal de indicadores PDAD por Região Administrativa
CREATE TABLE IF NOT EXISTS `pdad_indicators` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `ano`         SMALLINT       NOT NULL COMMENT 'Ano de referência da pesquisa PDAD',
  `fonte`       VARCHAR(64)    NOT NULL COMMENT 'Identificador da fonte (ex: PDAD-2021, PDAD-A-2024)',
  `ra_codigo`   VARCHAR(8)     NOT NULL COMMENT 'Código canônico da RA (RA01 a RA35)',
  `ra_nome`     VARCHAR(128)   NOT NULL COMMENT 'Nome normalizado da Região Administrativa',
  `indicador`   VARCHAR(128)   NOT NULL COMMENT 'Slug do indicador em snake_case',
  `categoria`   VARCHAR(64)    NOT NULL COMMENT 'Categoria temática: demografia, renda, educacao, trabalho, habitacao, saneamento, tecnologia, genero, assistencia_social',
  `valor`       DECIMAL(18,4)  NULL     COMMENT 'Valor numérico do indicador',
  `unidade`     VARCHAR(64)    NULL     COMMENT 'Unidade de medida (%, R$/mês, habitantes, domicílios, etc.)',
  `observacao`  TEXT           NULL     COMMENT 'Notas metodológicas, contextuais ou de qualidade dos dados',
  `created_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pdad_indicator` (`ano`, `fonte`, `ra_codigo`, `indicador`),
  INDEX `idx_pdad_ra_ano`    (`ra_codigo`, `ano`),
  INDEX `idx_pdad_indicador` (`indicador`),
  INDEX `idx_pdad_categoria` (`categoria`),
  INDEX `idx_pdad_fonte`     (`fonte`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Indicadores PDAD/IPEDF normalizados por Região Administrativa do DF';


-- ============================================================================
-- Tabela de resumos estratégicos por RA (gerados por IA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `pdad_ra_summaries` (
  `id`                    INT           NOT NULL AUTO_INCREMENT,
  `ano`                   SMALLINT      NOT NULL COMMENT 'Ano de referência',
  `ra_codigo`             VARCHAR(8)    NOT NULL COMMENT 'Código canônico da RA',
  `ra_nome`               VARCHAR(128)  NOT NULL COMMENT 'Nome normalizado da RA',

  -- Perfil socioeconômico
  `perfil_socioeconomico` TEXT          NULL COMMENT 'Resumo do perfil socioeconômico da RA',

  -- Vulnerabilidades identificadas
  `vulnerabilidades`      TEXT          NULL COMMENT 'Principais vulnerabilidades sociais e econômicas',

  -- Oportunidades de política pública
  `oportunidades`         TEXT          NULL COMMENT 'Oportunidades de intervenção de política pública',

  -- Pautas eleitorais relevantes
  `pautas_eleitorais`     TEXT          NULL COMMENT 'Temas e pautas com maior ressonância eleitoral',

  -- Alertas de comunicação territorial
  `alertas_comunicacao`   TEXT          NULL COMMENT 'Alertas para comunicação política e territorial',

  -- Índice de vulnerabilidade composto (0-100)
  `indice_vulnerabilidade` DECIMAL(5,2) NULL COMMENT 'Índice composto de vulnerabilidade (0=baixo, 100=alto)',

  -- Classificação socioeconômica
  `classificacao`         ENUM('muito_baixo','baixo','medio_baixo','medio','medio_alto','alto','muito_alto')
                          NULL COMMENT 'Classificação socioeconômica da RA',

  -- Metadados
  `gerado_por`            VARCHAR(64)   NULL DEFAULT 'crivo-etl' COMMENT 'Sistema que gerou o resumo',
  `created_at`            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pdad_summary` (`ano`, `ra_codigo`),
  INDEX `idx_summary_ra`   (`ra_codigo`),
  INDEX `idx_summary_class` (`classificacao`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Resumos estratégicos territoriais por RA gerados a partir da PDAD';


-- ============================================================================
-- View consolidada para consultas rápidas
-- ============================================================================
CREATE OR REPLACE VIEW `v_pdad_ra_profile` AS
SELECT
  pi.ra_codigo,
  pi.ra_nome,
  pi.ano,
  pi.fonte,

  -- Indicadores demográficos
  MAX(CASE WHEN pi.indicador = 'populacao_total'        THEN pi.valor END) AS populacao_total,
  MAX(CASE WHEN pi.indicador = 'domicilios_total'       THEN pi.valor END) AS domicilios_total,
  MAX(CASE WHEN pi.indicador = 'densidade_domiciliar'   THEN pi.valor END) AS densidade_domiciliar,
  MAX(CASE WHEN pi.indicador = 'populacao_0_14_pct'     THEN pi.valor END) AS populacao_0_14_pct,
  MAX(CASE WHEN pi.indicador = 'populacao_60_mais_pct'  THEN pi.valor END) AS populacao_60_mais_pct,
  MAX(CASE WHEN pi.indicador = 'imigrantes_pct'         THEN pi.valor END) AS imigrantes_pct,

  -- Indicadores de renda
  MAX(CASE WHEN pi.indicador = 'renda_domiciliar_media' THEN pi.valor END) AS renda_domiciliar_media,
  MAX(CASE WHEN pi.indicador = 'renda_per_capita'       THEN pi.valor END) AS renda_per_capita,

  -- Indicadores de educação
  MAX(CASE WHEN pi.indicador = 'taxa_alfabetizacao'     THEN pi.valor END) AS taxa_alfabetizacao,
  MAX(CASE WHEN pi.indicador = 'escolaridade_superior'  THEN pi.valor END) AS escolaridade_superior,

  -- Indicadores de trabalho
  MAX(CASE WHEN pi.indicador = 'taxa_desemprego'        THEN pi.valor END) AS taxa_desemprego,

  -- Indicadores de habitação
  MAX(CASE WHEN pi.indicador = 'domicilios_proprios_pct' THEN pi.valor END) AS domicilios_proprios_pct,

  -- Indicadores de saneamento
  MAX(CASE WHEN pi.indicador = 'abastecimento_agua_rede_pct' THEN pi.valor END) AS agua_rede_pct,
  MAX(CASE WHEN pi.indicador = 'coleta_lixo_pct'        THEN pi.valor END) AS coleta_lixo_pct,
  MAX(CASE WHEN pi.indicador = 'esgotamento_rede_pct'   THEN pi.valor END) AS esgoto_rede_pct,

  -- Indicadores sociais
  MAX(CASE WHEN pi.indicador = 'acesso_internet_pct'    THEN pi.valor END) AS acesso_internet_pct,
  MAX(CASE WHEN pi.indicador = 'chefes_mulheres_pct'    THEN pi.valor END) AS chefes_mulheres_pct,
  MAX(CASE WHEN pi.indicador = 'beneficiarios_bolsa_familia_pct' THEN pi.valor END) AS bolsa_familia_pct

FROM pdad_indicators pi
GROUP BY pi.ra_codigo, pi.ra_nome, pi.ano, pi.fonte;
