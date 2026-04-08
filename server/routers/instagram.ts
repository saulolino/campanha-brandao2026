import { publicProcedure, router } from "../\_core/trpc";
import { publishToInstagram, getInstagramPostInfo, getInstagramPostMetrics } from "../instagram";
import { instagramService } from "../services/instagramService";

export const instagramRouter = router({
  /**
   * Obter métricas gerais do Instagram
   * Retorna dados REAIS da API do Instagram
   */
  getMetrics: publicProcedure.query(async () => {
    try {
      if (!instagramService.isConfigured()) {
        throw new Error('Instagram credentials not configured. Please configure INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_GRAPH_API_TOKEN');
      }
      return await instagramService.getMetrics();
    } catch (error) {
      console.error('[Instagram] Failed to fetch metrics:', error);
      throw error;
    }
  }),

  /**
   * Obter posts recentes
   * Retorna dados REAIS da API do Instagram
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
        if (!instagramService.isConfigured()) {
          throw new Error('Instagram credentials not configured. Please configure INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_GRAPH_API_TOKEN');
        }
        return await instagramService.getPosts(input.limit || 10);
      } catch (error) {
        console.error('[Instagram] Failed to fetch posts:', error);
        throw error;
      }
    }),

  /**
   * Obter análise de crescimento
   * Retorna dados REAIS da API do Instagram (últimos 7 dias)
   */
  getGrowth: publicProcedure.query(async () => {
    try {
      if (!instagramService.isConfigured()) {
        throw new Error('Instagram credentials not configured. Please configure INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_GRAPH_API_TOKEN');
      }
      return await instagramService.getGrowth();
    } catch (error) {
      console.error('[Instagram] Failed to fetch growth data:', error);
      throw error;
    }
  }),

  /**
   * Obter informações de um post específico
   * Retorna dados REAIS da API do Instagram
   */
  getPostInfo: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'postId' in val) {
        return val as { postId: string };
      }
      throw new Error('Invalid input: postId is required');
    })
    .query(async ({ input }) => {
      try {
        if (!instagramService.isConfigured()) {
          throw new Error('Instagram credentials not configured');
        }
        return await getInstagramPostInfo(input.postId);
      } catch (error) {
        console.error('[Instagram] Failed to fetch post info:', error);
        throw error;
      }
    }),

  /**
   * Obter métricas de um post específico
   * Retorna dados REAIS da API do Instagram (likes, comments, shares, saves, reach, impressions)
   */
  getPostMetrics: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'postId' in val) {
        return val as { postId: string };
      }
      throw new Error('Invalid input: postId is required');
    })
    .query(async ({ input }) => {
      try {
        if (!instagramService.isConfigured()) {
          throw new Error('Instagram credentials not configured');
        }
        return await getInstagramPostMetrics(input.postId);
      } catch (error) {
        console.error('[Instagram] Failed to fetch post metrics:', error);
        throw error;
      }
    }),

  /**
   * Obter engajamento por tipo de conteúdo
   * Retorna dados REAIS calculados a partir dos posts da API
   */
  getEngagementByType: publicProcedure.query(async () => {
    try {
      if (!instagramService.isConfigured()) {
        throw new Error('Instagram credentials not configured');
      }
      
      const posts = await instagramService.getPosts(100);
      
      const byType: Record<string, any> = {
        reels: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
        carousel: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
        image: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
        video: { posts: 0, engagement: 0, reach: 0, avgEngagement: 0 },
      };

      posts.forEach((post: any) => {
        const type = post.mediaType?.toLowerCase() || 'image';
        const typeKey = type === 'carousel_container' ? 'carousel' : type;
        
        if (byType[typeKey]) {
          byType[typeKey].posts += 1;
          byType[typeKey].engagement += (post.likes || 0) + (post.comments || 0);
          byType[typeKey].reach += post.reach || 0;
        }
      });

      return Object.entries(byType).map(([type, data]: [string, any]) => ({
        type,
        posts: data.posts,
        avgEngagement: data.posts > 0 ? Math.round(data.engagement / data.posts) : 0,
        totalReach: data.reach,
      }));
    } catch (error) {
      console.error('[Instagram] Failed to fetch engagement by type:', error);
      throw error;
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
        if (!instagramService.isConfigured()) {
          throw new Error('Instagram credentials not configured');
        }
        
        const posts = await instagramService.getPosts(50);
        
        const sorted = posts
          .map((post: any) => ({
            id: post.id,
            caption: post.caption,
            mediaType: post.mediaType,
            mediaUrl: post.mediaUrl,
            timestamp: post.timestamp,
            engagement: (post.likes || 0) + (post.comments || 0),
            likes: post.likes || 0,
            comments: post.comments || 0,
            reach: post.reach || 0,
          }))
          .sort((a: any, b: any) => b.engagement - a.engagement)
          .slice(0, input.limit || 5);

        return sorted;
      } catch (error) {
        console.error('[Instagram] Failed to fetch top posts:', error);
        throw error;
      }
    }),
});
