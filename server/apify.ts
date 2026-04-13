import { ENV } from "./_core/env";

const APIFY_BASE = "https://api.apify.com/v2";

interface ApifyRunOptions {
  token?: string;
  timeoutSecs?: number;
}

/**
 * Executa um actor do Apify de forma síncrona e retorna os itens do dataset.
 * Usa o endpoint run-sync-get-dataset-items para obter os dados diretamente.
 */
async function runActorSync<T>(
  actorId: string,
  input: Record<string, unknown>,
  options: ApifyRunOptions = {}
): Promise<T[]> {
  const token = options.token ?? ENV.apifyToken;
  if (!token) throw new Error("APIFY_TOKEN não configurado");

  const timeoutSecs = options.timeoutSecs ?? 120;
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=${timeoutSecs}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout((timeoutSecs + 10) * 1000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Apify API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as T[];
  return data;
}

export interface InstagramProfileData {
  id?: string;
  username?: string;
  fullName?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  isBusinessAccount?: boolean;
  verified?: boolean;
  profilePicUrl?: string;
  externalUrl?: string;
  private?: boolean;
}

/**
 * Busca dados públicos de um perfil do Instagram via Apify.
 * Usa o actor apify/instagram-profile-scraper.
 */
export async function scrapeInstagramProfile(
  username: string
): Promise<InstagramProfileData | null> {
  const results = await runActorSync<InstagramProfileData>(
    "apify~instagram-profile-scraper",
    { usernames: [username.replace(/^@/, "")] },
    { timeoutSecs: 120 }
  );

  if (!results || results.length === 0) return null;
  return results[0];
}

export interface FacebookPageData {
  title?: string;
  pageName?: string;
  likes?: number;
  followers?: number;
  about?: string;
  website?: string;
  profilePicUrl?: string;
  url?: string;
  categories?: string[];
}

/**
 * Busca dados públicos de uma página do Facebook via Apify.
 * Usa o actor apify/facebook-pages-scraper.
 */
export async function scrapeFacebookPage(
  pageUrl: string
): Promise<FacebookPageData | null> {
  // Normaliza a URL da página do Facebook
  let normalizedUrl = pageUrl;
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = `https://www.facebook.com/${pageUrl}`;
  }

  const results = await runActorSync<FacebookPageData>(
    "apify~facebook-pages-scraper",
    { startUrls: [{ url: normalizedUrl }], maxPosts: 0 },
    { timeoutSecs: 120 }
  );

  if (!results || results.length === 0) return null;
  return results[0];
}

/**
 * Valida se o APIFY_TOKEN está configurado e funcional.
 * Faz uma chamada leve à API para verificar o token.
 */
export async function validateApifyToken(token?: string): Promise<boolean> {
  const t = token ?? ENV.apifyToken;
  if (!t) return false;

  try {
    const response = await fetch(`${APIFY_BASE}/users/me?token=${t}`);
    return response.ok;
  } catch {
    return false;
  }
}
