/**
 * Router de Configurações WhatsApp
 *
 * Gerencia as configurações da integração Whapi.Cloud:
 *   - getSettings   → lê token, status do canal e grupos favoritos
 *   - saveToken     → salva/atualiza o token Whapi e verifica o canal
 *   - checkChannel  → verifica status do canal (número conectado)
 *   - saveDefaultGroups → salva lista de grupos favoritos para disparo
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import { campaignSettings } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function requireCoordinatorOrAbove(role: string | null | undefined) {
  if (!role || role === "visitor" || role === "team") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas coordenadores e superadmins podem alterar configurações.",
    });
  }
}

async function whapiRequest(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(`https://gate.whapi.cloud${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Whapi.Cloud respondeu com ${res.status}: ${text}`,
    });
  }

  return res.json();
}

async function getOrCreateSettings(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const rows = await db.select().from(campaignSettings).limit(1);
  if (rows.length === 0) {
    await db.insert(campaignSettings).values({});
    const newRows = await db.select().from(campaignSettings).limit(1);
    return newRows[0];
  }
  return rows[0];
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
  return db;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const whatsappSettingsRouter = router({
  /**
   * Retorna as configurações WhatsApp atuais (token mascarado, status, grupos favoritos)
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    requireCoordinatorOrAbove(ctx.user?.role);

    const db = await requireDb();
    const settings = await getOrCreateSettings(db);

    // Mascara o token para exibição (mostra apenas os últimos 8 chars)
    const token = settings.whapiToken ?? "";
    const maskedToken = token.length > 8
      ? `${"*".repeat(token.length - 8)}${token.slice(-8)}`
      : token ? "*".repeat(token.length) : "";

    let defaultGroups: Array<{ id: string; name: string; participantsCount: number }> = [];
    try {
      defaultGroups = JSON.parse(settings.whapiDefaultGroups ?? "[]");
    } catch {
      defaultGroups = [];
    }

    return {
      hasToken: !!token,
      maskedToken,
      channelName: settings.whapiChannelName ?? null,
      channelPhone: settings.whapiChannelPhone ?? null,
      channelStatus: settings.whapiChannelStatus ?? null,
      defaultGroups,
    };
  }),

  /**
   * Salva o token Whapi.Cloud e verifica o canal imediatamente
   */
  saveToken: protectedProcedure
    .input(z.object({ token: z.string().min(10, "Token muito curto") }))
    .mutation(async ({ ctx, input }) => {
      requireCoordinatorOrAbove(ctx.user?.role);

      const db = await requireDb();
      const settings = await getOrCreateSettings(db);

      // Verificar o canal com o novo token
      let channelName: string | null = null;
      let channelPhone: string | null = null;
      let channelStatus: string = "unknown";

      try {
        const channelData = await whapiRequest("/health", input.token);
        // Whapi /health retorna { status: { code: 4, text: "AUTH" }, user: { id: "..." } }
        // status.code === 4 significa AUTH (conectado/autenticado)
        const statusObj = channelData.status;
        if (statusObj && typeof statusObj === "object") {
          // Formato novo: { code: number, text: string }
          channelStatus = statusObj.code === 4 ? "active" : (statusObj.text?.toLowerCase() ?? "unknown");
        } else if (typeof statusObj === "string") {
          channelStatus = statusObj;
        } else {
          channelStatus = "active"; // se chegou sem erro, está ativo
        }
        // Nome e telefone do usuário conectado
        channelName = channelData.user?.name ?? channelData.channel?.name ?? channelData.me?.name ?? null;
        channelPhone = channelData.user?.id ?? channelData.channel?.phone ?? channelData.me?.phone ?? null;
        // Formatar o telefone (remover @c.us se presente)
        if (channelPhone) channelPhone = channelPhone.replace(/@.+$/, "");
      } catch (err: any) {
        // Token inválido — salva mesmo assim mas marca como erro
        channelStatus = "error";
      }

      await db
        .update(campaignSettings)
        .set({
          whapiToken: input.token,
          whapiChannelName: channelName,
          whapiChannelPhone: channelPhone,
          whapiChannelStatus: channelStatus,
          lastUpdatedBy: ctx.user!.id,
        })
        .where(eq(campaignSettings.id, settings.id));

      return { success: true, channelStatus, channelName, channelPhone };
    }),

  /**
   * Verifica o status atual do canal (sem alterar o token)
   */
  checkChannel: protectedProcedure.mutation(async ({ ctx }) => {
    requireCoordinatorOrAbove(ctx.user?.role);

    const db = await requireDb();
    const settings = await getOrCreateSettings(db);

    if (!settings.whapiToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nenhum token configurado. Salve um token primeiro.",
      });
    }

    let channelName: string | null = null;
    let channelPhone: string | null = null;
    let channelStatus: string = "unknown";

    try {
      const channelData = await whapiRequest("/health", settings.whapiToken);
      const statusObj = channelData.status;
      if (statusObj && typeof statusObj === "object") {
        channelStatus = statusObj.code === 4 ? "active" : (statusObj.text?.toLowerCase() ?? "unknown");
      } else if (typeof statusObj === "string") {
        channelStatus = statusObj;
      } else {
        channelStatus = "active";
      }
      channelName = channelData.user?.name ?? channelData.channel?.name ?? channelData.me?.name ?? null;
      channelPhone = channelData.user?.id ?? channelData.channel?.phone ?? channelData.me?.phone ?? null;
      if (channelPhone) channelPhone = channelPhone.replace(/@.+$/, "");
    } catch (err: any) {
      channelStatus = "error";
    }

    await db
      .update(campaignSettings)
      .set({
        whapiChannelName: channelName,
        whapiChannelPhone: channelPhone,
        whapiChannelStatus: channelStatus,
      })
      .where(eq(campaignSettings.id, settings.id));

    return { channelStatus, channelName, channelPhone };
  }),

  /**
   * Salva a lista de grupos favoritos para disparo padrão
   */
  saveDefaultGroups: protectedProcedure
    .input(
      z.object({
        groups: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            participantsCount: z.number().default(0),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireCoordinatorOrAbove(ctx.user?.role);

      const db = await requireDb();
      const settings = await getOrCreateSettings(db);

      await db
        .update(campaignSettings)
        .set({
          whapiDefaultGroups: JSON.stringify(input.groups),
          lastUpdatedBy: ctx.user!.id,
        })
        .where(eq(campaignSettings.id, settings.id));

      return { success: true, count: input.groups.length };
    }),

  /**
   * Retorna apenas os grupos favoritos salvos nas Configurações
   * (acessível para equipe, coordenador e superadmin)
   */
  getFavoriteGroups: protectedProcedure.query(async ({ ctx }) => {
    // Equipe e acima podem ver os grupos favoritos para disparo
    if (!ctx.user?.role || ctx.user.role === "visitor") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
    }

    const db = await requireDb();
    const settings = await getOrCreateSettings(db);

    let defaultGroups: Array<{ id: string; name: string; participantsCount: number }> = [];
    try {
      defaultGroups = JSON.parse(settings.whapiDefaultGroups ?? "[]");
    } catch {
      defaultGroups = [];
    }

    return { groups: defaultGroups };
  }),

  /**
   * Lista grupos disponíveis via Whapi.Cloud (usando token salvo no banco)
   */
  listGroups: protectedProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      requireCoordinatorOrAbove(ctx.user?.role);

      const db = await requireDb();
      const settings = await getOrCreateSettings(db);

      if (!settings.whapiToken) {
        return { groups: [], error: "Nenhum token configurado" };
      }

      const count = input?.count ?? 50;
      const offset = input?.offset ?? 0;

      try {
        const data = await whapiRequest(
          `/groups?count=${count}&offset=${offset}`,
          settings.whapiToken
        );

        const groups: Array<{ id: string; name: string; participantsCount: number }> =
          (data.groups ?? []).map((g: any) => ({
            id: g.id as string,
            name: (g.name ?? g.subject ?? g.id) as string,
            participantsCount: (g.participants_count ?? 0) as number,
          }));

        return { groups, error: null };
      } catch (err: any) {
        return { groups: [], error: err.message ?? "Erro ao buscar grupos" };
      }
    }),
});
