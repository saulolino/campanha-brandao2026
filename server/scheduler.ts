import cron from "node-cron";
import { getDb } from "./db";
import { instagramPosts } from "../drizzle/schema";
import { eq, and, isNotNull, lt } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

let schedulerInitialized = false;

/**
 * Executa a publicação no Instagram via Graph API.
 * Lógica extraída da procedure posts.publish para reutilização no scheduler.
 */
async function publishToInstagram(post: any): Promise<string> {
  const INSTAGRAM_TOKEN = process.env.INSTAGRAM_GRAPH_API_TOKEN;
  const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!INSTAGRAM_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
    throw new Error("Credenciais do Instagram não configuradas.");
  }

  const fullCaption = post.hashtags
    ? `${post.caption}\n\n${post.hashtags}`
    : post.caption;

  let mediaUrls: string[] = [];
  if (post.mediaUrls) {
    try { mediaUrls = JSON.parse(post.mediaUrls); } catch { mediaUrls = []; }
  }

  const postType = post.type || "imagem";

  if (postType === "carrossel" && mediaUrls.length >= 2) {
    // Criar itens do carrossel
    const childIds: string[] = [];
    for (const url of mediaUrls) {
      const res = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: INSTAGRAM_TOKEN }),
      });
      const data = await res.json() as any;
      if (!data.id) throw new Error(`Erro ao criar item do carrossel: ${JSON.stringify(data)}`);
      childIds.push(data.id);
    }
    // Criar container
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_type: "CAROUSEL", children: childIds.join(","), caption: fullCaption, access_token: INSTAGRAM_TOKEN }),
    });
    const containerData = await containerRes.json() as any;
    if (!containerData.id) throw new Error(`Erro ao criar container do carrossel: ${JSON.stringify(containerData)}`);
    // Publicar
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerData.id, access_token: INSTAGRAM_TOKEN }),
    });
    const publishData = await publishRes.json() as any;
    if (!publishData.id) throw new Error(`Erro ao publicar carrossel: ${JSON.stringify(publishData)}`);
    return publishData.id;

  } else if ((postType === "reels" || postType === "video") && mediaUrls.length > 0) {
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_type: "REELS", video_url: mediaUrls[0], caption: fullCaption, access_token: INSTAGRAM_TOKEN }),
    });
    const containerData = await containerRes.json() as any;
    if (!containerData.id) throw new Error(`Erro ao criar container de reels: ${JSON.stringify(containerData)}`);
    // Polling de status
    let attempts = 0;
    let status = "IN_PROGRESS";
    while (status === "IN_PROGRESS" && attempts < 20) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await fetch(`https://graph.facebook.com/v21.0/${containerData.id}?fields=status_code&access_token=${INSTAGRAM_TOKEN}`);
      const statusData = await statusRes.json() as any;
      status = statusData.status_code || "FINISHED";
      attempts++;
    }
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerData.id, access_token: INSTAGRAM_TOKEN }),
    });
    const publishData = await publishRes.json() as any;
    if (!publishData.id) throw new Error(`Erro ao publicar reels: ${JSON.stringify(publishData)}`);
    return publishData.id;

  } else {
    const imageUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;
    if (!imageUrl) throw new Error("O post precisa ter pelo menos uma imagem para ser publicado.");
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption: fullCaption, access_token: INSTAGRAM_TOKEN }),
    });
    const containerData = await containerRes.json() as any;
    if (!containerData.id) throw new Error(`Erro ao criar container de imagem: ${JSON.stringify(containerData)}`);
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerData.id, access_token: INSTAGRAM_TOKEN }),
    });
    const publishData = await publishRes.json() as any;
    if (!publishData.id) throw new Error(`Erro ao publicar imagem: ${JSON.stringify(publishData)}`);
    return publishData.id;
  }
}

/**
 * Verificar e publicar posts agendados cujo horário já passou.
 */
async function processScheduledPosts(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  // Buscar posts agendados com scheduledPublishAt <= agora e status = scheduled
  const pendingPosts = await db
    .select()
    .from(instagramPosts)
    .where(
      and(
        isNotNull(instagramPosts.scheduledPublishAt),
        lt(instagramPosts.scheduledPublishAt, now),
        eq(instagramPosts.status, "scheduled")
      )
    )
    .limit(10);

  if (pendingPosts.length === 0) return;

  console.log(`[Scheduler] Encontrados ${pendingPosts.length} post(s) agendado(s) para publicar.`);

  for (const post of pendingPosts) {
    if (!post.caption) {
      console.warn(`[Scheduler] Post #${post.id} "${post.title}" sem legenda — marcando como falha.`);
      await db.update(instagramPosts).set({
        status: "failed",
        instagramError: "Post agendado sem legenda.",
      }).where(eq(instagramPosts.id, post.id));
      continue;
    }

    try {
      console.log(`[Scheduler] Publicando post #${post.id} "${post.title}"...`);
      const instagramPostId = await publishToInstagram(post);
      const permalink = `https://www.instagram.com/p/${instagramPostId}/`;

      await db.update(instagramPosts).set({
        status: "published",
        instagramPostId,
        instagramError: null,
        publishedAt: new Date(),
        publishedBy: "Agendamento automático",
        scheduledPublishAt: null,
      }).where(eq(instagramPosts.id, post.id));

      console.log(`[Scheduler] Post #${post.id} publicado com sucesso: ${permalink}`);

      // Notificar Superadmin
      await notifyOwner({
        title: `⏰ Post publicado automaticamente`,
        content: `**${post.title}** foi publicado automaticamente pelo agendador.\n\n[Ver post no Instagram](${permalink})`,
      }).catch(() => {});

    } catch (err: any) {
      console.error(`[Scheduler] Erro ao publicar post #${post.id}:`, err.message);
      await db.update(instagramPosts).set({
        status: "failed",
        instagramError: err.message || "Erro desconhecido no agendamento",
      }).where(eq(instagramPosts.id, post.id));
    }
  }
}

/**
 * Inicializar scheduler — verifica posts agendados a cada minuto.
 */
export function initializeScheduler(): void {
  if (schedulerInitialized) return;
  schedulerInitialized = true;

  // Verificar posts agendados a cada minuto
  cron.schedule("* * * * *", async () => {
    try {
      await processScheduledPosts();
    } catch (err: any) {
      console.error("[Scheduler] Erro no ciclo de verificação:", err.message);
    }
  });

  console.log("[Scheduler] Scheduler inicializado — verificando posts agendados a cada minuto.");
}

/**
 * Parar o scheduler.
 */
export function stopScheduler(): void {
  cron.getTasks().forEach((task) => task.stop());
  schedulerInitialized = false;
  console.log("[Scheduler] Scheduler parado.");
}
