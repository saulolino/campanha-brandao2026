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
import { getDb } from '../db.js';
import { instagramMetrics } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

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
    shares: number;
    saves: number;
    reach: number;
    views: number;
    thumbnailUrl: string;
  }>;
  metrics: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalSaves: number;
    totalReach: number;
    avgEngagement: number;
    engagementRate: number;
    engagementByType: Array<{
      type: string;
      posts: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalSaves: number;
      totalReach: number;
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
    { id: '1', caption: 'Feliz Páscoa! Renascimento e esperança', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/1', timestamp: '2026-04-05T10:00:00Z', likes: 50, comments: 7, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '2', caption: 'Causa animal: Hospital Veterinário Público', mediaType: 'CAROUSEL_ALBUM', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/2', timestamp: '2026-04-03T14:00:00Z', likes: 23, comments: 3, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '3', caption: 'Você lembra do seu voto para Deputado Distrital?', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/3', timestamp: '2026-04-03T18:00:00Z', likes: 53, comments: 4, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '4', caption: 'Defesa do Meio Ambiente é inegociável - PV', mediaType: 'IMAGE', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/4', timestamp: '2026-03-27T12:00:00Z', likes: 25, comments: 1, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '5', caption: 'Master x BRB - Escândalo', mediaType: 'VIDEO', mediaProductType: 'REELS', permalink: 'https://instagram.com/p/5', timestamp: '2026-03-15T19:00:00Z', likes: 85, comments: 19, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '6', caption: 'Deputado Israel Batista', mediaType: 'CAROUSEL_ALBUM', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/6', timestamp: '2026-03-14T14:00:00Z', likes: 107, comments: 10, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
    { id: '7', caption: 'Convidando Marina Silva para o PV', mediaType: 'IMAGE', mediaProductType: 'FEED', permalink: 'https://instagram.com/p/7', timestamp: '2026-01-31T12:00:00Z', likes: 83, comments: 7, shares: 0, saves: 0, reach: 0, views: 0, thumbnailUrl: '' },
  ],
  metrics: {
    totalLikes: 426,
    totalComments: 51,
    totalShares: 0,
    totalSaves: 0,
    totalReach: 0,
    avgEngagement: 68.1,
    engagementRate: 3.1,
    engagementByType: [
      { type: 'VIDEO', posts: 4, totalLikes: 273, totalComments: 37, totalShares: 0, totalSaves: 0, totalReach: 0, avgEngagement: 77.5 },
      { type: 'CAROUSEL_ALBUM', posts: 2, totalLikes: 130, totalComments: 13, totalShares: 0, totalSaves: 0, totalReach: 0, avgEngagement: 71.5 },
      { type: 'IMAGE', posts: 2, totalLikes: 108, totalComments: 8, totalShares: 0, totalSaves: 0, totalReach: 0, avgEngagement: 58.0 },
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
    // Tentar ler do banco de dados primeiro (fonte mais atualizada)
    try {
      const db = await getDb();
      if (db) {
        const rows = await db.select().from(instagramMetrics)
          .orderBy(instagramMetrics.lastSyncedAt)
          .limit(1);
        if (rows.length > 0) {
          const row = rows[0];
          // engagementRate armazenado como inteiro * 100 (ex: 310 = 3.10%)
          const engRate = row.engagementRate / 100;
          const avgEng = row.averageLikes + row.averageComments;
          // Mesclar com dados do JSON para campos não armazenados no banco (likes, comments totais)
          const jsonData = this.data || FALLBACK_DATA;
          return {
            followers: row.followers,
            following: row.following,
            posts: row.postsCount,
            username: row.username,
            name: jsonData.account.name || row.username,
            bio: row.biography || jsonData.account.bio,
            profilePicture: row.profilePictureUrl || jsonData.account.profilePicture,
            engagement: jsonData.metrics.totalLikes + jsonData.metrics.totalComments + (jsonData.metrics.totalShares || 0) + (jsonData.metrics.totalSaves || 0),
            reach: jsonData.metrics.totalReach || 0,
            impressions: 0,
            saves: jsonData.metrics.totalSaves || 0,
            shares: jsonData.metrics.totalShares || 0,
            comments: jsonData.metrics.totalComments,
            likes: jsonData.metrics.totalLikes,
            engagementRate: engRate,
            avgEngagement: avgEng,
          };
        }
      }
    } catch (dbErr) {
      // Banco indisponível — usar fallback abaixo
    }

    // Fallback: usar dados em memória (JSON carregado no startup)
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
      engagement: metrics.totalLikes + metrics.totalComments + (metrics.totalShares || 0) + (metrics.totalSaves || 0),
      reach: metrics.totalReach || 0,
      impressions: 0,
      saves: metrics.totalSaves || 0,
      shares: metrics.totalShares || 0,
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
        shares: post.shares || 0,
        saves: post.saves || 0,
        reach: post.reach || 0,
        impressions: post.views || 0,
        engagement: post.likes + post.comments + (post.shares || 0) + (post.saves || 0),
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
      totalReach: item.totalReach || 0,
      totalShares: item.totalShares || 0,
      totalSaves: item.totalSaves || 0,
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

      // Tipo completo de post com insights
      type PostWithInsights = {
        id: string; caption: string; mediaType: string; mediaProductType: string;
        permalink: string; timestamp: string; likes: number; comments: number;
        shares: number; saves: number; reach: number; views: number; thumbnailUrl: string;
      };

      let posts: PostWithInsights[];

      if (hasMediaPermission) {
        // Buscar insights de cada post em paralelo (shares, saves, reach, views)
        const insightsMap = new Map<string, { shares: number; saves: number; reach: number; views: number }>();
        const insightPromises = postsJson.data!.map(async (p) => {
          try {
            const insightsUrl = `https://graph.facebook.com/v21.0/${p.id}/insights?metric=shares,saved,reach,views,total_interactions&access_token=${token}`;
            const insightsRes = await fetch(insightsUrl);
            if (insightsRes.ok) {
              const insightsJson = await insightsRes.json() as { data?: Array<{ name: string; values: Array<{ value: number }> }> };
              const metrics: { shares: number; saves: number; reach: number; views: number } = { shares: 0, saves: 0, reach: 0, views: 0 };
              (insightsJson.data || []).forEach((m) => {
                const val = m.values?.[0]?.value || 0;
                if (m.name === 'shares') metrics.shares = val;
                else if (m.name === 'saved') metrics.saves = val;
                else if (m.name === 'reach') metrics.reach = val;
                else if (m.name === 'views') metrics.views = val;
              });
              insightsMap.set(p.id, metrics);
            }
          } catch {
            // Insight indisponível para este post — usar zeros
          }
        });
        await Promise.all(insightPromises);
        console.log(`[Instagram] Insights buscados para ${insightsMap.size}/${postsJson.data!.length} posts`);

        posts = postsJson.data!.map(p => {
          const existing = existingPostsMap.get(p.id);
          const ins = insightsMap.get(p.id) || { shares: existing?.shares || 0, saves: existing?.saves || 0, reach: existing?.reach || 0, views: existing?.views || 0 };
          return {
            id: p.id,
            caption: p.caption || '',
            mediaType: p.media_type,
            mediaProductType: p.media_product_type,
            permalink: p.permalink,
            timestamp: p.timestamp,
            likes: (p.like_count != null && p.like_count > 0) ? p.like_count : (existing?.likes || 0),
            comments: (p.comments_count != null && p.comments_count > 0) ? p.comments_count : (existing?.comments || 0),
            shares: ins.shares,
            saves: ins.saves,
            reach: ins.reach,
            views: ins.views,
            thumbnailUrl: p.thumbnail_url || p.media_url || existing?.thumbnailUrl || '',
          };
        });
      } else {
        // Sem permissão para listar mídia: preservar posts existentes e atualizar apenas conta
        console.warn('[Instagram] Sem permissão para listar mídia. Preservando posts e métricas existentes.');
        posts = (this.data?.posts || []).map(p => ({
          ...p,
          shares: p.shares || 0,
          saves: p.saves || 0,
          reach: p.reach || 0,
          views: p.views || 0,
        }));
      }

      const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
      const totalComments = posts.reduce((s, p) => s + p.comments, 0);
      const totalShares = posts.reduce((s, p) => s + p.shares, 0);
      const totalSaves = posts.reduce((s, p) => s + p.saves, 0);
      const totalReach = posts.reduce((s, p) => s + p.reach, 0);
      const avgEngagement = posts.length > 0 ? Math.round((totalLikes + totalComments + totalShares + totalSaves) / posts.length) : 0;
      const engagementRate = accountData.followers_count > 0 ? parseFloat(((avgEngagement / accountData.followers_count) * 100).toFixed(2)) : 0;

      // Calcular engajamento por tipo
      const byType: Record<string, { posts: number; totalLikes: number; totalComments: number; totalShares: number; totalSaves: number; totalReach: number }> = {};
      posts.forEach(p => {
        if (!byType[p.mediaType]) byType[p.mediaType] = { posts: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0, totalReach: 0 };
        byType[p.mediaType].posts++;
        byType[p.mediaType].totalLikes += p.likes;
        byType[p.mediaType].totalComments += p.comments;
        byType[p.mediaType].totalShares += p.shares;
        byType[p.mediaType].totalSaves += p.saves;
        byType[p.mediaType].totalReach += p.reach;
      });
      // Preservar engagementByType existente se não houver posts novos
      const engagementByType = Object.keys(byType).length > 0
        ? Object.entries(byType).map(([type, d]) => ({
            type,
            posts: d.posts,
            totalLikes: d.totalLikes,
            totalComments: d.totalComments,
            totalShares: d.totalShares,
            totalSaves: d.totalSaves,
            totalReach: d.totalReach,
            avgEngagement: d.posts > 0 ? Math.round((d.totalLikes + d.totalComments + d.totalShares + d.totalSaves) / d.posts) : 0,
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
        metrics: { totalLikes, totalComments, totalShares, totalSaves, totalReach, avgEngagement, engagementRate, engagementByType },
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

      // Persistir no banco de dados (fonte de verdade para todas as páginas)
      try {
        const db = await getDb();
        if (db) {
          const existing = await db.select().from(instagramMetrics)
            .where(eq(instagramMetrics.username, accountData.username)).limit(1);
          const dbPayload = {
            username: accountData.username,
            followers: accountData.followers_count,
            following: accountData.follows_count,
            postsCount: accountData.media_count,
            biography: accountData.biography || '',
            profilePictureUrl: accountData.profile_picture_url || '',
            engagementRate: Math.round(engagementRate * 100), // armazenar como inteiro (ex: 310 = 3.10%)
            averageLikes: Math.round(totalLikes / Math.max(posts.length, 1)),
            averageComments: Math.round(totalComments / Math.max(posts.length, 1)),
            lastSyncedAt: new Date(fetchedAt),
          };
          if (existing.length > 0) {
            await db.update(instagramMetrics).set(dbPayload)
              .where(eq(instagramMetrics.username, accountData.username));
          } else {
            await db.insert(instagramMetrics).values(dbPayload);
          }
          console.log('[Instagram] Métricas salvas no banco de dados.');
        }
      } catch (dbErr) {
        console.warn('[Instagram] Não foi possível salvar no banco (dados em memória/JSON preservados):', dbErr);
      }

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
