/**
 * CRIVO — Schema Drizzle ORM: Integração PDAD/IPEDF
 * ===================================================
 * Tabelas para a camada territorial baseada na Pesquisa Distrital
 * por Amostra de Domicílios (PDAD) do IPEDF/CODEPLAN.
 *
 * Reutilizável pelos produtos: Atlas.voto, Monitor360,
 * Fala Eleitor e Campanha360.
 */

import {
  int,
  smallint,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// Tabela principal: indicadores PDAD por RA
// ---------------------------------------------------------------------------
export const pdadIndicators = mysqlTable(
  "pdad_indicators",
  {
    id: int("id").autoincrement().primaryKey(),

    /** Ano de referência da pesquisa PDAD */
    ano: smallint("ano").notNull(),

    /** Identificador da fonte: PDAD-2021, PDAD-A-2024, etc. */
    fonte: varchar("fonte", { length: 64 }).notNull(),

    /** Código canônico da RA (RA01 a RA35) */
    ra_codigo: varchar("ra_codigo", { length: 8 }).notNull(),

    /** Nome normalizado da Região Administrativa */
    ra_nome: varchar("ra_nome", { length: 128 }).notNull(),

    /** Slug do indicador em snake_case */
    indicador: varchar("indicador", { length: 128 }).notNull(),

    /**
     * Categoria temática do indicador.
     * Valores: demografia | renda | educacao | trabalho | habitacao |
     *          saneamento | tecnologia | genero | assistencia_social
     */
    categoria: varchar("categoria", { length: 64 }).notNull(),

    /** Valor numérico do indicador */
    valor: decimal("valor", { precision: 18, scale: 4 }),

    /** Unidade de medida (%, R$/mês, habitantes, domicílios, etc.) */
    unidade: varchar("unidade", { length: 64 }),

    /** Notas metodológicas, contextuais ou de qualidade dos dados */
    observacao: text("observacao"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uqPdadIndicator: uniqueIndex("uq_pdad_indicator").on(
      table.ano,
      table.fonte,
      table.ra_codigo,
      table.indicador
    ),
    idxRaAno: index("idx_pdad_ra_ano").on(table.ra_codigo, table.ano),
    idxIndicador: index("idx_pdad_indicador").on(table.indicador),
    idxCategoria: index("idx_pdad_categoria").on(table.categoria),
    idxFonte: index("idx_pdad_fonte").on(table.fonte),
  })
);

export type PdadIndicator = typeof pdadIndicators.$inferSelect;
export type InsertPdadIndicator = typeof pdadIndicators.$inferInsert;

// ---------------------------------------------------------------------------
// Tabela de resumos estratégicos por RA
// ---------------------------------------------------------------------------
export const pdadRaSummaries = mysqlTable(
  "pdad_ra_summaries",
  {
    id: int("id").autoincrement().primaryKey(),

    /** Ano de referência */
    ano: smallint("ano").notNull(),

    /** Código canônico da RA */
    ra_codigo: varchar("ra_codigo", { length: 8 }).notNull(),

    /** Nome normalizado da RA */
    ra_nome: varchar("ra_nome", { length: 128 }).notNull(),

    /** Resumo do perfil socioeconômico da RA */
    perfil_socioeconomico: text("perfil_socioeconomico"),

    /** Principais vulnerabilidades sociais e econômicas */
    vulnerabilidades: text("vulnerabilidades"),

    /** Oportunidades de intervenção de política pública */
    oportunidades: text("oportunidades"),

    /** Temas e pautas com maior ressonância eleitoral */
    pautas_eleitorais: text("pautas_eleitorais"),

    /** Alertas para comunicação política e territorial */
    alertas_comunicacao: text("alertas_comunicacao"),

    /** Índice composto de vulnerabilidade (0=baixo, 100=alto) */
    indice_vulnerabilidade: decimal("indice_vulnerabilidade", {
      precision: 5,
      scale: 2,
    }),

    /** Classificação socioeconômica da RA */
    classificacao: mysqlEnum("classificacao", [
      "muito_baixo",
      "baixo",
      "medio_baixo",
      "medio",
      "medio_alto",
      "alto",
      "muito_alto",
    ]),

    /** Sistema que gerou o resumo */
    gerado_por: varchar("gerado_por", { length: 64 }).default("crivo-etl"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    uqSummary: uniqueIndex("uq_pdad_summary").on(table.ano, table.ra_codigo),
    idxSummaryRa: index("idx_summary_ra").on(table.ra_codigo),
    idxSummaryClass: index("idx_summary_class").on(table.classificacao),
  })
);

export type PdadRaSummary = typeof pdadRaSummaries.$inferSelect;
export type InsertPdadRaSummary = typeof pdadRaSummaries.$inferInsert;
