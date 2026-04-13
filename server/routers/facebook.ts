/**
 * Router de Métricas do Facebook da Campanha
 *
 * Gerencia os dados da página do Facebook do Eduardo Brandão:
 *   - getMetrics   → lê dados salvos no banco (seguidores, curtidas, bio, última sync)
 *   - setPageUrl   → salva/atualiza a URL da página do Facebook
 *   - syncPage     → busca dados atualizados via Apify e salva no banco
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import { campaignSettings } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { scrapeFacebookPage } from "../apify.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function requireCoordinatorOrAbove(role: string | null | undefined) {
  if (!role || role === "visitor" || role === "team") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas coordenadores e superadmins podem alterar configurações.",
    });
  }
}

async function getOrCreateSettings() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados não disponível." });

  const rows = await db.select().from(campaignSettings).limit(1);
  if (rows.length > 0) return { db, settings: rows[0] };

  await db.insert(campaignSettings).values({ isActive: 1 });
  const newRows = await db.select().from(campaignSettings).limit(1);
  return { db, settings: newRows[0] };
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const facebookRouter = router({
  /**
   * Retorna os dados do Facebook salvos no banco.
   * Acessível para equipe e acima.
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.role || ctx.user.role === "visitor") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
    }
    const { settings } = await getOrCreateSettings();
    return {
      pageUrl: settings.facebookPageUrl ?? null,
      pageName: settings.facebookPageName ?? null,
      followers: settings.facebookFollowers ?? null,
      likes: settings.facebookLikes ?? null,
      bio: settings.facebookBio ?? null,
      profilePic: settings.facebookProfilePic ?? null,
      lastSync: settings.facebookLastSync ?? null,
    };
  }),

  /**
   * Salva/atualiza a URL da página do Facebook.
   * Apenas coordenadores e superadmins.
   */
  setPageUrl: protectedProcedure
    .input(z.object({ pageUrl: z.string().min(1, "URL obrigatória") }))
    .mutation(async ({ ctx, input }) => {
      requireCoordinatorOrAbove(ctx.user?.role);
      const { db, settings } = await getOrCreateSettings();
      await db
        .update(campaignSettings)
        .set({ facebookPageUrl: input.pageUrl })
        .where(eq(campaignSettings.id, settings.id));
      return { success: true };
    }),

  /**
   * Salva manualmente os números de seguidores e amigos do Facebook.
   * Útil para perfis pessoais onde o Apify não consegue extrair esses dados.
   * Apenas coordenadores e superadmins.
   */
  setManualMetrics: protectedProcedure
    .input(z.object({
      followers: z.number().int().min(0).optional(),
      likes: z.number().int().min(0).optional(),
      bio: z.string().max(1000).optional(),
      profilePic: z.string().url().optional().or(z.literal("")),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCoordinatorOrAbove(ctx.user?.role);
      const { db, settings } = await getOrCreateSettings();
      const updates: Record<string, unknown> = {};
      if (input.followers !== undefined) updates.facebookFollowers = input.followers;
      if (input.likes !== undefined) updates.facebookLikes = input.likes;
      if (input.bio !== undefined) updates.facebookBio = input.bio || null;
      if (input.profilePic !== undefined) updates.facebookProfilePic = input.profilePic || null;
      await db
        .update(campaignSettings)
        .set(updates)
        .where(eq(campaignSettings.id, settings.id));
      return { success: true };
    }),

  /**
   * Sincroniza dados da página do Facebook via Apify.
   * Apenas coordenadores e superadmins.
   * Pode levar até 2 minutos (Apify scraping).
   */
  syncPage: protectedProcedure.mutation(async ({ ctx }) => {
    requireCoordinatorOrAbove(ctx.user?.role);
    const { db, settings } = await getOrCreateSettings();

    const pageUrl = settings.facebookPageUrl ?? "https://www.facebook.com/brandaopv";

    let data;
    try {
      data = await scrapeFacebookPage(pageUrl);
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Erro ao buscar dados via Apify: ${err.message ?? "Erro desconhecido"}`,
      });
    }

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nenhum dado retornado pelo Apify para esta página. Verifique a URL.",
      });
    }

    // Detectar se é perfil pessoal ou Página
    // Perfil pessoal: tem `personalProfile`, sem `followers`/`likes` numéricos
    const isPersonalProfile = !!(data.personalProfile);

    // Nome: Página usa pageName/title, perfil pessoal usa title
    const pageName = data.title ?? data.pageName ?? null;

    // Foto de perfil: Página usa profilePicUrl, perfil pessoal usa personalProfile.profilePicLarge
    const profilePic = data.profilePicUrl
      ?? data.personalProfile?.profilePicLarge
      ?? data.personalProfile?.profilePicMedium
      ?? null;

    // Bio: Página pode ter `about` ou `info`; perfil pessoal geralmente não expõe
    const bio = data.about
      ?? (data.info && data.info.length > 0 ? data.info.join(" | ") : null)
      ?? null;

    // Seguidores/curtidas: apenas disponíveis em Páginas
    // Para perfis pessoais, preservar os valores já salvos manualmente
    const followers = isPersonalProfile ? settings.facebookFollowers : (data.followers ?? null);
    const likes = isPersonalProfile ? settings.facebookLikes : (data.likes ?? null);

    const now = new Date();
    await db
      .update(campaignSettings)
      .set({
        facebookPageUrl: pageUrl,
        facebookPageName: pageName,
        facebookFollowers: followers,
        facebookLikes: likes,
        facebookBio: bio,
        facebookProfilePic: profilePic,
        facebookLastSync: now,
      })
      .where(eq(campaignSettings.id, settings.id));

    return {
      success: true,
      pageName,
      followers,
      likes,
      bio,
      profilePic,
      isPersonalProfile,
      syncedAt: now,
    };
  }),
});
