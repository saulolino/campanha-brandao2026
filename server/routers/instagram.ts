import { publicProcedure, router } from "../_core/trpc";
import { instagramService } from "../services/instagramService";

export const instagramRouter = router({
  /**
   * Obter métricas gerais do Instagram
   * Retorna dados REAIS extraídos via MCP
   */
  getMetrics: publicProcedure.query(async () => {
    if (!instagramService.isConfigured()) {
      throw new Error('Dados do Instagram não disponíveis. Aguarde a sincronização.');
    }
    return await instagramService.getMetrics();
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
      if (!instagramService.isConfigured()) {
        throw new Error('Dados do Instagram não disponíveis. Aguarde a sincronização.');
      }
      return await instagramService.getPosts(input.limit || 10);
    }),

  /**
   * Obter análise de crescimento
   * Retorna dados REAIS calculados a partir dos posts
   */
  getGrowth: publicProcedure.query(async () => {
    if (!instagramService.isConfigured()) {
      throw new Error('Dados do Instagram não disponíveis. Aguarde a sincronização.');
    }
    return await instagramService.getGrowth();
  }),

  /**
   * Obter engajamento por tipo de conteúdo
   * Retorna dados REAIS calculados a partir dos posts
   */
  getEngagementByType: publicProcedure.query(async () => {
    if (!instagramService.isConfigured()) {
      throw new Error('Dados do Instagram não disponíveis. Aguarde a sincronização.');
    }
    return await instagramService.getEngagementByType();
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
      if (!instagramService.isConfigured()) {
        throw new Error('Dados do Instagram não disponíveis. Aguarde a sincronização.');
      }

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
          engagement: post.likes + post.comments,
          likes: post.likes,
          comments: post.comments,
          reach: post.reach,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, input.limit || 5);

      return sorted;
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
});
