/**
 * Router de Disparos WhatsApp
 *
 * Integração com Whapi.Cloud para envio de mensagens de agenda
 * para grupos de WhatsApp da campanha.
 *
 * Procedures:
 *   - getGroups       → lista grupos disponíveis via Whapi.Cloud
 *   - previewMessage  → gera mensagem formatada a partir dos itens selecionados
 *   - sendDisparo     → envia mensagem para grupo e salva no banco
 *   - getHistorico    → lista disparos anteriores
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db.js";
import {
  whatsappDispatches,
  instagramPosts,
  streetEvents,
} from "../../drizzle/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// ─── Constantes ───────────────────────────────────────────────────────────────
const WHAPI_BASE_URL = "https://gate.whapi.cloud";
const WHAPI_TOKEN = process.env.WHAPI_TOKEN ?? "z56tztoDQLqSZ3HHvNKz8VaxKZA37BX1";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function requireTeamOrAbove(role: string | null | undefined) {
  if (!role || role === "visitor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas membros da equipe podem usar o módulo de disparos.",
    });
  }
}

async function whapiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${WHAPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${WHAPI_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Whapi.Cloud respondeu com ${res.status}: ${text}`,
    });
  }

  return res.json();
}

// ─── Formatação de mensagem ───────────────────────────────────────────────────
interface PostItem {
  id: number;
  title: string;
  scheduledDate: Date | string | null;
  scheduledTime: string | null;
  type: string;
  objective: string | null;
  caption: string | null;
}

interface EventItem {
  id: number;
  title: string;
  eventDate: Date | string | null;
  eventTime: string | null;
  location: string;
  neighborhood: string | null;
  type: string;
  expectedAttendees: number | null;
  description: string | null;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "Data a definir";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function buildMessage(
  dispatchType: "diario" | "semanal",
  posts: PostItem[],
  events: EventItem[]
): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const header =
    dispatchType === "diario"
      ? `📋 *AGENDA DO DIA — ${dateStr}*\nCampanha Eduardo Brandão 2026`
      : `📅 *AGENDA DA SEMANA — ${dateStr}*\nCampanha Eduardo Brandão 2026`;

  const lines: string[] = [header, ""];

  if (posts.length > 0) {
    lines.push("📱 *CONTEÚDO INSTAGRAM*");
    posts.forEach((p, i) => {
      const typeLabel: Record<string, string> = {
        reels: "Reels",
        carrossel: "Carrossel",
        video: "Vídeo",
        story: "Story",
        imagem: "Imagem",
      };
      lines.push(
        `${i + 1}. *${p.title}*\n` +
          `   📅 ${formatDate(p.scheduledDate)}${p.scheduledTime ? " às " + p.scheduledTime : ""}\n` +
          `   🎬 Formato: ${typeLabel[p.type] ?? p.type}` +
          (p.objective ? `\n   🎯 Objetivo: ${p.objective}` : "") +
          (p.caption ? `\n   📝 _${p.caption.slice(0, 80)}${p.caption.length > 80 ? "..." : ""}_` : "")
      );
    });
    lines.push("");
  }

  if (events.length > 0) {
    lines.push("🏃 *AGENDA DE RUA*");
    const typeLabel: Record<string, string> = {
      caminhada: "Caminhada",
      reuniao: "Reunião",
      panfletagem: "Panfletagem",
      visita: "Visita",
      debate: "Debate",
      entrevista: "Entrevista",
      show: "Show",
      outro: "Evento",
    };
    events.forEach((e, i) => {
      lines.push(
        `${i + 1}. *${e.title}*\n` +
          `   📅 ${formatDate(e.eventDate)}${e.eventTime ? " às " + e.eventTime : ""}\n` +
          `   📍 ${e.location}${e.neighborhood ? " — " + e.neighborhood : ""}\n` +
          `   🏷️ ${typeLabel[e.type] ?? e.type}` +
          (e.expectedAttendees ? `\n   👥 Público esperado: ${e.expectedAttendees}` : "") +
          (e.description ? `\n   📝 _${e.description.slice(0, 80)}${e.description.length > 80 ? "..." : ""}_` : "")
      );
    });
    lines.push("");
  }

  if (posts.length === 0 && events.length === 0) {
    lines.push("_Nenhum item selecionado._");
    lines.push("");
  }

  lines.push("_Mensagem gerada automaticamente pelo Painel da Campanha._");

  return lines.join("\n");
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const whatsappRouter = router({
  /**
   * Lista grupos de WhatsApp disponíveis via Whapi.Cloud
   */
  getGroups: protectedProcedure
    .input(
      z.object({
        count: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user?.role);

      const count = input?.count ?? 50;
      const offset = input?.offset ?? 0;

      const data = await whapiRequest(`/groups?count=${count}&offset=${offset}`);

      // Whapi retorna { groups: [...] } com campos: id, name, participants_count, etc.
      const groups: Array<{ id: string; name: string; participantsCount: number }> =
        (data.groups ?? []).map((g: any) => ({
          id: g.id as string,
          name: (g.name ?? g.subject ?? g.id) as string,
          participantsCount: (g.participants_count ?? 0) as number,
        }));

      return groups;
    }),

  /**
   * Gera preview da mensagem formatada a partir dos IDs selecionados
   */
  previewMessage: protectedProcedure
    .input(
      z.object({
        dispatchType: z.enum(["diario", "semanal"]),
        postIds: z.array(z.number()).default([]),
        eventIds: z.array(z.number()).default([]),
      })
    )
    .query(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user?.role);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      // Buscar posts selecionados
      let posts: PostItem[] = [];
      if (input.postIds.length > 0) {
        const rows = await db
          .select({
            id: instagramPosts.id,
            title: instagramPosts.title,
            scheduledDate: instagramPosts.scheduledDate,
            scheduledTime: instagramPosts.scheduledTime,
            type: instagramPosts.type,
            objective: instagramPosts.objective,
            caption: instagramPosts.caption,
          })
          .from(instagramPosts);
        posts = rows.filter((r) => input.postIds.includes(r.id));
      }

      // Buscar eventos selecionados
      let events: EventItem[] = [];
      if (input.eventIds.length > 0) {
        const rows = await db
          .select({
            id: streetEvents.id,
            title: streetEvents.title,
            eventDate: streetEvents.eventDate,
            eventTime: streetEvents.eventTime,
            location: streetEvents.location,
            neighborhood: streetEvents.neighborhood,
            type: streetEvents.type,
            expectedAttendees: streetEvents.expectedAttendees,
            description: streetEvents.description,
          })
          .from(streetEvents);
        events = rows.filter((r) => input.eventIds.includes(r.id));
      }

      const message = buildMessage(input.dispatchType, posts, events);
      return { message, postCount: posts.length, eventCount: events.length };
    }),

  /**
   * Envia mensagem para grupo via Whapi.Cloud e salva no banco
   */
  sendDisparo: protectedProcedure
    .input(
      z.object({
        dispatchType: z.enum(["diario", "semanal"]),
        groupId: z.string().min(1),
        groupName: z.string().min(1),
        postIds: z.array(z.number()).default([]),
        eventIds: z.array(z.number()).default([]),
        // Mensagem já gerada pelo preview (para evitar inconsistência)
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user?.role);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      let status: "enviado" | "erro" = "enviado";
      let errorMessage: string | undefined;

      try {
        // Enviar mensagem via Whapi.Cloud
        await whapiRequest("/messages/text", {
          method: "POST",
          body: JSON.stringify({
            to: input.groupId,
            body: input.message,
          }),
        });
      } catch (err: any) {
        status = "erro";
        errorMessage = err?.message ?? "Erro desconhecido ao enviar mensagem";
      }

      // Salvar no banco independentemente do status
      await db.insert(whatsappDispatches).values({
        groupId: input.groupId,
        groupName: input.groupName,
        dispatchType: input.dispatchType,
        message: input.message,
        includedPostIds: JSON.stringify(input.postIds),
        includedEventIds: JSON.stringify(input.eventIds),
        sentById: ctx.user!.id,
        sentByName: ctx.user?.name ?? null,
        status,
        errorMessage: errorMessage ?? null,
      });

      if (status === "erro") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage ?? "Falha ao enviar mensagem",
        });
      }

      return { success: true, status };
    }),

  /**
   * Lista histórico de disparos anteriores
   */
  getHistorico: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ ctx }) => {
      requireTeamOrAbove(ctx.user?.role);

      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(whatsappDispatches)
        .orderBy(desc(whatsappDispatches.createdAt))
        .limit(20);

      return rows;
    }),

  /**
   * Lista posts e eventos disponíveis para seleção no disparo
   */
  getAgendaItems: protectedProcedure
    .input(
      z.object({
        dispatchType: z.enum(["diario", "semanal"]),
      })
    )
    .query(async ({ ctx, input }) => {
      requireTeamOrAbove(ctx.user?.role);

      const db = await getDb();
      if (!db) return { posts: [], events: [] };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Para disparo diário: itens de hoje e amanhã
      // Para disparo semanal: itens dos próximos 7 dias
      const endDate = new Date(today);
      if (input.dispatchType === "diario") {
        endDate.setDate(endDate.getDate() + 2);
      } else {
        endDate.setDate(endDate.getDate() + 7);
      }

      // Posts programados
      const posts = await db
        .select({
          id: instagramPosts.id,
          title: instagramPosts.title,
          scheduledDate: instagramPosts.scheduledDate,
          scheduledTime: instagramPosts.scheduledTime,
          type: instagramPosts.type,
          objective: instagramPosts.objective,
          caption: instagramPosts.caption,
          status: instagramPosts.status,
        })
        .from(instagramPosts)
        .where(
          and(
            gte(instagramPosts.scheduledDate, today),
            lte(instagramPosts.scheduledDate, endDate)
          )
        )
        .orderBy(instagramPosts.scheduledDate);

      // Eventos de rua
      const events = await db
        .select({
          id: streetEvents.id,
          title: streetEvents.title,
          eventDate: streetEvents.eventDate,
          eventTime: streetEvents.eventTime,
          location: streetEvents.location,
          neighborhood: streetEvents.neighborhood,
          type: streetEvents.type,
          expectedAttendees: streetEvents.expectedAttendees,
          description: streetEvents.description,
          status: streetEvents.status,
        })
        .from(streetEvents)
        .where(
          and(
            gte(streetEvents.eventDate, today),
            lte(streetEvents.eventDate, endDate)
          )
        )
        .orderBy(streetEvents.eventDate);

      return { posts, events };
    }),
});
