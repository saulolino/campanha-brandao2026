import { publicProcedure, router } from "../\_core/trpc";
import { publishToInstagram, getInstagramPostInfo, getInstagramPostMetrics } from "../instagram";
import { instagramService } from "../services/instagramService";

/**
 * Métricas simuladas do Instagram
 * TODO: Substituir por chamadas reais à API do Instagram quando tiver credenciais
 */
const SIMULATED_METRICS = {
  followers: 12450,
  posts: 145,
  engagement: 8.5,
  reach: 45230,
  impressions: 89450,
  saves: 1250,
  shares: 890,
  comments: 2340,
  likes: 15670,
};

const SIMULATED_POSTS = [
  {
    id: '1',
    caption: 'Brasília Cidade Parque - Conheça nosso projeto!',
    mediaType: 'IMAGE',
    mediaUrl: 'https://via.placeholder.com/1080x1080?text=Post+1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 1250,
    comments: 145,
    shares: 89,
    saves: 234,
    reach: 5420,
    impressions: 8950,
  },
  {
    id: '2',
    caption: 'Campanha Eduardo Brandão - Vota em nós!',
    mediaType: 'VIDEO',
    mediaUrl: 'https://via.placeholder.com/1080x1080?text=Post+2',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 2340,
    comments: 234,
    shares: 156,
    saves: 456,
    reach: 8230,
    impressions: 12450,
  },
  {
    id: '3',
    caption: 'Últimas notícias da campanha',
    mediaType: 'CAROUSEL',
    mediaUrl: 'https://via.placeholder.com/1080x1080?text=Post+3',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 890,
    comments: 67,
    shares: 45,
    saves: 123,
    reach: 3210,
    impressions: 5670,
  },
];

const SIMULATED_GROWTH = {
  daily: [
    { date: '2026-04-01', followers: 12100, engagement: 7.8 },
    { date: '2026-04-02', followers: 12200, engagement: 8.1 },
    { date: '2026-04-03', followers: 12300, engagement: 8.3 },
    { date: '2026-04-04', followers: 12350, engagement: 8.4 },
    { date: '2026-04-05', followers: 12400, engagement: 8.5 },
    { date: '2026-04-06', followers: 12425, engagement: 8.6 },
    { date: '2026-04-07', followers: 12450, engagement: 8.5 },
  ],
};

export const instagramRouter = router({
  /**
   * Obter métricas gerais do Instagram
   */
  getMetrics: publicProcedure.query(async () => {
    try {
      // Tentar usar API real se configurada, senão usar dados simulados
      if (instagramService.isConfigured()) {
        return await instagramService.getMetrics();
      }
      return SIMULATED_METRICS;
    } catch (error) {
      console.error('[Instagram] Failed to fetch metrics:', error);
      return SIMULATED_METRICS; // Retornar dados simulados em caso de erro
    }
  }),

  /**
   * Obter posts recentes
   */
  getPosts: publicProcedure.query(async () => {
    try {
      // Tentar usar API real se configurada, senão usar dados simulados
      if (instagramService.isConfigured()) {
        return await instagramService.getPosts();
      }
      return SIMULATED_POSTS;
    } catch (error) {
      console.error('[Instagram] Failed to fetch posts:', error);
      return SIMULATED_POSTS; // Retornar dados simulados em caso de erro
    }
  }),

  /**
   * Obter análise de crescimento
   */
  getGrowth: publicProcedure.query(async () => {
    try {
      // Tentar usar API real se configurada, senão usar dados simulados
      if (instagramService.isConfigured()) {
        return await instagramService.getGrowth();
      }
      return SIMULATED_GROWTH;
    } catch (error) {
      console.error('[Instagram] Failed to fetch growth data:', error);
      return SIMULATED_GROWTH; // Retornar dados simulados em caso de erro
    }
  }),

  /**
   * Obter informações de um post específico
   */
  getPostInfo: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'postId' in val) {
        return val as { postId: string };
      }
      throw new Error('Invalid input');
    })
    .query(async ({ input }) => {
      try {
        return await getInstagramPostInfo(input.postId);
      } catch (error) {
        console.error('[Instagram] Failed to fetch post info:', error);
        // Retornar dados simulados
        return SIMULATED_POSTS.find((p) => p.id === input.postId) || SIMULATED_POSTS[0];
      }
    }),

  /**
   * Obter métricas de um post específico
   */
  getPostMetrics: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'postId' in val) {
        return val as { postId: string };
      }
      throw new Error('Invalid input');
    })
    .query(async ({ input }) => {
      try {
        return await getInstagramPostMetrics(input.postId);
      } catch (error) {
        console.error('[Instagram] Failed to fetch post metrics:', error);
        // Retornar dados simulados
        const post = SIMULATED_POSTS.find((p) => p.id === input.postId) || SIMULATED_POSTS[0];
        return {
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saves: post.saves,
          reach: post.reach,
          impressions: post.impressions,
        };
      }
    }),
});
