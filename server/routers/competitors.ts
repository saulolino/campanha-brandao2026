import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import {
  competitors,
  competitorSnapshots,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { scrapeInstagramProfile, scrapeFacebookPage } from "../apify";

// ─── Middleware de role ───────────────────────────────────────────────────────

const coordinatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = (ctx.user as any)?.role;
  if (!["coordinator", "superadmin"].includes(role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas coordenadores podem gerenciar concorrentes.",
    });
  }
  return next({ ctx });
});

// ─── Router ──────────────────────────────────────────────────────────────────

export const competitorsRouter = router({
  /**
   * Listar todos os concorrentes ativos
   */
  list: protectedProcedure.query(async () => {
    const _dbRaw = await getDb();
    if (!_dbRaw)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco indisponível",
      });
    const db = _dbRaw;
    const rows = await db
      .select()
      .from(competitors)
      .where(eq(competitors.isActive, 1))
      .orderBy(desc(competitors.updatedAt));
    return rows;
  }),

  /**
   * Criar novo concorrente
   */
  create: coordinatorProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome obrigatório"),
        party: z.string().optional(),
        role: z.string().optional(),
        notes: z.string().optional(),
        instagramUsername: z.string().optional(),
        facebookPageId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;
      const [result] = await db.insert(competitors).values({
        name: input.name,
        party: input.party ?? null,
        role: input.role ?? null,
        notes: input.notes ?? null,
        instagramUsername: input.instagramUsername?.replace("@", "") ?? null,
        facebookPageId: input.facebookPageId ?? null,
        createdById: (ctx.user as any)?.id ?? null,
      });
      return { id: (result as any).insertId, success: true };
    }),

  /**
   * Atualizar dados de um concorrente
   */
  update: coordinatorProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        party: z.string().optional(),
        role: z.string().optional(),
        notes: z.string().optional(),
        instagramUsername: z.string().optional(),
        facebookPageId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;
      const { id, instagramUsername, ...rest } = input;
      await db
        .update(competitors)
        .set({
          ...rest,
          instagramUsername:
            instagramUsername?.replace("@", "") ?? undefined,
        })
        .where(eq(competitors.id, id));
      return { success: true };
    }),

  /**
   * Remover concorrente (soft delete)
   */
  remove: coordinatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;
      await db
        .update(competitors)
        .set({ isActive: 0 })
        .where(eq(competitors.id, input.id));
      return { success: true };
    }),

  /**
   * Sincronizar dados do Instagram de um concorrente via Apify
   */
  syncInstagram: coordinatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;

      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.id));

      if (!competitor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Concorrente não encontrado.",
        });
      }

      if (!competitor.instagramUsername) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Username do Instagram não cadastrado para este concorrente.",
        });
      }

      try {
        const igData = await scrapeInstagramProfile(
          competitor.instagramUsername
        );

        if (!igData) {
          throw new Error(
            `Perfil @${competitor.instagramUsername} não encontrado no Instagram.`
          );
        }

        const updateData = {
          instagramId: igData.id ?? null,
          instagramFollowers: igData.followersCount ?? null,
          instagramFollowing: igData.followsCount ?? null,
          instagramPosts: igData.postsCount ?? null,
          instagramBio: igData.biography ?? null,
          instagramProfilePic: igData.profilePicUrl ?? null,
          instagramLastSync: new Date(),
        };

        await db
          .update(competitors)
          .set(updateData)
          .where(eq(competitors.id, input.id));

        // Salvar snapshot histórico
        if (updateData.instagramFollowers !== null) {
          await db.insert(competitorSnapshots).values({
            competitorId: input.id,
            platform: "instagram",
            followers: updateData.instagramFollowers,
            following: updateData.instagramFollowing ?? null,
            posts: updateData.instagramPosts ?? null,
          });
        }

        return { success: true, data: updateData };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro ao sincronizar Instagram.",
        });
      }
    }),

  /**
   * Sincronizar dados do Facebook de um concorrente via Apify
   */
  syncFacebook: coordinatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;

      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.id));

      if (!competitor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Concorrente não encontrado.",
        });
      }

      if (!competitor.facebookPageId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID/username da página do Facebook não cadastrado.",
        });
      }

      try {
        const fbData = await scrapeFacebookPage(competitor.facebookPageId);

        if (!fbData) {
          throw new Error(
            `Página do Facebook "${competitor.facebookPageId}" não encontrada.`
          );
        }

        const updateData = {
          facebookPageName: fbData.title ?? fbData.pageName ?? null,
          facebookFollowers: fbData.followers ?? null,
          facebookLikes: fbData.likes ?? null,
          facebookBio: fbData.about ?? null,
          facebookProfilePic: fbData.profilePicUrl ?? null,
          facebookLastSync: new Date(),
        };

        await db
          .update(competitors)
          .set(updateData)
          .where(eq(competitors.id, input.id));

        // Salvar snapshot histórico
        if (updateData.facebookFollowers !== null) {
          await db.insert(competitorSnapshots).values({
            competitorId: input.id,
            platform: "facebook",
            followers: updateData.facebookFollowers,
            likes: updateData.facebookLikes ?? null,
          });
        }

        return { success: true, data: updateData };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro ao sincronizar Facebook.",
        });
      }
    }),

  /**
   * Sincronizar todos os concorrentes (Instagram + Facebook) via Apify
   */
  syncAll: coordinatorProcedure.mutation(async () => {
    const _dbRaw = await getDb();
    if (!_dbRaw)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco indisponível",
      });
    const db = _dbRaw;

    const allCompetitors = await db
      .select()
      .from(competitors)
      .where(eq(competitors.isActive, 1));

    const results: {
      id: number;
      name: string;
      instagram?: string;
      facebook?: string;
    }[] = [];

    for (const c of allCompetitors) {
      const result: {
        id: number;
        name: string;
        instagram?: string;
        facebook?: string;
      } = {
        id: c.id,
        name: c.name,
      };

      // Sync Instagram via Apify
      if (c.instagramUsername) {
        try {
          const igData = await scrapeInstagramProfile(c.instagramUsername);
          if (igData) {
            const updateData = {
              instagramId: igData.id ?? null,
              instagramFollowers: igData.followersCount ?? null,
              instagramFollowing: igData.followsCount ?? null,
              instagramPosts: igData.postsCount ?? null,
              instagramBio: igData.biography ?? null,
              instagramProfilePic: igData.profilePicUrl ?? null,
              instagramLastSync: new Date(),
            };
            await db
              .update(competitors)
              .set(updateData)
              .where(eq(competitors.id, c.id));
            if (updateData.instagramFollowers !== null) {
              await db.insert(competitorSnapshots).values({
                competitorId: c.id,
                platform: "instagram",
                followers: updateData.instagramFollowers,
                following: updateData.instagramFollowing ?? null,
                posts: updateData.instagramPosts ?? null,
              });
            }
            result.instagram = "ok";
          } else {
            result.instagram = "perfil não encontrado";
          }
        } catch (e: any) {
          result.instagram = `erro: ${e.message}`;
        }
      }

      // Sync Facebook via Apify
      if (c.facebookPageId) {
        try {
          const fbData = await scrapeFacebookPage(c.facebookPageId);
          if (fbData) {
            const updateData = {
              facebookPageName: fbData.title ?? fbData.pageName ?? null,
              facebookFollowers: fbData.followers ?? null,
              facebookLikes: fbData.likes ?? null,
              facebookBio: fbData.about ?? null,
              facebookProfilePic: fbData.profilePicUrl ?? null,
              facebookLastSync: new Date(),
            };
            await db
              .update(competitors)
              .set(updateData)
              .where(eq(competitors.id, c.id));
            if (updateData.facebookFollowers !== null) {
              await db.insert(competitorSnapshots).values({
                competitorId: c.id,
                platform: "facebook",
                followers: updateData.facebookFollowers,
                likes: updateData.facebookLikes ?? null,
              });
            }
            result.facebook = "ok";
          } else {
            result.facebook = "página não encontrada";
          }
        } catch (e: any) {
          result.facebook = `erro: ${e.message}`;
        }
      }

      results.push(result);
    }

    return { success: true, results };
  }),

  /**
   * Buscar histórico de snapshots de um concorrente
   */
  getSnapshots: protectedProcedure
    .input(
      z.object({
        competitorId: z.number(),
        platform: z.enum(["instagram", "facebook"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco indisponível",
        });
      const db = _dbRaw;
      const conditions = [
        eq(competitorSnapshots.competitorId, input.competitorId),
      ];
      if (input.platform) {
        conditions.push(eq(competitorSnapshots.platform, input.platform));
      }
      return db
        .select()
        .from(competitorSnapshots)
        .where(and(...conditions))
        .orderBy(desc(competitorSnapshots.snapshotDate))
        .limit(90);
    }),
});
