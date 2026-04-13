/**
 * Router tRPC — Dados do Candidato Principal
 * Permite ler e atualizar as informações do candidato (Eduardo Brandão)
 * armazenadas na tabela campaign_settings (singleton).
 *
 * Acesso:
 *   - getProfile  → qualquer usuário autenticado (team+)
 *   - saveProfile → coordinator / superadmin
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { campaignSettings } from "../../drizzle/schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requireCoordinatorOrAbove(role: string | null | undefined) {
  if (!["coordinator", "superadmin"].includes(role ?? "")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas coordenadores podem editar os dados do candidato." });
  }
}

async function getOrCreateSettings() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

  const [existing] = await db.select().from(campaignSettings).limit(1);
  if (existing) return { db, settings: existing };

  await db.insert(campaignSettings).values({ isActive: 1 });
  const [created] = await db.select().from(campaignSettings).limit(1);
  return { db, settings: created! };
}

// ─── Schema de validação ───────────────────────────────────────────────────────

const profileSchema = z.object({
  candidateName:         z.string().max(255).optional(),
  candidateNickname:     z.string().max(100).optional(),
  candidateParty:        z.string().max(100).optional(),
  candidateNumber:       z.string().max(20).optional(),
  candidateRole:         z.string().max(255).optional(),
  candidateBio:          z.string().optional(),
  candidateEmail:        z.string().max(320).optional(),
  candidatePhone:        z.string().max(30).optional(),
  candidateProfilePic:   z.string().url().optional().or(z.literal("")),
  candidateInstagram:    z.string().max(255).optional(),
  candidateFacebook:     z.string().max(255).optional(),
  candidateYoutube:      z.string().max(255).optional(),
  candidateTiktok:       z.string().max(255).optional(),
  candidateWebsite:      z.string().max(500).optional(),
  candidateElectionDate: z.string().max(10).optional(),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const candidateSettingsRouter = router({
  /**
   * Retorna os dados do candidato principal.
   * Acessível para qualquer usuário autenticado (team+).
   */
  getProfile: protectedProcedure.query(async () => {
    const { settings } = await getOrCreateSettings();
    return {
      candidateName:         settings.candidateName         ?? "Eduardo Brandão",
      candidateNickname:     settings.candidateNickname     ?? "Eduardo Brandão",
      candidateParty:        settings.candidateParty        ?? "Partido Verde",
      candidateNumber:       settings.candidateNumber       ?? "",
      candidateRole:         settings.candidateRole         ?? "Deputado Distrital DF 2026",
      candidateBio:          settings.candidateBio          ?? "",
      candidateEmail:        settings.candidateEmail        ?? "",
      candidatePhone:        settings.candidatePhone        ?? "",
      candidateProfilePic:   settings.candidateProfilePic   ?? "",
      candidateInstagram:    settings.candidateInstagram    ?? "eduardobrandaopv",
      candidateFacebook:     settings.candidateFacebook     ?? "brandaopv",
      candidateYoutube:      settings.candidateYoutube      ?? "",
      candidateTiktok:       settings.candidateTiktok       ?? "",
      candidateWebsite:      settings.candidateWebsite      ?? "",
      candidateElectionDate: settings.candidateElectionDate ?? "2026-10-04",
    };
  }),

  /**
   * Salva os dados do candidato principal.
   * Apenas coordinator / superadmin.
   */
  saveProfile: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      requireCoordinatorOrAbove((ctx.user as any)?.role);
      const { db, settings } = await getOrCreateSettings();

      // Filtra campos undefined para não sobrescrever com null
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) updates[key] = value === "" ? null : value;
      }

      await db
        .update(campaignSettings)
        .set({ ...updates, lastUpdatedBy: (ctx.user as any)?.id ?? null })
        .where(eq(campaignSettings.id, settings.id));

      return { success: true };
    }),
});
