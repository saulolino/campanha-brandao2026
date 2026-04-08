/**
 * Serviço de Integração com Instagram
 * Lê dados reais extraídos via MCP do Instagram
 * Arquivo fonte: server/data/instagram_real_data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

/**
 * Classe para servir dados reais do Instagram
 * Dados extraídos via MCP e armazenados em JSON
 */
export class InstagramService {
  private data: InstagramData | null = null;
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '..', 'data', 'instagram_real_data.json');
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
        console.warn(`[Instagram] Arquivo de dados não encontrado: ${this.dataPath}`);
      }
    } catch (error) {
      console.error('[Instagram] Erro ao carregar dados:', error);
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
   */
  async getMetrics(): Promise<InstagramMetricsReal> {
    if (!this.data) {
      throw new Error('Dados do Instagram não disponíveis. Execute a sincronização via MCP.');
    }

    const { account, metrics } = this.data;

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
   */
  async getPosts(limit: number = 10): Promise<InstagramPostReal[]> {
    if (!this.data) {
      throw new Error('Dados do Instagram não disponíveis. Execute a sincronização via MCP.');
    }

    return this.data.posts
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
    if (!this.data) {
      throw new Error('Dados do Instagram não disponíveis. Execute a sincronização via MCP.');
    }

    const posts = this.data.posts;

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
    if (!this.data) {
      throw new Error('Dados do Instagram não disponíveis. Execute a sincronização via MCP.');
    }

    return this.data.metrics.engagementByType.map((item) => ({
      type: item.type,
      posts: item.posts,
      avgEngagement: item.avgEngagement,
      totalReach: 0,
    }));
  }

  /**
   * Verificar se os dados estão disponíveis
   */
  isConfigured(): boolean {
    return this.data !== null && this.data.posts.length > 0;
  }

  /**
   * Obter data da última sincronização
   */
  getLastSyncDate(): string | null {
    return this.data?.fetchedAt || null;
  }
}

// Instância global do serviço
export const instagramService = new InstagramService();
