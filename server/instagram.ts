import { ENV } from "./_core/env";

/**
 * Integração com Instagram Graph API para publicação de posts
 * Requer: Instagram Business Account + Access Token
 */

export interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publicar post no Instagram usando a API do Manus
 * O Manus já tem integração com Instagram, então usamos a API interna
 */
export async function publishToInstagram(
  mediaUrls: string[],
  caption: string,
  hashtags?: string
): Promise<InstagramPublishResult> {
  if (!mediaUrls || mediaUrls.length === 0) {
    return {
      success: false,
      error: "Nenhuma mídia fornecida para publicação",
    };
  }

  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    return {
      success: false,
      error: "Credenciais do Instagram não configuradas",
    };
  }

  try {
    // Preparar caption com hashtags
    const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;

    // Construir payload para a API do Manus
    const payload = {
      mediaUrls,
      caption: fullCaption,
      mediaType: mediaUrls[0]?.includes("mp4") || mediaUrls[0]?.includes("mov") ? "VIDEO" : "IMAGE",
    };

    // Chamar API do Manus para publicar
    const response = await fetch(
      `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/instagram/publish`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ENV.forgeApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Erro ao publicar: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      postId: data.postId || data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao publicar",
    };
  }
}

/**
 * Obter informações de um post publicado
 */
export async function getInstagramPostInfo(postId: string): Promise<any> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new Error("Credenciais do Instagram não configuradas");
  }

  const response = await fetch(
    `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/instagram/posts/${postId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ENV.forgeApiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao obter informações do post: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obter métricas de um post (curtidas, comentários, etc)
 */
export async function getInstagramPostMetrics(postId: string): Promise<any> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new Error("Credenciais do Instagram não configuradas");
  }

  const response = await fetch(
    `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/instagram/posts/${postId}/insights`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ENV.forgeApiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao obter métricas: ${response.statusText}`);
  }

  return response.json();
}
