/**
 * Router de Relatório de Performance do Instagram
 * Gera relatórios comparativos com análise de IA como especialista sênior em redes sociais.
 * Fonte de dados: banco de dados MySQL (tabela instagram_published_posts)
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { instagramService } from "../services/instagramService";
import { getDb, getInstagramPublishedPostsByDateRange, getInstagramPublishedPosts, saveReport, listSavedReports, getSavedReportById, deleteSavedReport } from "../db";
import { instagramFollowersHistory } from "../../drizzle/schema";
import { gte, lte, and } from "drizzle-orm";
import type { InstagramPublishedPost } from "../../drizzle/schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcMetrics(posts: InstagramPublishedPost[]) {
  if (posts.length === 0) {
    return { totalPosts: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0, totalEngagement: 0, avgEngagement: 0, avgLikes: 0, avgComments: 0 };
  }
  const totalLikes = posts.reduce((s, p) => s + (p.likes ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments ?? 0), 0);
  const totalShares = posts.reduce((s, p) => s + (p.shares ?? 0), 0);
  const totalSaves = posts.reduce((s, p) => s + (p.saves ?? 0), 0);
  const totalEngagement = totalLikes + totalComments + totalShares + totalSaves;
  return {
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    totalEngagement,
    avgEngagement: Math.round(totalEngagement / posts.length),
    avgLikes: Math.round(totalLikes / posts.length),
    avgComments: Math.round(totalComments / posts.length),
  };
}

function pct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

function topN(posts: InstagramPublishedPost[], n: number) {
  return [...posts]
    .map((p) => ({
      id: p.instagramId,
      caption: (p.caption || '').slice(0, 120),
      mediaType: p.mediaType,
      mediaProductType: p.mediaProductType,
      permalink: p.permalink || '',
      timestamp: p.postedAt.toISOString(),
      thumbnailUrl: p.thumbnailUrl || '',
      likes: p.likes ?? 0,
      comments: p.comments ?? 0,
      shares: p.shares ?? 0,
      saves: p.saves ?? 0,
      engagement: (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, n);
}

function worstN(posts: InstagramPublishedPost[], n: number) {
  return [...posts]
    .map((p) => ({
      id: p.instagramId,
      caption: (p.caption || '').slice(0, 120),
      mediaType: p.mediaType,
      permalink: p.permalink || '',
      timestamp: p.postedAt.toISOString(),
      thumbnailUrl: p.thumbnailUrl || '',
      likes: p.likes ?? 0,
      comments: p.comments ?? 0,
      engagement: (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0),
    }))
    .sort((a, b) => a.engagement - b.engagement)
    .slice(0, n);
}

function byType(posts: InstagramPublishedPost[]) {
  const map: Record<string, { type: string; posts: number; totalLikes: number; totalComments: number; totalEngagement: number; avgEngagement: number }> = {};
  posts.forEach((p) => {
    const t = p.mediaType || 'IMAGE';
    if (!map[t]) map[t] = { type: t, posts: 0, totalLikes: 0, totalComments: 0, totalEngagement: 0, avgEngagement: 0 };
    const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
    map[t].posts++;
    map[t].totalLikes += p.likes ?? 0;
    map[t].totalComments += p.comments ?? 0;
    map[t].totalEngagement += eng;
  });
  return Object.values(map).map((t) => ({
    ...t,
    avgEngagement: t.posts > 0 ? Math.round(t.totalEngagement / t.posts) : 0,
  }));
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const reportRouter = router({
  /**
   * Gera um relatório completo de performance para o período informado.
   * Busca posts diretamente do banco MySQL (instagram_published_posts).
   * Inclui métricas, comparativo com período anterior e análise de IA.
   */
  generate: publicProcedure
    .input(
      z.object({
        from: z.string().describe("Data de início (ISO 8601 ou YYYY-MM-DD)"),
        to: z.string().describe("Data de fim (ISO 8601 ou YYYY-MM-DD)"),
      })
    )
    .mutation(async ({ input }) => {
      const fromDate = new Date(input.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(input.to);
      toDate.setHours(23, 59, 59, 999);

      // Período anterior equivalente (mesma duração)
      const durationMs = toDate.getTime() - fromDate.getTime();
      const prevToDate = new Date(fromDate.getTime() - 1);
      const prevFromDate = new Date(prevToDate.getTime() - durationMs);

      // ── Buscar posts do banco MySQL ──────────────────────────────────────
      // Período atual
      const currentPosts = await getInstagramPublishedPostsByDateRange(fromDate, toDate);

      // Período anterior — busca diretamente do banco por intervalo
      const prevPosts = await getInstagramPublishedPostsByDateRange(prevFromDate, prevToDate);

      // Fallback: se o banco estiver vazio, tenta buscar via instagramService (JSON)
      let usingFallback = false;
      let allPostsFallback: InstagramPublishedPost[] = [];
      if (currentPosts.length === 0 && prevPosts.length === 0) {
        // Verificar se há qualquer post no banco
        const anyPosts = await getInstagramPublishedPosts(1);
        if (anyPosts.length === 0) {
          // Banco vazio — usar JSON como fallback temporário
          usingFallback = true;
          const jsonPosts = await instagramService.getPosts(200);
          // Converter para formato compatível com InstagramPublishedPost
          allPostsFallback = jsonPosts.map((p: any) => ({
            id: 0,
            instagramId: p.id || '',
            caption: p.caption || '',
            mediaType: p.mediaType || 'IMAGE',
            mediaProductType: p.mediaProductType || 'FEED',
            permalink: p.permalink || '',
            thumbnailUrl: p.thumbnailUrl || '',
            mediaUrl: p.mediaUrl || '',
            likes: p.likes ?? 0,
            comments: p.comments ?? 0,
            shares: p.shares ?? 0,
            saves: p.saves ?? 0,
            reach: p.reach ?? 0,
            views: p.views ?? 0,
            postedAt: new Date(p.timestamp || p.postedAt || Date.now()),
            syncSource: 'json',
            lastSyncedAt: new Date(),
            engagementAlertSentAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }

      // Selecionar fonte de dados
      let currentPostsFinal: InstagramPublishedPost[];
      let prevPostsFinal: InstagramPublishedPost[];

      if (usingFallback) {
        currentPostsFinal = allPostsFallback.filter((p) => {
          const ts = p.postedAt;
          return ts >= fromDate && ts <= toDate;
        });
        prevPostsFinal = allPostsFallback.filter((p) => {
          const ts = p.postedAt;
          return ts >= prevFromDate && ts <= prevToDate;
        });
      } else {
        currentPostsFinal = currentPosts;
        prevPostsFinal = prevPosts;
      }

      // Métricas dos dois períodos
      const currentMetrics = calcMetrics(currentPostsFinal);
      const prevMetrics = calcMetrics(prevPostsFinal);

      // Variações percentuais
      const variations = {
        posts: pct(currentMetrics.totalPosts, prevMetrics.totalPosts),
        likes: pct(currentMetrics.totalLikes, prevMetrics.totalLikes),
        comments: pct(currentMetrics.totalComments, prevMetrics.totalComments),
        engagement: pct(currentMetrics.totalEngagement, prevMetrics.totalEngagement),
        avgEngagement: pct(currentMetrics.avgEngagement, prevMetrics.avgEngagement),
      };

      // Top e piores posts do período
      const topPosts = topN(currentPostsFinal, 5);
      const worstPosts = worstN(currentPostsFinal, 3);

      // Engajamento por tipo de conteúdo
      const byTypeData = byType(currentPostsFinal);

      // Dados de seguidores do banco (snapshot histórico)
      let followersStart: number | null = null;
      let followersEnd: number | null = null;
      let followerGrowth: number | null = null;
      let followerGrowthPct: number | null = null;
      try {
        const db = await getDb();
        if (db) {
          const fromStr = fromDate.toISOString().slice(0, 10);
          const toStr = toDate.toISOString().slice(0, 10);
          const rows = await db
            .select()
            .from(instagramFollowersHistory)
            .where(
              and(
                gte(instagramFollowersHistory.snapshotDate, fromStr),
                lte(instagramFollowersHistory.snapshotDate, toStr)
              )
            )
            .orderBy(instagramFollowersHistory.snapshotDate);
          if (rows.length > 0) {
            followersStart = rows[0].followers;
            followersEnd = rows[rows.length - 1].followers;
            followerGrowth = (followersEnd as number) - (followersStart as number);
            followerGrowthPct = (followersStart as number) > 0 ? parseFloat(((followerGrowth / (followersStart as number)) * 100).toFixed(1)) : null;
          }
        }
      } catch { /* fallback sem dados de seguidores */ }

      // Seguidores atuais como fallback
      const currentAccountMetrics = await instagramService.getMetrics();
      const currentFollowers = currentAccountMetrics.followers;

      // ── Análise de IA ────────────────────────────────────────────────────
      const periodLabel = `${fromDate.toLocaleDateString('pt-BR')} a ${toDate.toLocaleDateString('pt-BR')}`;
      const prevPeriodLabel = `${prevFromDate.toLocaleDateString('pt-BR')} a ${prevToDate.toLocaleDateString('pt-BR')}`;

      const topPostsSummary = topPosts
        .map((p, i) => `${i + 1}. "${p.caption.slice(0, 80)}..." — ${p.engagement} engajamentos (${p.likes} curtidas, ${p.comments} comentários)`)
        .join('\n');

      const byTypeSummary = byTypeData
        .map((t) => `${t.type}: ${t.posts} posts, média ${t.avgEngagement} engajamentos`)
        .join(', ');

      const systemPrompt = `Você é um especialista sênior em redes sociais com 15 anos de experiência em marketing político digital no Brasil. Você analisa perfis de candidatos políticos com foco em crescimento orgânico, engajamento autêntico e construção de narrativa eleitoral. Seu tom é direto, analítico e estratégico — como um consultor de alto nível falando com o candidato e sua equipe. Você usa dados concretos para embasar cada afirmação. Responda SEMPRE em português brasileiro.`;

      const userPrompt = `Analise o desempenho do perfil @eduardobrandaopv no Instagram no período de ${periodLabel}.

DADOS DO PERÍODO ATUAL (${periodLabel}):
- Posts publicados: ${currentMetrics.totalPosts}
- Total de curtidas: ${currentMetrics.totalLikes}
- Total de comentários: ${currentMetrics.totalComments}
- Total de compartilhamentos: ${currentMetrics.totalShares}
- Total de salvamentos: ${currentMetrics.totalSaves}
- Engajamento total: ${currentMetrics.totalEngagement}
- Engajamento médio por post: ${currentMetrics.avgEngagement}
${followersStart !== null ? `- Seguidores no início do período: ${followersStart}` : ''}
${followersEnd !== null ? `- Seguidores no final do período: ${followersEnd}` : ''}
${followerGrowth !== null ? `- Crescimento de seguidores: ${followerGrowth > 0 ? '+' : ''}${followerGrowth} (${followerGrowthPct !== null ? followerGrowthPct + '%' : 'N/A'})` : `- Seguidores atuais: ${currentFollowers}`}
${usingFallback ? '\n⚠️ NOTA: Dados obtidos do arquivo JSON local (banco ainda não populado).' : `\n✅ Dados obtidos diretamente do banco de dados MySQL (${currentPostsFinal.length} posts no período).`}

COMPARATIVO COM PERÍODO ANTERIOR (${prevPeriodLabel}):
- Posts: ${prevMetrics.totalPosts} → ${currentMetrics.totalPosts} (${variations.posts !== null ? (variations.posts > 0 ? '+' : '') + variations.posts + '%' : 'sem dados anteriores'})
- Curtidas: ${prevMetrics.totalLikes} → ${currentMetrics.totalLikes} (${variations.likes !== null ? (variations.likes > 0 ? '+' : '') + variations.likes + '%' : 'sem dados anteriores'})
- Comentários: ${prevMetrics.totalComments} → ${currentMetrics.totalComments} (${variations.comments !== null ? (variations.comments > 0 ? '+' : '') + variations.comments + '%' : 'sem dados anteriores'})
- Engajamento médio: ${prevMetrics.avgEngagement} → ${currentMetrics.avgEngagement} (${variations.avgEngagement !== null ? (variations.avgEngagement > 0 ? '+' : '') + variations.avgEngagement + '%' : 'sem dados anteriores'})

TOP 5 POSTS POR ENGAJAMENTO:
${topPostsSummary || 'Nenhum post publicado no período.'}

DISTRIBUIÇÃO POR TIPO DE CONTEÚDO:
${byTypeSummary || 'Sem dados de tipo.'}

CONTEXTO DA CAMPANHA:
- Candidato: Eduardo Brandão
- Cargo: Deputado Distrital (DF 2026)
- Partido: Partido Verde (PV)
- Meta: 20.000 seguidores até outubro de 2026
- Perfil: Engenheiro, ex-Secretário do Meio Ambiente do DF, presidente do PV-DF
- Tema central: Brasília Cidade Parque

Gere um relatório estruturado com as seguintes seções:
1. RESUMO EXECUTIVO (3-4 frases diretas sobre o período)
2. ANÁLISE DE CRESCIMENTO (crescimento de seguidores, ritmo, projeção)
3. ANÁLISE DE ENGAJAMENTO (qualidade do engajamento, comparativo, tendências)
4. ANÁLISE DE CONTEÚDO (o que funcionou, o que não funcionou, padrões identificados)
5. PONTOS FORTES DO PERÍODO (máximo 3, específicos e baseados nos dados)
6. PONTOS DE ATENÇÃO (máximo 3, com dados que justificam)
7. RECOMENDAÇÕES ESTRATÉGICAS (3-5 ações concretas e priorizadas para o próximo período)
8. NOTA GERAL DO PERÍODO (de 0 a 10, com justificativa em 2 frases)

Seja específico, use os números fornecidos, e dê recomendações acionáveis para uma campanha política no DF.`;

      let aiAnalysis = '';
      let aiError = '';
      try {
        const aiResp = await invokeLLM({
          messages: [
            { role: 'system' as const, content: systemPrompt as string },
            { role: 'user' as const, content: userPrompt as string },
          ],
        });
        const rawContent = aiResp?.choices?.[0]?.message?.content;
        aiAnalysis = typeof rawContent === 'string' ? rawContent : '';
      } catch (err: unknown) {
        aiError = err instanceof Error ? err.message : String(err);
        console.error('[Report] Erro na análise de IA:', aiError);
      }

      return {
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          label: periodLabel,
        },
        previousPeriod: {
          from: prevFromDate.toISOString(),
          to: prevToDate.toISOString(),
          label: prevPeriodLabel,
        },
        currentMetrics,
        previousMetrics: prevMetrics,
        variations,
        followers: {
          current: currentFollowers,
          start: followersStart,
          end: followersEnd,
          growth: followerGrowth,
          growthPct: followerGrowthPct,
        },
        topPosts,
        worstPosts,
        byType: byTypeData,
        aiAnalysis,
        aiError: aiError || undefined,
        dataSource: usingFallback ? 'json_fallback' : 'mysql',
        generatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Salva um relatório gerado no banco de dados para histórico.
   */
  save: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        periodFrom: z.string(),
        periodTo: z.string(),
        periodLabel: z.string(),
        currentMetrics: z.any(),
        previousMetrics: z.any(),
        variations: z.any(),
        followersData: z.any().optional(),
        topPosts: z.any().optional(),
        byType: z.any().optional(),
        aiAnalysis: z.string().optional(),
        dataSource: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await saveReport({
        title: input.title,
        periodFrom: new Date(input.periodFrom),
        periodTo: new Date(input.periodTo),
        periodLabel: input.periodLabel,
        currentMetrics: input.currentMetrics,
        previousMetrics: input.previousMetrics,
        variations: input.variations,
        followersData: input.followersData ?? null,
        topPosts: input.topPosts ?? null,
        byType: input.byType ?? null,
        aiAnalysis: input.aiAnalysis ?? null,
        dataSource: input.dataSource ?? 'mysql',
        createdBy: ctx.user?.name ?? ctx.user?.email ?? 'unknown',
      });
      return { success: true, insertId: (result as any).insertId };
    }),

  /**
   * Lista os relatórios salvos (resumo para exibição na lista).
   */
  list: publicProcedure
    .query(async () => {
      const reports = await listSavedReports(50);
      return reports;
    }),

  /**
   * Busca um relatório salvo completo pelo ID.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const report = await getSavedReportById(input.id);
      if (!report) throw new Error('Relatório não encontrado');
      return report;
    }),

  /**
   * Exclui um relatório salvo (apenas coordenador/superadmin).
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const allowed = ['coordinator', 'superadmin'].includes(ctx.user?.role ?? '');
      if (!allowed) throw new Error('Sem permissão para excluir relatórios');
      const ok = await deleteSavedReport(input.id);
      return { success: ok };
    }),
});
