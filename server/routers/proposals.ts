/**
 * Router de Propostas de Pauta
 *
 * Fluxo:
 *   1. Qualquer membro da equipe (role team, coordinator, superadmin) cria uma proposta.
 *   2. O coordenador (ou superadmin) aprova ou rejeita.
 *   3. Ao aprovar:
 *      - Proposta tipo "conteudo" → cria um instagramPost (status "draft")
 *      - Proposta tipo "evento_rua" → cria um streetEvent (status "planejado")
 *   4. O ID do item criado é salvo em convertedItemId para rastreabilidade.
 */
import { z } from "zod";
import { protectedProcedure, router } from "../\_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import {
  contentProposals,
  instagramPosts,
  streetEvents,
  notifications,
} from "../../drizzle/schema.js";
import { eq, desc, and, or } from "drizzle-orm";
import { notifyOwner } from "../\_core/notification.js";

// ─── helpers ──────────────────────────────────────────────────────────────────
function requireCoordinator(role: string | null | undefined) {
  if (role !== "coordinator" && role !== "superadmin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas coordenadores podem realizar esta ação.",
    });
  }
}

function requireTeamOrAbove(role: string | null | undefined) {
  if (!role || role === "visitor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas membros da equipe podem criar propostas.",
    });
  }
}

// ─── Input schemas ─────────────────────────────────────────────────────────────
const createProposalInput = z.discriminatedUnion("proposalType", [
  // ── Proposta de Conteúdo (post Instagram) ──────────────────────────────────
  z.object({
    proposalType: z.literal("conteudo"),
    title: z.string().min(3, "Título obrigatório (mín. 3 caracteres)"),
    description: z.string().min(10, "Descrição obrigatória (mín. 10 caracteres)"),
    notes: z.string().optional(),
    suggestedDate: z.date(),
    contentType: z.enum(["reels", "carrossel", "video", "story", "imagem"]),
    objective: z.string().min(1, "Objetivo obrigatório"),
    caption: z.string().min(10, "Sugestão de legenda obrigatória (mín. 10 caracteres)"),
    hashtags: z.string().optional(),
    referenceUrls: z.string().optional(), // JSON array de URLs
  }),
  // ── Proposta de Evento de Rua ───────────────────────────────────────────────
  z.object({
    proposalType: z.literal("evento_rua"),
    title: z.string().min(3, "Título obrigatório (mín. 3 caracteres)"),
    description: z.string().min(10, "Descrição obrigatória (mín. 10 caracteres)"),
    notes: z.string().optional(),
    suggestedDate: z.date(),
    eventType: z.enum(["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]),
    location: z.string().min(5, "Local obrigatório (mín. 5 caracteres)"),
    neighborhood: z.string().min(2, "Bairro/RA obrigatório"),
    city: z.string().default("Brasília"),
    eventTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:mm)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida (HH:mm)").optional(),
    expectedAttendees: z.number().int().min(1, "Número de participantes esperados obrigatório"),
  }),
]);

// ─── Router ────────────────────────────────────────────────────────────────────
export const proposalsRouter = router({
  // ── Criar proposta ──────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(createProposalInput)
    .mutation(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const base = {
        proposalType: input.proposalType as "conteudo" | "evento_rua",
        status: "pendente" as const,
        title: input.title,
        description: input.description,
        notes: input.notes ?? null,
        suggestedDate: input.suggestedDate,
        proposedById: ctx.user.id,
        proposedByName: ctx.user.name ?? ctx.user.email ?? "Equipe",
      };

      let extra: Record<string, unknown> = {};
      if (input.proposalType === "conteudo") {
        extra = {
          contentType: input.contentType,
          objective: input.objective,
          caption: input.caption,
          hashtags: input.hashtags ?? null,
          referenceUrls: input.referenceUrls ?? null,
        };
      } else {
        extra = {
          eventType: input.eventType,
          location: input.location,
          neighborhood: input.neighborhood,
          city: input.city,
          eventTime: input.eventTime,
          endTime: input.endTime ?? null,
          expectedAttendees: input.expectedAttendees,
        };
      }

      const [result] = await db.insert(contentProposals).values({ ...base, ...extra });
      const proposalId = (result as { insertId: number }).insertId;

      // Notificar coordenadores sobre nova proposta (notificação interna no banco)
      try {
        const typeLabel = input.proposalType === "conteudo" ? "Conteúdo" : "Evento de Rua";
        await db.insert(notifications).values({
          type: "outro",
          title: `Nova Proposta de ${typeLabel}`,
          message: `${base.proposedByName} propôs "${input.title}" para ${input.suggestedDate.toLocaleDateString("pt-BR")}.`,
          metadata: JSON.stringify({ proposalId, proposalType: input.proposalType }),
          isRead: 0,
        });
      } catch { /* notificação não crítica */ }

      // Notificar o dono do projeto via Manus (push notification)
      try {
        const typeLabel = input.proposalType === "conteudo" ? "Conteúdo" : "Evento de Rua";
        const dateStr = input.suggestedDate.toLocaleDateString("pt-BR");
        await notifyOwner({
          title: `📌 Nova Proposta de ${typeLabel}: ${input.title}`,
          content: `${base.proposedByName} enviou uma nova proposta de ${typeLabel.toLowerCase()} para ${dateStr}.\n\nTítulo: ${input.title}\nDescrição: ${input.description.slice(0, 200)}${input.description.length > 200 ? '...' : ''}\n\nAcesse /propostas para aprovar ou rejeitar.`,
        });
      } catch { /* push notification não crítica */ }

      return { id: proposalId, message: "Proposta enviada com sucesso! Aguardando aprovação do coordenador." };
    }),

  // ── Listar propostas ────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["pendente", "aprovado", "rejeitado", "todas"]).default("todas"),
      proposalType: z.enum(["conteudo", "evento_rua", "todas"]).default("todas"),
    }))
    .query(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user.role);
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(contentProposals);

      // Membros da equipe veem apenas as próprias propostas; coordenadores veem todas
      const isCoordinator = ctx.user.role === "coordinator" || ctx.user.role === "superadmin";

      const conditions = [];
      if (!isCoordinator) {
        conditions.push(eq(contentProposals.proposedById, ctx.user.id));
      }
      if (input.status !== "todas") {
        conditions.push(eq(contentProposals.status, input.status as "pendente" | "aprovado" | "rejeitado"));
      }
      if (input.proposalType !== "todas") {
        conditions.push(eq(contentProposals.proposalType, input.proposalType as "conteudo" | "evento_rua"));
      }

      if (conditions.length > 0) {
        const rows = await db.select().from(contentProposals)
          .where(and(...conditions))
          .orderBy(desc(contentProposals.createdAt));
        return rows;
      }

      const rows = await db.select().from(contentProposals)
        .orderBy(desc(contentProposals.createdAt));
      return rows;
    }),

  // ── Contar pendentes (para badge no menu) ──────────────────────────────────
  countPending: protectedProcedure
    .query(async ({ ctx }) => {
      const isCoordinator = ctx.user.role === "coordinator" || ctx.user.role === "superadmin";
      if (!isCoordinator) return { count: 0 };

      const db = await getDb();
      if (!db) return { count: 0 };

      const rows = await db.select().from(contentProposals)
        .where(eq(contentProposals.status, "pendente"));
      return { count: rows.length };
    }),

  // ── Buscar proposta por ID ──────────────────────────────────────────────────
  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const rows = await db.select().from(contentProposals)
        .where(eq(contentProposals.id, input.id))
        .limit(1);

      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Proposta não encontrada." });

      const proposal = rows[0];
      const isCoordinator = ctx.user.role === "coordinator" || ctx.user.role === "superadmin";
      if (!isCoordinator && proposal.proposedById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
      }
      return proposal;
    }),

  // ── Aprovar proposta ────────────────────────────────────────────────────────
  approve: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCoordinator(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const rows = await db.select().from(contentProposals)
        .where(eq(contentProposals.id, input.id)).limit(1);
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Proposta não encontrada." });

      const proposal = rows[0];
      if (proposal.status !== "pendente") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Proposta já está ${proposal.status}.` });
      }

      let convertedItemId: number | null = null;

      // Converter para item real
      if (proposal.proposalType === "conteudo") {
        // Criar post no instagram_posts
        const [postResult] = await db.insert(instagramPosts).values({
          title: proposal.title,
          scheduledDate: proposal.suggestedDate,
          status: "draft",
          type: (proposal.contentType ?? "imagem") as "reels" | "carrossel" | "video" | "story" | "imagem",
          objective: proposal.objective ?? undefined,
          description: proposal.description ?? undefined,
          caption: proposal.caption ?? undefined,
          hashtags: proposal.hashtags ?? undefined,
          notes: `Proposta aprovada por ${ctx.user.name ?? ctx.user.email}. ${proposal.notes ?? ""}`.trim(),
          coordinatorId: ctx.user.id,
        });
        convertedItemId = (postResult as { insertId: number }).insertId;
      } else {
        // Criar evento em street_events
        const [eventResult] = await db.insert(streetEvents).values({
          title: proposal.title,
          description: proposal.description ?? undefined,
          type: (proposal.eventType ?? "outro") as "caminhada" | "reuniao" | "panfletagem" | "visita" | "debate" | "entrevista" | "show" | "outro",
          status: "planejado",
          eventDate: proposal.suggestedDate,
          eventTime: proposal.eventTime ?? "09:00",
          endTime: proposal.endTime ?? undefined,
          location: proposal.location ?? "A definir",
          neighborhood: proposal.neighborhood ?? undefined,
          city: proposal.city ?? "Brasília",
          expectedAttendees: proposal.expectedAttendees ?? 0,
          notes: `Proposta aprovada por ${ctx.user.name ?? ctx.user.email}. ${proposal.notes ?? ""}`.trim(),
          responsibleId: ctx.user.id,
        });
        convertedItemId = (eventResult as { insertId: number }).insertId;
      }

      // Atualizar proposta
      await db.update(contentProposals)
        .set({
          status: "aprovado",
          reviewedById: ctx.user.id,
          reviewedByName: ctx.user.name ?? ctx.user.email ?? "Coordenador",
          reviewNotes: input.reviewNotes ?? null,
          reviewedAt: new Date(),
          convertedItemId,
        })
        .where(eq(contentProposals.id, input.id));

      // Notificar o proponente
      try {
        const typeLabel = proposal.proposalType === "conteudo" ? "conteúdo" : "evento de rua";
        await db.insert(notifications).values({
          type: "outro",
          title: "Proposta Aprovada!",
          message: `Sua proposta de ${typeLabel} "${proposal.title}" foi aprovada por ${ctx.user.name ?? "Coordenador"} e já está na agenda.`,
          metadata: JSON.stringify({ proposalId: input.id, convertedItemId, proposalType: proposal.proposalType }),
          isRead: 0,
          targetUserId: proposal.proposedById,
        });
      } catch { /* notificação não crítica */ }

      const itemType = proposal.proposalType === "conteudo" ? "post" : "evento";
      return {
        message: `Proposta aprovada! ${itemType === "post" ? "Post criado" : "Evento criado"} com ID #${convertedItemId}.`,
        convertedItemId,
        itemType,
      };
    }),

  // ── Rejeitar proposta ───────────────────────────────────────────────────────
  reject: protectedProcedure
    .input(z.object({
      id: z.number().int(),
      reviewNotes: z.string().min(5, "Informe o motivo da rejeição (mín. 5 caracteres)"),
    }))
    .mutation(async ({ ctx, input }) => {
      requireCoordinator(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const rows = await db.select().from(contentProposals)
        .where(eq(contentProposals.id, input.id)).limit(1);
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Proposta não encontrada." });

      const proposal = rows[0];
      if (proposal.status !== "pendente") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Proposta já está ${proposal.status}.` });
      }

      await db.update(contentProposals)
        .set({
          status: "rejeitado",
          reviewedById: ctx.user.id,
          reviewedByName: ctx.user.name ?? ctx.user.email ?? "Coordenador",
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date(),
        })
        .where(eq(contentProposals.id, input.id));

      // Notificar o proponente
      try {
        const typeLabel = proposal.proposalType === "conteudo" ? "conteúdo" : "evento de rua";
        await db.insert(notifications).values({
          type: "outro",
          title: "Proposta Não Aprovada",
          message: `Sua proposta de ${typeLabel} "${proposal.title}" não foi aprovada. Motivo: ${input.reviewNotes}`,
          metadata: JSON.stringify({ proposalId: input.id, proposalType: proposal.proposalType }),
          isRead: 0,
          targetUserId: proposal.proposedById,
        });
      } catch { /* notificação não crítica */ }

      return { message: "Proposta rejeitada." };
    }),

  // ── Excluir proposta (apenas o próprio proponente, se ainda pendente) ───────
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const rows = await db.select().from(contentProposals)
        .where(eq(contentProposals.id, input.id)).limit(1);
      if (rows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Proposta não encontrada." });

      const proposal = rows[0];
      const isCoordinator = ctx.user.role === "coordinator" || ctx.user.role === "superadmin";
      if (!isCoordinator && proposal.proposedById !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você só pode excluir suas próprias propostas." });
      }
      if (proposal.status !== "pendente" && !isCoordinator) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível excluir uma proposta já revisada." });
      }

      await db.delete(contentProposals).where(eq(contentProposals.id, input.id));
      return { message: "Proposta excluída." };
    }),
});
