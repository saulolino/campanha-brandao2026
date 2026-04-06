import cron from "node-cron";
import { getDb } from "./db";
import { instagramPosts, postStatusHistory } from "../drizzle/schema";
import { eq, lte, and } from "drizzle-orm";
import { publishToInstagram } from "./instagram";
import { deserializeMediaUrls } from "./media";
import { notifyPostPublished, notifyPublishError } from "./notifications";

let schedulerInitialized = false;

/**
 * Inicializar scheduler de posts
 * Executa a cada minuto para verificar posts agendados
 */
export function initializeScheduler(): void {
  if (schedulerInitialized) return;

  // Executar a cada minuto
  cron.schedule("* * * * *", async () => {
    await publishScheduledPosts();
  });

  schedulerInitialized = true;
  console.log("[Scheduler] Post scheduler initialized");
}

/**
 * Publicar posts que chegaram à data/hora agendada
 */
async function publishScheduledPosts(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const now = new Date();

    // Buscar posts agendados que já passaram da data/hora
    const scheduledPosts = await db
      .select()
      .from(instagramPosts)
      .where(
        and(
          eq(instagramPosts.status, "scheduled"),
          lte(instagramPosts.scheduledDate, now)
        )
      );

    for (const post of scheduledPosts) {
      try {
        // Verificar se tem mídia e legenda
        if (!post.mediaUrls || !post.caption) {
          console.warn(
            `[Scheduler] Post ${post.id} missing media or caption, skipping`
          );
          continue;
        }

        // Deserializar URLs de mídia
        const mediaUrls = deserializeMediaUrls(post.mediaUrls);
        if (mediaUrls.length === 0) {
          console.warn(
            `[Scheduler] Post ${post.id} has no media URLs, skipping`
          );
          continue;
        }

        // Publicar no Instagram
        const result = await publishToInstagram(
          mediaUrls,
          post.caption,
          post.hashtags || undefined
        );

        if (!result.success) {
          // Registrar erro
          await db.insert(postStatusHistory).values({
            postId: post.id,
            previousStatus: "scheduled",
            newStatus: "failed",
            changedBy: 0, // Sistema
            comment: result.error,
          });

          await db.update(instagramPosts)
            .set({ status: "failed", instagramError: result.error })
            .where(eq(instagramPosts.id, post.id));

          await notifyPublishError(post.id, post.title, result.error || "Erro desconhecido");

          console.error(
            `[Scheduler] Failed to publish post ${post.id}: ${result.error}`
          );
          continue;
        }

        // Registrar sucesso
        await db.insert(postStatusHistory).values({
          postId: post.id,
          previousStatus: "scheduled",
          newStatus: "published",
          changedBy: 0, // Sistema
          comment: "Auto-published by scheduler",
        });

        await db.update(instagramPosts)
          .set({
            status: "published",
            publishedAt: new Date(),
            instagramPostId: result.postId,
          })
          .where(eq(instagramPosts.id, post.id));

        await notifyPostPublished(post.id, post.title, result.postId);

        console.log(
          `[Scheduler] Successfully published post ${post.id} to Instagram`
        );
      } catch (error) {
        console.error(
          `[Scheduler] Error publishing post ${post.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error in publishScheduledPosts:", error);
  }
}

/**
 * Parar o scheduler (para testes ou shutdown)
 */
export function stopScheduler(): void {
  cron.getTasks().forEach((task) => task.stop());
  schedulerInitialized = false;
  console.log("[Scheduler] Post scheduler stopped");
}
