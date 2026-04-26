/**
 * CRIVO — REST Endpoints: Territórios PDAD/IPEDF
 * ================================================
 * Endpoints HTTP Express para acesso direto (sem tRPC) aos dados territoriais.
 * Registrar em server/_core/index.ts antes do handler tRPC.
 *
 * Endpoints:
 *   GET /api/territories/pdad                     → Lista todas as RAs
 *   GET /api/territories/pdad/:ra                 → Indicadores de uma RA
 *   GET /api/territories/pdad/:ra/summary         → Resumo estratégico da RA
 *   GET /api/territories/pdad/ranking/:indicador  → Ranking por indicador
 *   GET /api/territories/pdad/compare             → Comparação entre RAs
 */

import { Router, Request, Response } from "express";
import { getDb } from "./db";
import { pdadIndicators, pdadRaSummaries } from "../drizzle/pdad_schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";

export const territoriesRestRouter = Router();

// ---------------------------------------------------------------------------
// Helper: normaliza código de RA
// ---------------------------------------------------------------------------
function normalizeRa(raw: string): string {
  const upper = raw.toUpperCase().trim();
  if (/^RA\d{2}$/.test(upper)) return upper;
  if (/^RA\d{1}$/.test(upper)) return `RA0${upper[2]}`;
  const num = parseInt(upper.replace(/\D/g, ""), 10);
  if (!isNaN(num) && num >= 1 && num <= 35) {
    return `RA${String(num).padStart(2, "0")}`;
  }
  return upper;
}

// ---------------------------------------------------------------------------
// Helper: agrupa indicadores por categoria
// ---------------------------------------------------------------------------
function groupByCategoria(rows: Array<{
  indicador: string;
  categoria: string;
  valor: string | null;
  unidade: string | null;
}>) {
  const grouped: Record<string, Record<string, { valor: number | null; unidade: string | null }>> = {};
  for (const r of rows) {
    if (!grouped[r.categoria]) grouped[r.categoria] = {};
    grouped[r.categoria][r.indicador] = {
      valor: r.valor !== null ? parseFloat(r.valor) : null,
      unidade: r.unidade,
    };
  }
  return grouped;
}

// ---------------------------------------------------------------------------
// GET /api/territories/pdad
// Lista todas as RAs com indicadores-chave
// ---------------------------------------------------------------------------
territoriesRestRouter.get("/pdad", async (req: Request, res: Response) => {
  const ano = parseInt(req.query.ano as string) || 2021;
  const categoria = req.query.categoria as string | undefined;
  const fonte = req.query.fonte as string | undefined;

  const db = await getDb();
  if (!db) {
    return res.status(503).json({
      error: "Database unavailable",
      message: "Banco de dados temporariamente indisponível",
    });
  }

  try {
    const conditions: any[] = [eq(pdadIndicators.ano, ano)];
    if (fonte) conditions.push(eq(pdadIndicators.fonte, fonte));
    if (categoria) conditions.push(eq(pdadIndicators.categoria, categoria));

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
    const raMap: Record<string, any> = {};
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

    const regioes = Object.values(raMap).map((ra: any) => ({
      ra_codigo: ra.ra_codigo,
      ra_nome: ra.ra_nome,
      indicadores: groupByCategoria(ra.indicadores),
    }));

    return res.json({
      total: regioes.length,
      ano,
      fonte: fonte ?? `PDAD-${ano}`,
      regioes,
    });
  } catch (error) {
    console.error("[REST /pdad] Erro:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/territories/pdad/ranking/:indicador
// Ranking de RAs por indicador
// ---------------------------------------------------------------------------
territoriesRestRouter.get("/pdad/ranking/:indicador", async (req: Request, res: Response) => {
  const { indicador } = req.params;
  const ano = parseInt(req.query.ano as string) || 2021;
  const ordem = (req.query.ordem as string) === "asc" ? "asc" : "desc";
  const limite = Math.min(parseInt(req.query.limite as string) || 10, 35);

  const db = await getDb();
  if (!db) return res.status(503).json({ error: "Database unavailable" });

  try {
    const orderFn = ordem === "desc" ? desc : asc;
    const rows = await db
      .select({
        ra_codigo: pdadIndicators.ra_codigo,
        ra_nome: pdadIndicators.ra_nome,
        valor: pdadIndicators.valor,
        unidade: pdadIndicators.unidade,
      })
      .from(pdadIndicators)
      .where(and(eq(pdadIndicators.indicador, indicador), eq(pdadIndicators.ano, ano)))
      .orderBy(orderFn(pdadIndicators.valor))
      .limit(limite);

    return res.json({
      indicador,
      ano,
      ordem,
      ranking: rows.map((r, i) => ({
        posicao: i + 1,
        ra_codigo: r.ra_codigo,
        ra_nome: r.ra_nome,
        valor: r.valor !== null ? parseFloat(r.valor) : null,
        unidade: r.unidade,
      })),
    });
  } catch (error) {
    console.error("[REST /pdad/ranking] Erro:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/territories/pdad/compare
// Compara indicadores entre múltiplas RAs
// ---------------------------------------------------------------------------
territoriesRestRouter.get("/pdad/compare", async (req: Request, res: Response) => {
  const rasParam = req.query.ras as string;
  const ano = parseInt(req.query.ano as string) || 2021;

  if (!rasParam) {
    return res.status(400).json({
      error: "Parâmetro 'ras' é obrigatório (ex: ?ras=RA01,RA09,RA16)",
    });
  }

  const raCodigos = rasParam.split(",").map(normalizeRa);
  if (raCodigos.length < 2) {
    return res.status(400).json({ error: "Informe ao menos 2 RAs para comparação" });
  }

  const db = await getDb();
  if (!db) return res.status(503).json({ error: "Database unavailable" });

  try {
    const rows = await db
      .select()
      .from(pdadIndicators)
      .where(
        and(
          eq(pdadIndicators.ano, ano),
          sql`${pdadIndicators.ra_codigo} IN (${sql.join(
            raCodigos.map((r) => sql`${r}`),
            sql`, `
          )})`
        )
      )
      .orderBy(asc(pdadIndicators.ra_codigo), asc(pdadIndicators.indicador));

    const pivot: Record<string, Record<string, number | null>> = {};
    const raNames: Record<string, string> = {};

    for (const row of rows) {
      raNames[row.ra_codigo] = row.ra_nome;
      if (!pivot[row.indicador]) pivot[row.indicador] = {};
      pivot[row.indicador][row.ra_codigo] =
        row.valor !== null ? parseFloat(row.valor) : null;
    }

    return res.json({
      ano,
      ras: raCodigos.map((c) => ({ codigo: c, nome: raNames[c] ?? c })),
      comparacao: Object.entries(pivot).map(([indicador, valores]) => ({
        indicador,
        valores,
      })),
    });
  } catch (error) {
    console.error("[REST /pdad/compare] Erro:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/territories/pdad/:ra
// Todos os indicadores de uma RA específica
// ---------------------------------------------------------------------------
territoriesRestRouter.get("/pdad/:ra", async (req: Request, res: Response) => {
  const raCodigo = normalizeRa(req.params.ra);
  const ano = parseInt(req.query.ano as string) || 2021;
  const fonte = req.query.fonte as string | undefined;

  const db = await getDb();
  if (!db) return res.status(503).json({ error: "Database unavailable" });

  try {
    const conditions: any[] = [
      eq(pdadIndicators.ra_codigo, raCodigo),
      eq(pdadIndicators.ano, ano),
    ];
    if (fonte) conditions.push(eq(pdadIndicators.fonte, fonte));

    const rows = await db
      .select()
      .from(pdadIndicators)
      .where(and(...conditions))
      .orderBy(asc(pdadIndicators.categoria), asc(pdadIndicators.indicador));

    if (!rows.length) {
      return res.status(404).json({
        error: "Not found",
        message: `Nenhum indicador encontrado para ${raCodigo} (ano: ${ano})`,
      });
    }

    const raInfo = rows[0];
    return res.json({
      ra_codigo: raInfo.ra_codigo,
      ra_nome: raInfo.ra_nome,
      ano: raInfo.ano,
      fonte: raInfo.fonte,
      total_indicadores: rows.length,
      indicadores_por_categoria: groupByCategoria(
        rows.map((r) => ({
          indicador: r.indicador,
          categoria: r.categoria,
          valor: r.valor,
          unidade: r.unidade,
        }))
      ),
      indicadores_raw: rows.map((r) => ({
        indicador: r.indicador,
        categoria: r.categoria,
        valor: r.valor !== null ? parseFloat(r.valor) : null,
        unidade: r.unidade,
        observacao: r.observacao,
      })),
    });
  } catch (error) {
    console.error(`[REST /pdad/${raCodigo}] Erro:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/territories/pdad/:ra/summary
// Resumo estratégico de uma RA
// ---------------------------------------------------------------------------
territoriesRestRouter.get("/pdad/:ra/summary", async (req: Request, res: Response) => {
  const raCodigo = normalizeRa(req.params.ra);
  const ano = parseInt(req.query.ano as string) || 2021;

  const db = await getDb();
  if (!db) return res.status(503).json({ error: "Database unavailable" });

  try {
    // Tenta buscar resumo pré-gerado
    const summaryRows = await db
      .select()
      .from(pdadRaSummaries)
      .where(
        and(
          eq(pdadRaSummaries.ra_codigo, raCodigo),
          eq(pdadRaSummaries.ano, ano)
        )
      )
      .limit(1);

    if (summaryRows.length > 0) {
      return res.json(summaryRows[0]);
    }

    // Gera resumo dinâmico a partir dos indicadores
    const indicators = await db
      .select()
      .from(pdadIndicators)
      .where(
        and(
          eq(pdadIndicators.ra_codigo, raCodigo),
          eq(pdadIndicators.ano, ano)
        )
      );

    if (!indicators.length) {
      return res.status(404).json({
        error: "Not found",
        message: `Nenhum dado encontrado para ${raCodigo} (ano: ${ano})`,
      });
    }

    const indMap: Record<string, number> = {};
    for (const ind of indicators) {
      if (ind.valor !== null) indMap[ind.indicador] = parseFloat(ind.valor);
    }

    const raInfo = indicators[0];
    const summary = generateDynamicSummary(raCodigo, raInfo.ra_nome, indMap);

    return res.json({
      ra_codigo: raCodigo,
      ra_nome: raInfo.ra_nome,
      ano,
      ...summary,
      gerado_por: "crivo-etl-dynamic",
      _note: "Resumo gerado dinamicamente. Execute generate_summaries.py para versão completa com IA.",
    });
  } catch (error) {
    console.error(`[REST /pdad/${raCodigo}/summary] Erro:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Gerador de resumo dinâmico (duplicado do router tRPC para uso no REST)
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
  const rendaPC = ind.renda_per_capita ?? 0;

  let classificacao: string;
  let indiceVulnerabilidade: number;

  if (rendaPC >= 5000) { classificacao = "muito_alto"; indiceVulnerabilidade = 10 + desemprego * 0.5; }
  else if (rendaPC >= 3000) { classificacao = "alto"; indiceVulnerabilidade = 20 + desemprego * 0.8; }
  else if (rendaPC >= 2000) { classificacao = "medio_alto"; indiceVulnerabilidade = 30 + desemprego; }
  else if (rendaPC >= 1500) { classificacao = "medio"; indiceVulnerabilidade = 40 + desemprego * 1.2; }
  else if (rendaPC >= 1000) { classificacao = "medio_baixo"; indiceVulnerabilidade = 55 + desemprego * 1.5; }
  else if (rendaPC >= 700) { classificacao = "baixo"; indiceVulnerabilidade = 70 + desemprego * 1.8; }
  else { classificacao = "muito_baixo"; indiceVulnerabilidade = 85 + desemprego * 2; }

  indiceVulnerabilidade = Math.min(100, Math.max(0, indiceVulnerabilidade));

  const perfil = `${raNome} (${raCodigo}) possui população de ${pop.toLocaleString("pt-BR")} habitantes, renda domiciliar média de R$ ${renda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} e taxa de desemprego de ${desemprego.toFixed(1)}%. Classificação socioeconômica: ${classificacao.replace(/_/g, " ")}.`;

  const vulns: string[] = [];
  if (desemprego > 15) vulns.push(`desemprego elevado (${desemprego.toFixed(1)}%)`);
  if (bolsaFamilia > 10) vulns.push(`alta dependência de programas sociais (${bolsaFamilia.toFixed(1)}%)`);
  if (agua < 98) vulns.push(`déficit de abastecimento de água (${agua.toFixed(1)}%)`);
  if (esgoto < 97) vulns.push(`déficit de esgotamento sanitário (${esgoto.toFixed(1)}%)`);
  if (internet < 70) vulns.push(`baixo acesso à internet (${internet.toFixed(1)}%)`);

  const opps: string[] = [];
  if (desemprego > 12) opps.push("qualificação profissional e empregabilidade");
  if (bolsaFamilia > 8) opps.push("inclusão produtiva e transferência de renda");
  if (agua < 99 || esgoto < 97) opps.push("saneamento básico");
  if (internet < 80) opps.push("inclusão digital");

  const pautas: string[] = [];
  if (desemprego > 15) pautas.push("emprego e renda");
  if (bolsaFamilia > 10) pautas.push("proteção social");
  if (agua < 98 || esgoto < 97) pautas.push("saneamento e infraestrutura");
  if (jovens > 22) pautas.push("educação e juventude");
  if (idosos > 15) pautas.push("saúde e terceira idade");
  if (superior > 40) pautas.push("inovação e economia do conhecimento");

  const alertas: string[] = [];
  if (bolsaFamilia > 15) alertas.push("Alta concentração de beneficiários sociais — comunicação empática e propositiva");
  if (desemprego > 18) alertas.push("Desemprego crítico — evitar narrativas de prosperidade sem propostas concretas");
  if (internet < 65) alertas.push("Baixa conectividade — priorizar comunicação presencial e offline");
  if (jovens > 25) alertas.push("Público jovem expressivo — adaptar linguagem e pautas");

  return {
    perfil_socioeconomico: perfil,
    vulnerabilidades: vulns.length > 0 ? vulns.join("; ") : "Nenhuma vulnerabilidade crítica identificada",
    oportunidades: opps.length > 0 ? opps.join("; ") : "Manutenção e melhoria incremental dos serviços",
    pautas_eleitorais: pautas.length > 0 ? pautas.join("; ") : "Pautas transversais de qualidade de vida",
    alertas_comunicacao: alertas.length > 0 ? alertas.join(" | ") : "Perfil comunicacional padrão",
    indice_vulnerabilidade: parseFloat(indiceVulnerabilidade.toFixed(2)),
    classificacao,
  };
}
