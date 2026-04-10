/**
 * Serviço de Integração com Instagram
 * Lê dados reais extraídos via MCP do Instagram
 * Arquivo fonte: server/data/instagram_real_data.json
 *
 * Em produção, o servidor é compilado para dist/index.js via esbuild.
 * O arquivo de dados é buscado em múltiplos caminhos para garantir compatibilidade
 * tanto em desenvolvimento (tsx) quanto em produção (node dist/index.js).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from '../_core/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InstagramMetricsReal {
  followers: number;
  following: number;
  posts: number;
  username: string;
  name: string;
  bio: string;
  profilePicture: string;
  engagement: number;
  reach: number;
  impressions: number;
  saves: number;
  shares: number;
  comments: number;
  likes: number;
  engagementRate: number;
  avgEngagement: number;
}

export interface InstagramPostReal {
  id: string;
  caption: string;
  mediaType: string;
  mediaProductType: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement: number;
}

interface InstagramData {
  account: {
    username: string;
    name: string;
    bio: string;
    followers: number;
    following: number;
    posts: number;
    profilePicture: string;
  };
  posts: Array<{
    id: string;
    caption: string;
    mediaType: string;
    mediaProductType: string;
    permalink: string;
    timestamp: string;
    likes: number;
    comments: number;
    thumbnailUrl: string;
  }>;
  metrics: {
    totalLikes: number;
    totalComments: number;
    avgEngagement: number;
    engagementRate: number;
    engagementByType: Array<{
      type: string;
      posts: number;
      totalLikes: number;
      totalComments: number;
      avgEngagement: number;
    }>;
  };
  fetchedAt: string;
}

// Dados de fallback baseados nos dados reais conhecidos da pré campanha
// Usados quando o arquivo JSON não está disponível (ex: primeiro deploy)
const FALLBACK_DATA: InstagramData = {
  account: {
    username: 'eduardobrandaopv',
    name: 'Eduardo Brandão',
    bio: 'Presidente do Partido Verde DF | Ex-Secretário do Meio Ambiente | Engenheiro e apaixonado por Brasília',
    followers: 1518,
    following: 2587,
    posts: 260,
    profilePicture: '',
  },
  posts: [
    { id: '1', caption: 'Feliz Páscoa! Renascimento e esperança', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/1', timestamp: '2026-04-05T10:00:00Z', likes: 50, comments: 7, thumbnailUrl: '' },
    { id: '2', caption: 'Causa animal: Hospital Veterinário Público', mediaType: 'CAROUSEL_ALBUM', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/2', timestamp: '2026-04-03T14:00:00Z', likes: 23, comments: 3, thumbnailUrl: '' },
    { id: '3', caption: 'Você lembra do seu voto para Deputado Distrital?', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/3', timestamp: '2026-04-03T18:00:00Z', likes: 53, comments: 4, thumbnailUrl: '' },
    { id: '4', caption: 'Defesa do Meio Ambiente é inegociável - PV', mediaType: 'IMAGE', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/4', timestamp: '2026-03-27T12:00:00Z', likes: 25, comments: 1, thumbnailUrl: '' },
    { id: '5', caption: 'Master x BRB - Escândalo', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/5', timestamp: '2026-03-15T19:00:00Z', likes: 85, comments: 19, thumbnailUrl: '' },
    { id: '6', caption: 'Deputado Israel Batista', mediaType: 'CAROUSEL_ALBUM', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/6', timestamp: '2026-03-14T14:00:00Z', likes: 107, comments: 10, thumbnailUrl: '' },
    { id: '7', caption: 'Convidando Marina Silva para o PV', mediaType: 'IMAGE', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/7', timestamp: '2026-01-31T12:00:00Z', likes: 83, comments: 7, thumbnailUrl: '' },
  ],
  metrics: {
    totalLikes: 426,
    totalComments: 51,
    avgEngagement: 68.1,
    engagementRate: 3.1,
    engagementByType: [
      { type: 'VIDEO', posts: 4, totalLikes: 273, totalComments: 37, avgEngagement: 77.5 },
      { type: 'CAROUSEL_ALBUM', posts: 2, totalLikes: 130, totalComments: 13, avgEngagement: 71.5 },
      { type: 'IMAGE', posts: 2, totalLikes: 108, totalComments: 8, avgEngagement: 58.0 },
    ],
  },
  fetchedAt: '2026-04-08T16:40:00Z',
};

/**
 * Classe para servir dados reais do Instagram
 * Dados extraídos via MCP e armazenados em JSON
 */
export class InstagramService {
  private data: InstagramData | null = null;
  private dataPath: string;

  constructor() {
    // Buscar o arquivo de dados em múltiplos caminhos:
    // 1. Relativo ao arquivo atual (funciona em dev com tsx)
    // 2. Relativo ao process.cwd() (funciona em produção com node dist/)
    // 3. Caminho absoluto baseado em process.cwd()
    const candidates = [
      path.join(__dirname, '..', 'data', 'instagram_real_data.json'),
      path.join(process.cwd(), 'server', 'data', 'instagram_real_data.json'),
      path.join(process.cwd(), 'data', 'instagram_real_data.json'),
    ];

    this.dataPath = candidates.find(p => {
      try { return fs.existsSync(p); } catch { return false; }
    }) || candidates[0];

    this.loadData();
  }

  /**
   * Carregar dados do arquivo JSON
   */
  private loadData(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Instagram] Dados reais carregados: @${this.data?.account?.username}, ${this.data?.posts?.length} posts`);
      } else {
        console.warn(`[Instagram] Arquivo de dados não encontrado em: ${this.dataPath}`);
        console.warn(`[Instagram] Usando dados de fallback (última sincronização conhecida)`);
        this.data = FALLBACK_DATA;
      }
    } catch (error) {
      console.error('[Instagram] Erro ao carregar dados, usando fallback:', error);
      this.data = FALLBACK_DATA;
    }
  }

  /**
   * Recarregar dados (útil após atualização via MCP)
   */
  reload(): void {
    this.loadData();
  }

  /**
   * Buscar métricas da conta
   * Nunca lança erro — usa fallback se necessário
   */
  async getMetrics(): Promise<InstagramMetricsReal> {
    const data = this.data || FALLBACK_DATA;
    const { account, metrics } = data;

    return {
      followers: account.followers,
      following: account.following,
      posts: account.posts,
      username: account.username,
      name: account.name,
      bio: account.bio,
      profilePicture: account.profilePicture,
      engagement: metrics.totalLikes + metrics.totalComments,
      reach: 0,
      impressions: 0,
      saves: 0,
      shares: 0,
      comments: metrics.totalComments,
      likes: metrics.totalLikes,
      engagementRate: metrics.engagementRate,
      avgEngagement: metrics.avgEngagement,
    };
  }

  /**
   * Buscar posts recentes
   * Nunca lança erro — usa fallback se necessário
   */
  async getPosts(limit: number = 10): Promise<InstagramPostReal[]> {
    const data = this.data || FALLBACK_DATA;

    return data.posts
      .slice(0, limit)
      .map((post) => ({
        id: post.id,
        caption: post.caption,
        mediaType: post.mediaType,
        mediaProductType: post.mediaProductType,
        mediaUrl: post.thumbnailUrl || '',
        thumbnailUrl: post.thumbnailUrl || '',
        permalink: post.permalink,
        timestamp: post.timestamp,
        likes: post.likes,
        comments: post.comments,
        shares: 0,
        saves: 0,
        reach: 0,
        impressions: 0,
        engagement: post.likes + post.comments,
      }));
  }

  /**
   * Buscar análise de crescimento baseada em posts recentes
   */
  async getGrowth() {
    const data = this.data || FALLBACK_DATA;
    const posts = data.posts;

    // Agrupar por semana
    const weeklyData: Record<string, { likes: number; comments: number; posts: number }> = {};

    posts.forEach((post) => {
      const date = new Date(post.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { likes: 0, comments: 0, posts: 0 };
      }
      weeklyData[weekKey].likes += post.likes;
      weeklyData[weekKey].comments += post.comments;
      weeklyData[weekKey].posts += 1;
    });

    const daily = Object.entries(weeklyData)
      .map(([date, data]) => ({
        date,
        engagement: data.likes + data.comments,
        posts: data.posts,
        avgEngagement: data.posts > 0 ? Math.round((data.likes + data.comments) / data.posts) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { daily };
  }

  /**
   * Buscar engajamento por tipo de conteúdo
   */
  async getEngagementByType() {
    const data = this.data || FALLBACK_DATA;

    return data.metrics.engagementByType.map((item) => ({
      type: item.type,
      posts: item.posts,
      avgEngagement: item.avgEngagement,
      totalReach: 0,
    }));
  }

  /**
   * Sincronizar dados diretamente da Instagram Graph API
   * Busca followers, posts e métricas em tempo real
   */
  async syncFromAPI(): Promise<{ success: boolean; followers: number; posts: number; fetchedAt: string; error?: string }> {
    const token = ENV.instagramToken;
    const accountId = ENV.instagramAccountId;

    if (!token || !accountId) {
      return { success: false, followers: 0, posts: 0, fetchedAt: new Date().toISOString(), error: 'Credenciais do Instagram não configuradas' };
    }

    try {
      // 1. Buscar dados da conta
      const accountUrl = `https://graph.facebook.com/v21.0/${accountId}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${token}`;
      const accountRes = await fetch(accountUrl);
      if (!accountRes.ok) {
        const errBody = await accountRes.text();
        throw new Error(`Erro ao buscar conta: ${accountRes.status} - ${errBody}`);
      }
      const accountData = await accountRes.json() as {
        username: string; name: string; biography: string;
        followers_count: number; follows_count: number; media_count: number;
        profile_picture_url: string;
      };

      // 2. Buscar posts recentes com métricas
      // Nota: like_count e comments_count requerem permissão instagram_basic
      // Se não disponível, preservamos os dados de engajamento do JSON existente
      const postsUrl = `https://graph.facebook.com/v21.0/${accountId}/media?fields=id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count,thumbnail_url,media_url&limit=25&access_token=${token}`;
      const postsRes = await fetch(postsUrl);
      const postsJson = postsRes.ok ? (await postsRes.json() as {
        data?: Array<{
          id: string; caption?: string; media_type: string; media_product_type: string;
          permalink: string; timestamp: string; like_count?: number; comments_count?: number;
          thumbnail_url?: string; media_url?: string;
        }>;
        error?: { message: string };
      }) : { data: [] };

      // Mapa de posts existentes para preservar likes/comments quando a API não retorna
      const existingPostsMap = new Map((this.data?.posts || []).map(p => [p.id, p]));

      const hasMediaPermission = !postsJson.error && Array.isArray(postsJson.data) && postsJson.data.length > 0;

      let posts: Array<{ id: string; caption: string; mediaType: string; mediaProductType: string; permalink: string; timestamp: string; likes: number; comments: number; thumbnailUrl: string; }>;

      if (hasMediaPermission) {
        posts = postsJson.data!.map(p => {
          const existing = existingPostsMap.get(p.id);
          return {
            id: p.id,
            caption: p.caption || '',
            mediaType: p.media_type,
            mediaProductType: p.media_product_type,
            permalink: p.permalink,
            timestamp: p.timestamp,
            // Usar likes/comments da API se disponíveis, senão preservar do JSON existente
            likes: (p.like_count != null && p.like_count > 0) ? p.like_count : (existing?.likes || 0),
            comments: (p.comments_count != null && p.comments_count > 0) ? p.comments_count : (existing?.comments || 0),
            thumbnailUrl: p.thumbnail_url || p.media_url || existing?.thumbnailUrl || '',
          };
        });
      } else {
        // Sem permissão para listar mídia: preservar posts existentes e atualizar apenas conta
        console.warn('[Instagram] Sem permissão para listar mídia. Preservando posts e métricas existentes.');
        posts = this.data?.posts || [];
      }

      const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
      const totalComments = posts.reduce((s, p) => s + p.comments, 0);
      const avgEngagement = posts.length > 0 ? Math.round((totalLikes + totalComments) / posts.length) : 0;
      const engagementRate = accountData.followers_count > 0 ? parseFloat(((avgEngagement / accountData.followers_count) * 100).toFixed(2)) : 0;

      // Calcular engajamento por tipo
      const byType: Record<string, { posts: number; totalLikes: number; totalComments: number }> = {};
      posts.forEach(p => {
        if (!byType[p.mediaType]) byType[p.mediaType] = { posts: 0, totalLikes: 0, totalComments: 0 };
        byType[p.mediaType].posts++;
        byType[p.mediaType].totalLikes += p.likes;
        byType[p.mediaType].totalComments += p.comments;
      });
      // Preservar engagementByType existente se não houver posts novos
      const engagementByType = Object.keys(byType).length > 0
        ? Object.entries(byType).map(([type, d]) => ({
            type,
            posts: d.posts,
            totalLikes: d.totalLikes,
            totalComments: d.totalComments,
            avgEngagement: d.posts > 0 ? Math.round((d.totalLikes + d.totalComments) / d.posts) : 0,
          }))
        : (this.data?.metrics.engagementByType || []);

      const fetchedAt = new Date().toISOString();

      const newData: InstagramData = {
        account: {
          username: accountData.username,
          name: accountData.name,
          bio: accountData.biography || '',
          followers: accountData.followers_count,
          following: accountData.follows_count,
          posts: accountData.media_count,
          profilePicture: accountData.profile_picture_url || '',
        },
        posts,
        metrics: { totalLikes, totalComments, avgEngagement, engagementRate, engagementByType },
        fetchedAt,
      };

      // Salvar no arquivo JSON para persistir entre reinicializações
      try {
        const dir = path.dirname(this.dataPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.dataPath, JSON.stringify(newData, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('[Instagram] Não foi possível salvar JSON (apenas em memória):', writeErr);
      }

      // Atualizar dados em memória imediatamente
      this.data = newData;

      console.log(`[Instagram] Sincronizado: ${accountData.followers_count} seguidores, ${posts.length} posts`);
      return { success: true, followers: accountData.followers_count, posts: posts.length, fetchedAt };

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Instagram] Erro na sincronização:', msg);
      return { success: false, followers: 0, posts: 0, fetchedAt: new Date().toISOString(), error: msg };
    }
  }

  /**
   * Verificar se os dados estão disponíveis
   * Sempre retorna true pois há dados de fallback
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Obter data da última sincronização
   */
  getLastSyncDate(): string | null {
    return this.data?.fetchedAt || FALLBACK_DATA.fetchedAt;
  }
}

// Instância global do serviço
export const instagramService = new InstagramService();
