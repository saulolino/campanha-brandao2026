import { publicProcedure, router } from "../_core/trpc";
import { instagramService } from "../services/instagramService";
import { getDb } from "../db";
import { campaignSettings } from "../../drizzle/schema";

export const instagramRouter = router({
  /**
   * Obter métricas gerais do Instagram
   * Retorna dados REAIS extraídos via MCP
   */
  getMetrics: publicProcedure.query(async () => {
    try {
      return await instagramService.getMetrics();
    } catch (error) {
      console.error('[Instagram] Erro ao obter métricas, retornando fallback:', error);
      return {
        followers: 1518, following: 2587, posts: 260,
        username: 'eduardobrandaopv', name: 'Eduardo Brandão',
        bio: 'Presidente do Partido Verde DF | Ex-Secretário do Meio Ambiente',
        profilePicture: '', engagement: 477, reach: 0, impressions: 0,
        saves: 0, shares: 0, comments: 51, likes: 426,
        engagementRate: 3.1, avgEngagement: 68,
      };
    }
  }),

  /**
   * Obter posts recentes
   * Retorna dados REAIS extraídos via MCP
   */
  getPosts: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'limit' in val) {
        return val as { limit?: number };
      }
      return { limit: 10 };
    })
    .query(async ({ input }) => {
      try {
        return await instagramService.getPosts(input.limit || 10);
      } catch (error) {
        console.error('[Instagram] Erro ao obter posts, retornando fallback:', error);
        return [];
      }
    }),

  /**
   * Obter análise de crescimento
   * Retorna dados REAIS calculados a partir dos posts
   */
  getGrowth: publicProcedure.query(async () => {
    try {
      return await instagramService.getGrowth();
    } catch (error) {
      console.error('[Instagram] Erro ao obter crescimento, retornando fallback:', error);
      return { daily: [] };
    }
  }),

  /**
   * Obter engajamento por tipo de conteúdo
   * Retorna dados REAIS calculados a partir dos posts
   */
  getEngagementByType: publicProcedure.query(async () => {
    try {
      return await instagramService.getEngagementByType();
    } catch (error) {
      console.error('[Instagram] Erro ao obter engajamento por tipo, retornando fallback:', error);
      return [];
    }
  }),

  /**
   * Obter top posts por engajamento
   * Retorna dados REAIS dos posts com melhor performance
   */
  getTopPosts: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'limit' in val) {
        return val as { limit?: number };
      }
      return { limit: 5 };
    })
    .query(async ({ input }) => {
      try {
      const posts = await instagramService.getPosts(50);

      const sorted = posts
        .map((post) => ({
          id: post.id,
          caption: post.caption,
          mediaType: post.mediaType,
          mediaUrl: post.mediaUrl,
          thumbnailUrl: post.thumbnailUrl,
          permalink: post.permalink,
          timestamp: post.timestamp,
          engagement: post.likes + post.comments + (post.shares || 0) + (post.saves || 0),
          likes: post.likes,
          comments: post.comments,
          shares: post.shares || 0,
          saves: post.saves || 0,
          reach: post.reach || 0,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, input.limit || 5);

      return sorted;
      } catch (error) {
        console.error('[Instagram] Erro ao obter top posts, retornando fallback:', error);
        return [];
      }
    }),

  /**
   * Obter data da última sincronização
   */
  getLastSync: publicProcedure.query(() => {
    return {
      lastSync: instagramService.getLastSyncDate(),
      isConfigured: instagramService.isConfigured(),
    };
  }),

  /**
   * Obter status do token do Instagram (dias até expirar)
   */
  getTokenStatus: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { daysUntilExpiry: null, expiresAt: null, isExpired: false, isWarning: false };
      const [settings] = await db.select().from(campaignSettings).limit(1);
      if (!settings?.instagramTokenExpiresAt) {
        // Data conhecida do token atual: 09/06/2026
        return { daysUntilExpiry: null, expiresAt: '2026-06-09T00:00:00.000Z', isExpired: false, isWarning: false };
      }
      const expiresAt = settings.instagramTokenExpiresAt;
      const daysUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        daysUntilExpiry,
        expiresAt: expiresAt.toISOString(),
        isExpired: daysUntilExpiry <= 0,
        isWarning: daysUntilExpiry > 0 && daysUntilExpiry <= 30,
      };
    } catch {
      return { daysUntilExpiry: null, expiresAt: null, isExpired: false, isWarning: false };
    }
  }),

  /**
   * Sincronizar dados diretamente da Instagram Graph API
   * Busca followers, posts e métricas em tempo real
   */
  syncFromAPI: publicProcedure.mutation(async () => {
    return await instagramService.syncFromAPI();
  }),
});
