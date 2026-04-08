/**
 * Instagram Sync Service
 * Sincroniza dados reais do perfil do Eduardo Brandão do Instagram
 * Atualiza métricas 3 vezes por dia (8h, 14h, 20h)
 */

import { getDb } from "./db";
import { instagramMetrics } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface InstagramProfileData {
  username: string;
  followers: number;
  following: number;
  postsCount: number;
  biography: string;
  profilePictureUrl: string;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
  lastSyncedAt: Date;
}

/**
 * Busca dados reais do perfil do Instagram via Graph API
 * Requer credenciais válidas configuradas em env
 */
export async function fetchInstagramProfileData(): Promise<InstagramProfileData | null> {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!accessToken || !businessAccountId) {
      console.error("[Instagram Sync] Credenciais do Instagram não configuradas");
      return null;
    }

    // Buscar dados do perfil
    const profileResponse = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}?fields=username,name,biography,profile_picture_url,followers_count,following_count,media_count&access_token=${accessToken}`
    );

    if (!profileResponse.ok) {
      console.error("[Instagram Sync] Erro ao buscar perfil:", profileResponse.statusText);
      return null;
    }

    const profileData = await profileResponse.json();

    // Buscar posts recentes para calcular engagement
    const postsResponse = await fetch(
      `https://graph.instagram.com/v18.0/${businessAccountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,engagement&access_token=${accessToken}`
    );

    let averageLikes = 0;
    let averageComments = 0;

    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      const recentPosts = postsData.data.slice(0, 10); // Últimos 10 posts

      if (recentPosts.length > 0) {
        const totalLikes = recentPosts.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0);
        const totalComments = recentPosts.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0);

        averageLikes = Math.round(totalLikes / recentPosts.length);
        averageComments = Math.round(totalComments / recentPosts.length);
      }
    }

    const engagementRate = profileData.followers_count > 0
      ? ((averageLikes + averageComments) / profileData.followers_count * 100).toFixed(2)
      : 0;

    return {
      username: profileData.username,
      followers: profileData.followers_count || 0,
      following: profileData.following_count || 0,
      postsCount: profileData.media_count || 0,
      biography: profileData.biography || "",
      profilePictureUrl: profileData.profile_picture_url || "",
      engagementRate: parseFloat(engagementRate as string),
      averageLikes,
      averageComments,
      lastSyncedAt: new Date(),
    };
  } catch (error) {
    console.error("[Instagram Sync] Erro ao sincronizar dados:", error);
    return null;
  }
}

/**
 * Salva dados sincronizados no banco de dados
 */
export async function saveInstagramMetrics(data: InstagramProfileData): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Instagram Sync] Database unavailable");
      return false;
    }

    // Buscar métrica existente
    const existing = await db
      .select()
      .from(instagramMetrics)
      .where(eq(instagramMetrics.username, data.username))
      .limit(1);

    if (existing.length > 0) {
      // Atualizar
      await db
        .update(instagramMetrics)
        .set({
          followers: data.followers,
          following: data.following,
          postsCount: data.postsCount,
          biography: data.biography,
          profilePictureUrl: data.profilePictureUrl,
          engagementRate: data.engagementRate,
          averageLikes: data.averageLikes,
          averageComments: data.averageComments,
          lastSyncedAt: data.lastSyncedAt,
        })
        .where(eq(instagramMetrics.username, data.username));
    } else {
      // Inserir
      await db.insert(instagramMetrics).values({
        username: data.username,
        followers: data.followers,
        following: data.following,
        postsCount: data.postsCount,
        biography: data.biography,
        profilePictureUrl: data.profilePictureUrl,
        engagementRate: data.engagementRate,
        averageLikes: data.averageLikes,
        averageComments: data.averageComments,
        lastSyncedAt: data.lastSyncedAt,
      });
    }

    console.log(`[Instagram Sync] Dados sincronizados para ${data.username}`);
    return true;
  } catch (error) {
    console.error("[Instagram Sync] Erro ao salvar métricas:", error);
    return false;
  }
}

/**
 * Sincronização completa: busca dados e salva no banco
 */
export async function syncInstagramProfile(): Promise<boolean> {
  try {
    console.log("[Instagram Sync] Iniciando sincronização...");
    const profileData = await fetchInstagramProfileData();

    if (!profileData) {
      console.error("[Instagram Sync] Falha ao buscar dados do perfil");
      return false;
    }

    const saved = await saveInstagramMetrics(profileData);
    if (saved) {
      console.log("[Instagram Sync] Sincronização concluída com sucesso");
      console.log(`[Instagram Sync] Seguidores: ${profileData.followers}, Posts: ${profileData.postsCount}`);
    }

    return saved;
  } catch (error) {
    console.error("[Instagram Sync] Erro na sincronização:", error);
    return false;
  }
}

/**
 * Agenda sincronização para 3 vezes por dia (8h, 14h, 20h)
 * Deve ser chamado no startup do servidor
 */
export function scheduleInstagramSync(): void {
  const syncTimes = [8, 14, 20]; // 8h, 14h, 20h

  syncTimes.forEach((hour) => {
    const now = new Date();
    let nextRun = new Date();
    nextRun.setHours(hour, 0, 0, 0);

    // Se já passou a hora, agenda para amanhã
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();

    console.log(`[Instagram Sync] Próxima sincronização às ${hour}:00 em ${Math.round(delay / 1000 / 60)} minutos`);

    // Agenda primeira execução
    setTimeout(() => {
      syncInstagramProfile();

      // Depois, repete a cada 24 horas
      setInterval(() => {
        syncInstagramProfile();
      }, 24 * 60 * 60 * 1000);
    }, delay);
  });
}
