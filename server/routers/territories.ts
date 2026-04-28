/**
 * CRIVO — Router: Territórios PDAD/IPEDF
 * ========================================
 * Endpoints REST para consulta de indicadores territoriais
 * baseados na Pesquisa Distrital por Amostra de Domicílios (PDAD).
 *
 * Endpoints disponíveis (via tRPC → mapeados para REST em _core/index.ts):
 *   GET /api/territories/pdad              → territories.pdad.list
 *   GET /api/territories/pdad/:ra          → territories.pdad.byRa
 *   GET /api/territories/pdad/:ra/summary  → territories.pdad.summary
 *
 * Reutilizável pelos produtos:
 *   Atlas.voto | Monitor360 | Fala Eleitor | Campanha360
 */

import { z } from "zod";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { pdadIndicators, pdadRaSummaries } from "../../drizzle/pdad_schema";

// ---------------------------------------------------------------------------
// Constantes e helpers
// ---------------------------------------------------------------------------

/** Lista canônica de RAs do DF */
const RA_LIST = [
  { codigo: "RA01", nome: "Plano Piloto" },
  { codigo: "RA02", nome: "Gama" },
  { codigo: "RA03", nome: "Taguatinga" },
  { codigo: "RA04", nome: "Brazlândia" },
  { codigo: "RA05", nome: "Sobradinho" },
  { codigo: "RA06", nome: "Planaltina" },
  { codigo: "RA07", nome: "Paranoá" },
  { codigo: "RA08", nome: "Núcleo Bandeirante" },
  { codigo: "RA09", nome: "Ceilândia" },
  { codigo: "RA10", nome: "Guará" },
  { codigo: "RA11", nome: "Cruzeiro" },
  { codigo: "RA12", nome: "Samambaia" },
  { codigo: "RA13", nome: "Santa Maria" },
  { codigo: "RA14", nome: "São Sebastião" },
  { codigo: "RA15", nome: "Recanto das Emas" },
  { codigo: "RA16", nome: "Lago Sul" },
  { codigo: "RA17", nome: "Riacho Fundo" },
  { codigo: "RA18", nome: "Lago Norte" },
  { codigo: "RA19", nome: "Candangolândia" },
  { codigo: "RA20", nome: "Águas Claras" },
  { codigo: "RA21", nome: "Riacho Fundo II" },
  { codigo: "RA22", nome: "Sudoeste/Octogonal" },
  { codigo: "RA23", nome: "Varjão" },
  { codigo: "RA24", nome: "Park Way" },
  { codigo: "RA25", nome: "SCIA/Estrutural" },
  { codigo: "RA26", nome: "Sobradinho II" },
  { codigo: "RA27", nome: "Jardim Botânico" },
  { codigo: "RA28", nome: "Itapoã" },
  { codigo: "RA29", nome: "SIA" },
  { codigo: "RA30", nome: "Vicente Pires" },
  { codigo: "RA31", nome: "Fercal" },
  { codigo: "RA32", nome: "Sol Nascente e Pôr do Sol" },
  { codigo: "RA33", nome: "Arniqueira" },
  { codigo: "RA34", nome: "Arapoanga" },
  { codigo: "RA35", nome: "Água Quente" },
];

/** Normaliza código de RA para formato canônico (ex: "ra1" → "RA01") */
function normalizeRaCodigo(raw: string): string {
  const upper = raw.toUpperCase().trim();
  if (/^RA\d{2}$/.test(upper)) return upper;
  if (/^RA\d{1}$/.test(upper)) return `RA0${upper[2]}`;
  const num = parseInt(upper.replace(/\D/g, ""), 10);
  if (!isNaN(num) && num >= 1 && num <= 35) {
    return `RA${String(num).padStart(2, "0")}`;
  }
  return upper;
}

/** Agrupa indicadores por categoria para resposta estruturada */
function groupByCategoria(
  indicators: Array<{ indicador: string; categoria: string; valor: string | null; unidade: string | null }>
) {
  const grouped: Record<string, Record<string, { valor: number | null; unidade: string | null }>> = {};
  for (const ind of indicators) {
    if (!grouped[ind.categoria]) grouped[ind.categoria] = {};
    grouped[ind.categoria][ind.indicador] = {
      valor: ind.valor !== null ? parseFloat(ind.valor) : null,
      unidade: ind.unidade,
    };
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// Router principal
// ---------------------------------------------------------------------------

export const territoriesRouter = router({

  /**
   * GET /api/territories/pdad
   * Lista todas as RAs com indicadores resumidos.
   * Parâmetros opcionais: ano, categoria, fonte
   */
  list: publicProcedure
    .input(
      z.object({
        ano: z.number().default(2021),
        categoria: z.string().optional(),
        fonte: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Retorna lista estática de RAs quando banco indisponível
        return {
          total: RA_LIST.length,
          ano: input.ano,
          fonte: input.fonte ?? `PDAD-${input.ano}`,
          regioes: RA_LIST,
          _warning: "Banco de dados indisponível. Retornando lista de RAs sem indicadores.",
        };
      }

      try {
        // Busca indicadores-chave para cada RA
        const keyIndicators = [
          "populacao_total",
          "renda_domiciliar_media",
          "taxa_desemprego",
          "taxa_alfabetizacao",
          "beneficiarios_bolsa_familia_pct",
        ];

        const conditions = [
          eq(pdadIndicators.ano, input.ano),
          ...(input.fonte ? [eq(pdadIndicators.fonte, input.fonte)] : []),
          ...(input.categoria ? [eq(pdadIndicators.categoria, input.categoria)] : []),
        ];

        const rows = await db
          .select({
            ra_codigo: pdadIndicators.ra_codigo,
            ra_nome: pdadIndicators.ra_nome,
            indicador: pdadIndicators.indicador,
            categoria: pdadIndicators.categoria,
            valor: pdadIndicators.valor,
            unidade: pdadIndicators.unidade,
          })
          .from(pdadIndicators)
          .where(and(...conditions))
          .orderBy(asc(pdadIndicators.ra_codigo), asc(pdadIndicators.indicador));

        // Agrupa por RA
        const raMap: Record<string, {
          ra_codigo: string;
          ra_nome: string;
          indicadores: typeof rows;
        }> = {};

        for (const row of rows) {
          if (!raMap[row.ra_codigo]) {
            raMap[row.ra_codigo] = {
              ra_codigo: row.ra_codigo,
              ra_nome: row.ra_nome,
              indicadores: [],
            };
          }
          raMap[row.ra_codigo].indicadores.push(row);
        }

        const regioes = Object.values(raMap).map((ra) => ({
          ra_codigo: ra.ra_codigo,
          ra_nome: ra.ra_nome,
          indicadores: groupByCategoria(ra.indicadores),
        }));

        return {
          total: regioes.length,
          ano: input.ano,
          fonte: input.fonte ?? `PDAD-${input.ano}`,
          regioes,
        };
      } catch (error) {
        console.error("[territories.list] Erro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao consultar indicadores territoriais",
        });
      }
    }),

  /**
   * GET /api/territories/pdad/:ra
   * Retorna todos os indicadores de uma RA específica.
   * Parâmetros: ra_codigo (ex: RA09, ra9, 9), ano
   */
  byRa: publicProcedure
    .input(
      z.object({
        ra: z.string().min(1).max(8),
        ano: z.number().default(2021),
        fonte: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const raCodigo = normalizeRaCodigo(input.ra);
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Banco de dados indisponível",
        });
      }

      try {
        const conditions = [
          eq(pdadIndicators.ra_codigo, raCodigo),
          eq(pdadIndicators.ano, input.ano),
          ...(input.fonte ? [eq(pdadIndicators.fonte, input.fonte)] : []),
        ];

        const rows = await db
          .select()
          .from(pdadIndicators)
          .where(and(...conditions))
          .orderBy(asc(pdadIndicators.categoria), asc(pdadIndicators.indicador));

        if (!rows.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Nenhum indicador encontrado para ${raCodigo} (ano: ${input.ano})`,
          });
        }

        const raInfo = rows[0];

        return {
          ra_codigo: raInfo.ra_codigo,
          ra_nome: raInfo.ra_nome,
          ano: raInfo.ano,
          fonte: raInfo.fonte,
          total_indicadores: rows.length,
          indicadores_por_categoria: groupByCategoria(
            rows.map((r: any) => ({
              indicador: r.indicador,
              categoria: r.categoria,
              valor: r.valor,
              unidade: r.unidade,
            }))
          ),
          indicadores_raw: rows.map((r: any) => ({
            indicador: r.indicador,
            categoria: r.categoria,
            valor: r.valor !== null ? parseFloat(r.valor) : null,
            unidade: r.unidade,
            observacao: r.observacao,
          })),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(`[territories.byRa] Erro para ${raCodigo}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao consultar indicadores da RA",
        });
      }
    }),

  /**
   * GET /api/territories/pdad/:ra/summary
   * Retorna o resumo estratégico de uma RA.
   * Inclui: perfil socioeconômico, vulnerabilidades, oportunidades,
   *         pautas eleitorais e alertas de comunicação.
   */
  summary: publicProcedure
    .input(
      z.object({
        ra: z.string().min(1).max(8),
        ano: z.number().default(2021),
      })
    )
    .query(async ({ input }) => {
      const raCodigo = normalizeRaCodigo(input.ra);
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Banco de dados indisponível",
        });
      }

      try {
        // Busca resumo pré-gerado
        const summaryRows = await db
          .select()
          .from(pdadRaSummaries)
          .where(
            and(
              eq(pdadRaSummaries.ra_codigo, raCodigo),
              eq(pdadRaSummaries.ano, input.ano)
            )
          )
          .limit(1);

        if (summaryRows.length > 0) {
          return summaryRows[0];
        }

        // Se não há resumo pré-gerado, busca indicadores e gera resumo básico
        const indicators = await db
          .select()
          .from(pdadIndicators)
          .where(
            and(
              eq(pdadIndicators.ra_codigo, raCodigo),
              eq(pdadIndicators.ano, input.ano)
            )
          );

        if (!indicators.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Nenhum dado encontrado para ${raCodigo} (ano: ${input.ano})`,
          });
        }

        // Gera resumo dinâmico baseado nos indicadores
        const indMap: Record<string, number> = {};
        for (const ind of indicators) {
          if (ind.valor !== null) {
            indMap[ind.indicador] = parseFloat(ind.valor);
          }
        }

        const raInfo = indicators[0];
        const summary = generateDynamicSummary(raCodigo, raInfo.ra_nome, indMap);

        return {
          ra_codigo: raCodigo,
          ra_nome: raInfo.ra_nome,
          ano: input.ano,
          ...summary,
          gerado_por: "crivo-etl-dynamic",
          _note: "Resumo gerado dinamicamente. Execute o script de geração de resumos para versão completa.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(`[territories.summary] Erro para ${raCodigo}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar resumo territorial",
        });
      }
    }),

  /**
   * GET /api/territories/pdad/compare
   * Compara indicadores entre múltiplas RAs.
   */
  compare: publicProcedure
    .input(
      z.object({
        ras: z.array(z.string()).min(2).max(10),
        indicadores: z.array(z.string()).optional(),
        ano: z.number().default(2021),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Banco de dados indisponível",
        });
      }

      const raCodigos = input.ras.map(normalizeRaCodigo);

      try {
        const rows = await db
          .select()
          .from(pdadIndicators)
          .where(
            and(
              eq(pdadIndicators.ano, input.ano),
              sql`${pdadIndicators.ra_codigo} IN (${sql.join(
                raCodigos.map((r) => sql`${r}`),
                sql`, `
              )})`
            )
          )
          .orderBy(asc(pdadIndicators.ra_codigo), asc(pdadIndicators.indicador));

        // Filtra indicadores se especificados
        const filtered = input.indicadores
          ? rows.filter((r: any) => input.indicadores!.includes(r.indicador))
          : rows;

        // Pivota: indicador → {ra_codigo: valor}
        const pivot: Record<string, Record<string, number | null>> = {};
        const raNames: Record<string, string> = {};

        for (const row of filtered) {
          raNames[row.ra_codigo] = row.ra_nome;
          if (!pivot[row.indicador]) pivot[row.indicador] = {};
          pivot[row.indicador][row.ra_codigo] =
            row.valor !== null ? parseFloat(row.valor) : null;
        }

        return {
          ano: input.ano,
          ras: raCodigos.map((c) => ({ codigo: c, nome: raNames[c] ?? c })),
          comparacao: Object.entries(pivot).map(([indicador, valores]) => ({
            indicador,
            valores,
          })),
        };
      } catch (error) {
        console.error("[territories.compare] Erro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao comparar RAs",
        });
      }
    }),

  /**
   * GET /api/territories/pdad/ranking
   * Ranking de RAs por um indicador específico.
   */
  ranking: publicProcedure
    .input(
      z.object({
        indicador: z.string(),
        ano: z.number().default(2021),
        ordem: z.enum(["asc", "desc"]).default("desc"),
        limite: z.number().min(1).max(35).default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Banco de dados indisponível",
        });
      }

      try {
        const orderFn = input.ordem === "desc" ? desc : asc;

        const rows = await db
          .select({
            ra_codigo: pdadIndicators.ra_codigo,
            ra_nome: pdadIndicators.ra_nome,
            indicador: pdadIndicators.indicador,
            valor: pdadIndicators.valor,
            unidade: pdadIndicators.unidade,
          })
          .from(pdadIndicators)
          .where(
            and(
              eq(pdadIndicators.indicador, input.indicador),
              eq(pdadIndicators.ano, input.ano)
            )
          )
          .orderBy(orderFn(pdadIndicators.valor))
          .limit(input.limite);

        return {
          indicador: input.indicador,
          ano: input.ano,
          ordem: input.ordem,
          ranking: rows.map((r: any, i: number) => ({
            posicao: i + 1,
            ra_codigo: r.ra_codigo,
            ra_nome: r.ra_nome,
            valor: r.valor !== null ? parseFloat(r.valor) : null,
            unidade: r.unidade,
          })),
        };
      } catch (error) {
        console.error("[territories.ranking] Erro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar ranking",
        });
      }
    }),
});

// ---------------------------------------------------------------------------
// Gerador de resumo dinâmico
// ---------------------------------------------------------------------------

function generateDynamicSummary(
  raCodigo: string,
  raNome: string,
  ind: Record<string, number>
) {
  const pop = ind.populacao_total ?? 0;
  const renda = ind.renda_domiciliar_media ?? 0;
  const desemprego = ind.taxa_desemprego ?? 0;
  const superior = ind.escolaridade_superior ?? 0;
  const bolsaFamilia = ind.beneficiarios_bolsa_familia_pct ?? 0;
  const agua = ind.abastecimento_agua_rede_pct ?? 100;
  const esgoto = ind.esgotamento_rede_pct ?? 100;
  const internet = ind.acesso_internet_pct ?? 0;
  const jovens = ind.populacao_0_14_pct ?? 0;
  const idosos = ind.populacao_60_mais_pct ?? 0;

  // Classificação socioeconômica baseada na renda per capita
  const rendaPC = ind.renda_per_capita ?? 0;
  let classificacao: string;
  let indiceVulnerabilidade: number;

  if (rendaPC >= 5000) {
    classificacao = "muito_alto";
    indiceVulnerabilidade = 10 + desemprego * 0.5;
  } else if (rendaPC >= 3000) {
    classificacao = "alto";
    indiceVulnerabilidade = 20 + desemprego * 0.8;
  } else if (rendaPC >= 2000) {
    classificacao = "medio_alto";
    indiceVulnerabilidade = 30 + desemprego;
  } else if (rendaPC >= 1500) {
    classificacao = "medio";
    indiceVulnerabilidade = 40 + desemprego * 1.2;
  } else if (rendaPC >= 1000) {
    classificacao = "medio_baixo";
    indiceVulnerabilidade = 55 + desemprego * 1.5;
  } else if (rendaPC >= 700) {
    classificacao = "baixo";
    indiceVulnerabilidade = 70 + desemprego * 1.8;
  } else {
    classificacao = "muito_baixo";
    indiceVulnerabilidade = 85 + desemprego * 2;
  }

  indiceVulnerabilidade = Math.min(100, Math.max(0, indiceVulnerabilidade));

  // Perfil socioeconômico
  const perfil = [
    `${raNome} (${raCodigo}) é uma Região Administrativa do Distrito Federal com população estimada de ${pop.toLocaleString("pt-BR")} habitantes.`,
    `A renda domiciliar média é de R$ ${renda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} mensais, com renda per capita de R$ ${rendaPC.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
    `A taxa de desemprego é de ${desemprego.toFixed(1)}% e ${superior.toFixed(1)}% da população possui ensino superior completo.`,
    `Classificação socioeconômica: ${classificacao.replace(/_/g, " ")}.`,
  ].join(" ");

  // Vulnerabilidades
  const vulns: string[] = [];
  if (desemprego > 15) vulns.push(`alta taxa de desemprego (${desemprego.toFixed(1)}%)`);
  if (bolsaFamilia > 10) vulns.push(`elevada dependência de programas sociais (${bolsaFamilia.toFixed(1)}% beneficiários do Bolsa Família)`);
  if (agua < 98) vulns.push(`cobertura incompleta de abastecimento de água (${agua.toFixed(1)}%)`);
  if (esgoto < 97) vulns.push(`déficit em esgotamento sanitário (${esgoto.toFixed(1)}%)`);
  if (internet < 70) vulns.push(`baixo acesso à internet (${internet.toFixed(1)}%)`);
  if (superior < 15) vulns.push(`baixa escolaridade superior (${superior.toFixed(1)}%)`);
  if (jovens > 25) vulns.push(`alta proporção de jovens (${jovens.toFixed(1)}% com menos de 14 anos) com demanda por educação e saúde`);

  const vulnerabilidades = vulns.length > 0
    ? `Principais vulnerabilidades identificadas: ${vulns.join("; ")}.`
    : "Nenhuma vulnerabilidade crítica identificada nos indicadores disponíveis.";

  // Oportunidades
  const opps: string[] = [];
  if (desemprego > 12) opps.push("programas de qualificação profissional e geração de emprego e renda");
  if (bolsaFamilia > 8) opps.push("expansão de programas de transferência de renda e inclusão produtiva");
  if (agua < 99) opps.push("ampliação da infraestrutura de saneamento básico");
  if (internet < 80) opps.push("inclusão digital e conectividade");
  if (superior < 20) opps.push("ampliação do acesso ao ensino superior e técnico");
  if (idosos > 15) opps.push("serviços e equipamentos voltados à população idosa");

  const oportunidades = opps.length > 0
    ? `Oportunidades de política pública: ${opps.join("; ")}.`
    : "Região com indicadores satisfatórios; foco em manutenção e melhoria incremental dos serviços.";

  // Pautas eleitorais
  const pautas: string[] = [];
  if (desemprego > 15) pautas.push("emprego e geração de renda");
  if (bolsaFamilia > 10) pautas.push("proteção social e assistência às famílias vulneráveis");
  if (agua < 98 || esgoto < 97) pautas.push("saneamento básico e infraestrutura urbana");
  if (internet < 75) pautas.push("inclusão digital e acesso à tecnologia");
  if (jovens > 22) pautas.push("educação, juventude e oportunidades para jovens");
  if (idosos > 15) pautas.push("saúde e qualidade de vida para a terceira idade");
  if (superior > 40) pautas.push("inovação, ciência e economia do conhecimento");
  if (renda > 8000) pautas.push("segurança pública e qualidade de vida urbana");

  const pautasEleitorais = pautas.length > 0
    ? `Pautas com maior ressonância eleitoral em ${raNome}: ${pautas.join("; ")}.`
    : "Pautas transversais de qualidade de vida e gestão eficiente dos serviços públicos.";

  // Alertas de comunicação
  const alertas: string[] = [];
  if (bolsaFamilia > 15) alertas.push("ATENÇÃO: alta concentração de beneficiários de programas sociais — discurso deve ser empático e propositivo");
  if (desemprego > 18) alertas.push("ALERTA: desemprego crítico — evitar narrativas de prosperidade sem propostas concretas");
  if (internet < 65) alertas.push("ATENÇÃO: baixa conectividade — priorizar comunicação presencial e via rádio/TV");
  if (jovens > 25) alertas.push("OPORTUNIDADE: população jovem expressiva — conteúdo deve contemplar linguagem e pautas da juventude");
  if (idosos > 18) alertas.push("OPORTUNIDADE: população idosa significativa — comunicação deve incluir formatos acessíveis");
  if (superior > 50) alertas.push("NOTA: alta escolaridade — público exige profundidade e evidências nos argumentos");

  const alertasComunicacao = alertas.length > 0
    ? alertas.join(" | ")
    : "Perfil comunicacional padrão. Adaptar mensagem ao contexto socioeconômico da RA.";

  return {
    perfil_socioeconomico: perfil,
    vulnerabilidades,
    oportunidades,
    pautas_eleitorais: pautasEleitorais,
    alertas_comunicacao: alertasComunicacao,
    indice_vulnerabilidade: parseFloat(indiceVulnerabilidade.toFixed(2)),
    classificacao,
  };
}
