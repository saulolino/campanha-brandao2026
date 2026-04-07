/**
 * Serviço de Integração com Instagram Graph API
 * Conecta com a API real do Instagram para buscar dados de contas business
 */

import { ENV } from '../_core/env';

export interface InstagramMetricsReal {
  followers: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
  saves: number;
  shares: number;
  comments: number;
  likes: number;
}

export interface InstagramPostReal {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  mediaUrl: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
}

/**
 * Classe para integração com Instagram Graph API
 * Requer: INSTAGRAM_BUSINESS_ACCOUNT_ID e INSTAGRAM_ACCESS_TOKEN
 */
export class InstagramService {
  private accountId: string;
  private accessToken: string;
  private apiVersion = 'v18.0';
  private baseUrl = 'https://graph.instagram.com';

  constructor(accountId?: string, accessToken?: string) {
    this.accountId = accountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';
    this.accessToken = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || '';

    if (!this.accountId || !this.accessToken) {
      console.warn('[Instagram] Credenciais não configuradas. Usando dados simulados.');
    }
  }

  /**
   * Fazer requisição para Instagram Graph API
   */
  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!this.accessToken) {
      throw new Error('Instagram Access Token não configurado');
    }

    const url = new URL(`${this.baseUrl}/${this.apiVersion}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Instagram API Error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Instagram] Request failed:', error);
      throw error;
    }
  }

  /**
   * Buscar métricas da conta business
   */
  async getMetrics(): Promise<InstagramMetricsReal> {
    try {
      const fields = [
        'followers_count',
        'media_count',
        'biography',
        'website',
        'profile_picture_url',
      ];

      const data = await this.makeRequest(`/${this.accountId}`, {
        fields: fields.join(','),
      });

      // Buscar métricas de engajamento
      const insightsData = await this.makeRequest(`/${this.accountId}/insights`, {
        metric: 'impressions,reach,profile_views',
        period: 'day',
      });

      const insights = insightsData.data || [];
      const metricsMap: Record<string, number> = {};

      insights.forEach((insight: any) => {
        metricsMap[insight.name] = insight.values?.[0]?.value || 0;
      });

      return {
        followers: data.followers_count || 0,
        posts: data.media_count || 0,
        engagement: 0, // Calcular baseado em dados reais
        reach: metricsMap.reach || 0,
        impressions: metricsMap.impressions || 0,
        saves: 0,
        shares: 0,
        comments: 0,
        likes: 0,
      };
    } catch (error) {
      console.error('[Instagram] Failed to fetch metrics:', error);
      throw error;
    }
  }

  /**
   * Buscar posts recentes
   */
  async getPosts(limit: number = 10): Promise<InstagramPostReal[]> {
    try {
      const fields = [
        'id',
        'caption',
        'media_type',
        'media_url',
        'timestamp',
        'like_count',
        'comments_count',
      ];

      const data = await this.makeRequest(`/${this.accountId}/media`, {
        fields: fields.join(','),
        limit,
      });

      const posts = data.data || [];

      return posts.map((post: any) => ({
        id: post.id,
        caption: post.caption || '',
        mediaType: post.media_type || 'IMAGE',
        mediaUrl: post.media_url || '',
        timestamp: post.timestamp || new Date().toISOString(),
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        shares: 0,
        saves: 0,
        reach: 0,
        impressions: 0,
      }));
    } catch (error) {
      console.error('[Instagram] Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Buscar insights de um post específico
   */
  async getPostInsights(postId: string) {
    try {
      const fields = [
        'like_count',
        'comments_count',
        'shares_count',
        'saved_count',
        'reach',
        'impressions',
      ];

      const data = await this.makeRequest(`/${postId}/insights`, {
        metric: fields.join(','),
      });

      return data;
    } catch (error) {
      console.error('[Instagram] Failed to fetch post insights:', error);
      throw error;
    }
  }

  /**
   * Buscar análise de crescimento (últimos 7 dias)
   */
  async getGrowth() {
    try {
      const data = await this.makeRequest(`/${this.accountId}/insights`, {
        metric: 'follower_count,impressions,reach',
        period: 'day',
        since: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
        until: Math.floor(Date.now() / 1000),
      });

      const insights = data.data || [];
      const daily: Array<{ date: string; followers: number; engagement: number }> = [];

      insights.forEach((insight: any) => {
        const values = insight.values || [];
        values.forEach((value: any) => {
          const date = new Date(value.end_time).toISOString().split('T')[0];
          const existing = daily.find((d) => d.date === date);

          if (existing) {
            if (insight.name === 'follower_count') existing.followers = value.value;
            if (insight.name === 'impressions') existing.engagement = value.value;
          } else {
            daily.push({
              date,
              followers: insight.name === 'follower_count' ? value.value : 0,
              engagement: insight.name === 'impressions' ? value.value : 0,
            });
          }
        });
      });

      return { daily: daily.sort((a, b) => a.date.localeCompare(b.date)) };
    } catch (error) {
      console.error('[Instagram] Failed to fetch growth data:', error);
      throw error;
    }
  }

  /**
   * Verificar se as credenciais estão configuradas
   */
  isConfigured(): boolean {
    return !!this.accessToken && !!this.accountId;
  }
}

// Instância global do serviço
export const instagramService = new InstagramService();
