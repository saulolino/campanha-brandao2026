import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import {
  competitors,
  competitorSnapshots,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { ENV } from "../_core/env";

// ─── Helpers da Graph API ────────────────────────────────────────────────────

const GRAPH_BASE = "https://graph.facebook.com/v19.0";

async function fetchInstagramProfile(username: string, token: string) {
  // Buscar via Instagram Basic Display API / Graph API
  // Para perfis públicos, usamos o endpoint de busca de usuário
  const url = `${GRAPH_BASE}/ig_hashtag_search?user_id=${ENV.instagramAccountId}&q=${username}&access_token=${token}`;

  // Abordagem alternativa: buscar pelo username via Business Discovery API
  // Requer que nossa conta seja Business e o perfil alvo seja público
  const discoveryUrl = `${GRAPH_BASE}/${ENV.instagramAccountId}?fields=business_discovery.fields(id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url)&business_discovery_user_id=${username}&access_token=${token}`;

  // Tentativa com Business Discovery API
  const res = await fetch(
    `${GRAPH_BASE}/${ENV.instagramAccountId}?fields=business_discovery.fields(id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url)&username=${username}&access_token=${token}`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Instagram API error: ${res.status} — ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  const bd = data?.business_discovery;

  if (!bd) {
    throw new Error(
      `Perfil @${username} não encontrado ou não é uma conta Business/Creator pública.`
    );
  }

  return {
    instagramId: bd.id ?? null,
    instagramFollowers: bd.followers_count ?? null,
    instagramFollowing: bd.follows_count ?? null,
    instagramPosts: bd.media_count ?? null,
    instagramBio: bd.biography ?? null,
    instagramProfilePic: bd.profile_picture_url ?? null,
  };
}

async function fetchFacebookPage(pageIdOrUsername: string, token: string) {
  const res = await fetch(
    `${GRAPH_BASE}/${pageIdOrUsername}?fields=id,name,fan_count,followers_count,about,picture.type(large)&access_token=${token}`
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Facebook API error: ${res.status} — ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Facebook API: ${data.error.message}`);
  }

  return {
    facebookPageId: data.id ?? pageIdOrUsername,
    facebookPageName: data.name ?? null,
    facebookFollowers: data.followers_count ?? data.fan_count ?? null,
    facebookLikes: data.fan_count ?? null,
    facebookBio: data.about ?? null,
    facebookProfilePic: data.picture?.data?.url ?? null,
  };
}

// ─── Middleware de role ───────────────────────────────────────────────────────

const coordinatorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = (ctx.user as any)?.role;
  if (!["coordinator", "superadmin"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas coordenadores podem gerenciar concorrentes." });
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
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
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
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
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
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
      const { id, instagramUsername, ...rest } = input;
      await db
        .update(competitors)
        .set({
          ...rest,
          instagramUsername: instagramUsername?.replace("@", "") ?? undefined,
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
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
      await db
        .update(competitors)
        .set({ isActive: 0 })
        .where(eq(competitors.id, input.id));
      return { success: true };
    }),

  /**
   * Sincronizar dados do Instagram de um concorrente
   */
  syncInstagram: coordinatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
      const token = ENV.instagramToken;

      if (!token) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Token do Instagram não configurado.",
        });
      }

      // Buscar o concorrente
      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.id));

      if (!competitor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Concorrente não encontrado." });
      }

      if (!competitor.instagramUsername) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username do Instagram não cadastrado para este concorrente.",
        });
      }

      try {
        const igData = await fetchInstagramProfile(competitor.instagramUsername, token);

        // Atualizar o concorrente
        await db
          .update(competitors)
          .set({
            ...igData,
            instagramLastSync: new Date(),
          })
          .where(eq(competitors.id, input.id));

        // Salvar snapshot histórico
        if (igData.instagramFollowers !== null) {
          await db.insert(competitorSnapshots).values({
            competitorId: input.id,
            platform: "instagram",
            followers: igData.instagramFollowers,
            following: igData.instagramFollowing ?? null,
            posts: igData.instagramPosts ?? null,
          });
        }

        return { success: true, data: igData };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro ao sincronizar Instagram.",
        });
      }
    }),

  /**
   * Sincronizar dados do Facebook de um concorrente
   */
  syncFacebook: coordinatorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
      const token = ENV.instagramToken; // mesmo token (Facebook + Instagram Graph API)

      if (!token) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Token da Graph API não configurado.",
        });
      }

      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, input.id));

      if (!competitor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Concorrente não encontrado." });
      }

      if (!competitor.facebookPageId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID/username da página do Facebook não cadastrado.",
        });
      }

      try {
        const fbData = await fetchFacebookPage(competitor.facebookPageId, token);

        await db
          .update(competitors)
          .set({
            ...fbData,
            facebookLastSync: new Date(),
          })
          .where(eq(competitors.id, input.id));

        // Salvar snapshot histórico
        if (fbData.facebookFollowers !== null) {
          await db.insert(competitorSnapshots).values({
            competitorId: input.id,
            platform: "facebook",
            followers: fbData.facebookFollowers,
            likes: fbData.facebookLikes ?? null,
          });
        }

        return { success: true, data: fbData };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro ao sincronizar Facebook.",
        });
      }
    }),

  /**
   * Sincronizar todos os concorrentes (Instagram + Facebook)
   */
  syncAll: coordinatorProcedure.mutation(async () => {
    const _dbRaw = await getDb();
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
    const token = ENV.instagramToken;

    if (!token) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Token da Graph API não configurado.",
      });
    }

    const allCompetitors = await db
      .select()
      .from(competitors)
      .where(eq(competitors.isActive, 1));

    const results: { id: number; name: string; instagram?: string; facebook?: string }[] = [];

    for (const c of allCompetitors) {
      const result: { id: number; name: string; instagram?: string; facebook?: string } = {
        id: c.id,
        name: c.name,
      };

      // Sync Instagram
      if (c.instagramUsername) {
        try {
          const igData = await fetchInstagramProfile(c.instagramUsername, token);
          await db.update(competitors).set({ ...igData, instagramLastSync: new Date() }).where(eq(competitors.id, c.id));
          if (igData.instagramFollowers !== null) {
            await db.insert(competitorSnapshots).values({
              competitorId: c.id,
              platform: "instagram",
              followers: igData.instagramFollowers,
              following: igData.instagramFollowing ?? null,
              posts: igData.instagramPosts ?? null,
            });
          }
          result.instagram = "ok";
        } catch (e: any) {
          result.instagram = `erro: ${e.message}`;
        }
      }

      // Sync Facebook
      if (c.facebookPageId) {
        try {
          const fbData = await fetchFacebookPage(c.facebookPageId, token);
          await db.update(competitors).set({ ...fbData, facebookLastSync: new Date() }).where(eq(competitors.id, c.id));
          if (fbData.facebookFollowers !== null) {
            await db.insert(competitorSnapshots).values({
              competitorId: c.id,
              platform: "facebook",
              followers: fbData.facebookFollowers,
              likes: fbData.facebookLikes ?? null,
            });
          }
          result.facebook = "ok";
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
    .input(z.object({ competitorId: z.number(), platform: z.enum(["instagram", "facebook"]).optional() }))
    .query(async ({ input }) => {
      const _dbRaw = await getDb();
      if (!_dbRaw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
      const db = _dbRaw;
      const conditions = [eq(competitorSnapshots.competitorId, input.competitorId)];
      if (input.platform) {
        conditions.push(eq(competitorSnapshots.platform, input.platform));
      }
      return db
        .select()
        .from(competitorSnapshots)
        .where(and(...conditions))
        .orderBy(desc(competitorSnapshots.snapshotDate))
        .limit(90); // últimos 90 snapshots
    }),
});
