import cron from "node-cron";
import { getDb, resetDb } from "./db";
import { instagramPosts, streetEvents } from "../drizzle/schema";
import { eq, and, isNotNull, lt, gte, lte } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { createNotification } from "./routers/notifications";
import { syncInstagramProfile } from "./instagramSync";
import { checkAndRenewInstagramToken } from "./instagramTokenRenewal";

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
 * Verificar eventos de rua confirmados com 24h de antecedência e notificar o owner.
 */
async function processEventReminders(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  // Janela: entre 23h e 25h a partir de agora (para cobrir a verificação horária)
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const upcomingEvents = await db
    .select()
    .from(streetEvents)
    .where(
      and(
        eq(streetEvents.status, "confirmado"),
        gte(streetEvents.eventDate, windowStart),
        lte(streetEvents.eventDate, windowEnd)
      )
    );

  for (const event of upcomingEvents) {
    const eventDateStr = new Date(event.eventDate).toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "long",
    });
    const time = event.eventTime || "";
    const location = [event.location, event.neighborhood, event.city].filter(Boolean).join(" — ");
    const attendees = event.expectedAttendees ? `Público esperado: **${event.expectedAttendees} pessoas**` : "";

    await notifyOwner({
      title: `📍 Evento amanhã: ${event.title}`,
      content: [
        `**${event.title}** está confirmado para amanhã.`,
        ``,
        `📅 **Data:** ${eventDateStr}`,
        time ? `⏰ **Horário:** ${time}` : "",
        `📍 **Local:** ${location}`,
        attendees,
        event.notes ? `📝 **Notas:** ${event.notes}` : "",
      ].filter(Boolean).join("\n"),
    }).catch(() => {});

    console.log(`[Scheduler] Lembrete enviado para evento #${event.id}: ${event.title}`);
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
      // Se for erro de banco, resetar a conexão para reconectar na próxima tentativa
      if (err.message?.includes("Failed query") || err.message?.includes("ECONNREFUSED") || err.message?.includes("ETIMEDOUT") || err.code === "ECONNRESET") {
        resetDb();
      }
    }
  });

  // Verificar lembretes de eventos a cada hora
  cron.schedule("0 * * * *", async () => {
    try {
      await processEventReminders();
    } catch (err: any) {
      console.error("[Scheduler] Erro no ciclo de lembretes de eventos:", err.message);
    }
  });

  // Sincronizar métricas do Instagram às 08h todos os dias
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("[Scheduler] Iniciando sincronização diária do Instagram (08h)...");
      const success = await syncInstagramProfile();
      if (success) {
        await notifyOwner({
          title: `📸 Instagram sincronizado`,
          content: `Métricas do Instagram foram atualizadas automaticamente às 08h.\n\nAcesse **Métricas** e **Projeções** para ver os dados mais recentes.`,
        }).catch(() => {});
        createNotification({
          type: "instagram_sync",
          title: "Instagram sincronizado — 08h",
          message: "Métricas do Instagram foram atualizadas automaticamente. Acesse Métricas e Projeções para ver os dados mais recentes.",
        }).catch(() => {});
        console.log("[Scheduler] Sincronização do Instagram concluída com sucesso.");
      } else {
        createNotification({
          type: "instagram_sync",
          title: "Falha na sincronização do Instagram",
          message: "A sincronização automática das 08h não retornou dados. Verifique o token do Instagram em Configurações.",
        }).catch(() => {});
        console.warn("[Scheduler] Sincronização do Instagram falhou ou retornou sem dados.");
      }
    } catch (err: any) {
      console.error("[Scheduler] Erro na sincronização do Instagram:", err.message);
    }
  });

  // Verificar e renovar token do Instagram diariamente às 09h
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("[Scheduler] Verificando token do Instagram...");
      await checkAndRenewInstagramToken();
    } catch (err: any) {
      console.error("[Scheduler] Erro na verificação do token:", err.message);
    }
  });
  // Sincronizar métricas reais dos posts publicados às 20h
  cron.schedule("0 20 * * *", async () => {
    try {
      console.log("[Scheduler] Sincronizando métricas dos posts publicados (20h)...");
      const accessToken = process.env.INSTAGRAM_GRAPH_API_TOKEN;
      if (!accessToken) {
        console.warn("[Scheduler] Token do Instagram não configurado, pulando sync de métricas.");
        return;
      }
      const db = await getDb();
      if (!db) return;
      const { eq } = await import('drizzle-orm');
      const publishedPosts = await db.select().from(instagramPosts).where(eq(instagramPosts.status, 'published'));
      const postsWithId = publishedPosts.filter((p: any) => p.instagramPostId);
      if (postsWithId.length === 0) {
        console.log("[Scheduler] Nenhum post publicado com ID do Instagram para sincronizar.");
        return;
      }
      let updated = 0;
      for (const post of postsWithId) {
        try {
          const fields = 'like_count,comments_count,media_type';
          const url = `https://graph.instagram.com/v18.0/${post.instagramPostId}?fields=${fields}&access_token=${accessToken}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();
          if (data.error) continue;
          let reach = post.realReach ?? 0;
          let views = post.realViews ?? 0;
          try {
            const insightMetrics = data.media_type === 'VIDEO' ? 'reach,impressions,video_views' : 'reach,impressions';
            const insightUrl = `https://graph.instagram.com/v18.0/${post.instagramPostId}/insights?metric=${insightMetrics}&access_token=${accessToken}`;
            const insightRes = await fetch(insightUrl);
            if (insightRes.ok) {
              const insightData = await insightRes.json();
              if (insightData.data) {
                for (const metric of insightData.data) {
                  if (metric.name === 'reach') reach = metric.values?.[0]?.value ?? metric.value ?? reach;
                  if (metric.name === 'video_views') views = metric.values?.[0]?.value ?? metric.value ?? views;
                }
              }
            }
          } catch (_) { /* insights opcionais */ }
          await db.update(instagramPosts).set({
            realLikes: data.like_count ?? post.realLikes ?? 0,
            realComments: data.comments_count ?? post.realComments ?? 0,
            realReach: reach,
            realViews: views,
          }).where(eq(instagramPosts.id, post.id));
          updated++;
          await new Promise(r => setTimeout(r, 200));
        } catch (_) { /* continuar com próximo post */ }
      }
      console.log(`[Scheduler] Métricas sincronizadas: ${updated}/${postsWithId.length} posts atualizados.`);
      if (updated > 0) {
        createNotification({
          type: 'instagram_sync',
          title: 'Métricas dos posts atualizadas',
          message: `${updated} post(s) tiveram suas métricas reais atualizadas automaticamente às 20h.`,
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error("[Scheduler] Erro no sync de métricas dos posts:", err.message);
    }
  });
  console.log("[Scheduler] Scheduler inicializado — posts agendados a cada minuto, lembretes de eventos a cada hora, sync do Instagram às 08h, verificação do token às 09h, sync de métricas dos posts às 20h.");;
}

/**
 * Parar o scheduler.
 */
export function stopScheduler(): void {
  cron.getTasks().forEach((task) => task.stop());
  schedulerInitialized = false;
  console.log("[Scheduler] Scheduler parado.");
}
