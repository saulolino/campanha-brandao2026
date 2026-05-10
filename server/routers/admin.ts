import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { bulkUpsertInstagramPublishedPosts, getDb } from "../db";
import instagramData from "../data/instagram_real_data.json";

/**
 * Router de administração — operações restritas a Coordenador e SuperAdmin.
 */
export const adminRouter = router({
  /**
   * Sincroniza os posts do arquivo JSON local para o banco MySQL.
   * Útil após um novo deploy que sobrescreve o JSON com dados mais antigos.
   */
  syncJsonToDatabase: protectedProcedure
    .input(z.object({ force: z.boolean().optional().default(false) }))
    .mutation(async ({ ctx, input }) => {
      // Apenas coordenador e superadmin podem executar
      const role = (ctx.user as any).role ?? "visitor";
      if (!["coordinator", "superadmin", "admin"].includes(role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas Coordenadores e SuperAdmins podem executar esta operação.",
        });
      }

      const data = instagramData as any;
      const posts: any[] = data.posts ?? [];

      if (posts.length === 0) {
        return {
          success: false,
          message: "Nenhum post encontrado no arquivo JSON.",
          inserted: 0,
          updated: 0,
          total: 0,
        };
      }

      const postsToUpsert = posts.map((p: any) => ({
        instagramId: String(p.id || p.shortCode || ""),
        caption: p.caption ?? null,
        mediaType: (p.mediaType as any) ?? "IMAGE",
        mediaProductType: (p.mediaProductType as any) ?? "FEED",
        permalink: p.permalink ?? null,
        thumbnailUrl: p.thumbnailUrl ?? null,
        mediaUrl: p.mediaUrl ?? p.thumbnailUrl ?? null,
        likes: Number(p.likes ?? 0),
        comments: Number(p.comments ?? 0),
        shares: Number(p.shares ?? 0),
        saves: Number(p.saves ?? 0),
        reach: Number(p.reach ?? 0),
        views: Number(p.views ?? 0),
        postedAt: new Date(p.timestamp ?? Date.now()),
        syncSource: "json" as const,
        lastSyncedAt: new Date(),
      }));

      const { inserted, updated } = await bulkUpsertInstagramPublishedPosts(postsToUpsert);

      return {
        success: true,
        message: `Sincronização concluída: ${inserted} posts inseridos, ${updated} atualizados.`,
        inserted,
        updated,
        total: posts.length,
      };
    }),

  /**
   * Retorna estatísticas do banco de posts publicados.
   */
  getDatabaseStats: protectedProcedure.query(async ({ ctx }) => {
    const role = (ctx.user as any).role ?? "visitor";
    if (!["coordinator", "superadmin", "admin"].includes(role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) {
      return { totalInDb: 0, totalInJson: 0, lastSync: null };
    }

    const [countRows] = await db.execute("SELECT COUNT(*) as total FROM instagram_published_posts");
    const [lastSyncRows] = await db.execute(
      "SELECT MAX(lastSyncedAt) as lastSync FROM instagram_published_posts"
    );

    const totalInDb = (countRows as any[])[0]?.total ?? 0;
    const lastSync = (lastSyncRows as any[])[0]?.lastSync ?? null;
    const totalInJson = ((instagramData as any).posts ?? []).length;

    return { totalInDb: Number(totalInDb), totalInJson, lastSync };
  }),
});
