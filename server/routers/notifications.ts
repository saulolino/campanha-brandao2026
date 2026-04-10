import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, and, desc, isNull, or, inArray, sql } from "drizzle-orm";

/**
 * Router de Notificações
 * Acessível a coordenadores e superadmin.
 */
export const notificationsRouter = router({
  /**
   * Listar notificações do usuário logado (ou globais)
   */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().default(0),
      onlyUnread: z.boolean().default(false),
      type: z.enum([
        "novo_cadastro", "novo_post", "evento_criado", "evento_confirmado",
        "evento_realizado", "instagram_sync", "token_expirando", "sistema", "outro", "all"
      ]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a coordenadores e superadmin" });
      }

      const conditions = [
        // Notificações globais (sem destinatário específico) ou para este usuário
        or(isNull(notifications.targetUserId), eq(notifications.targetUserId, Number(ctx.user.id))),
      ];

      if (input.onlyUnread) {
        conditions.push(eq(notifications.isRead, 0));
      }

      if (input.type !== "all") {
        conditions.push(eq(notifications.type, input.type));
      }

      const rows = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  /**
   * Contar notificações não lidas
   */
  countUnread: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        return { count: 0 };
      }

      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(notifications)
        .where(and(
          or(isNull(notifications.targetUserId), eq(notifications.targetUserId, Number(ctx.user.id))),
          eq(notifications.isRead, 0),
        ));

      return { count: Number(result[0]?.count ?? 0) };
    }),

  /**
   * Marcar uma notificação como lida
   */
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(notifications)
        .set({ isRead: 1, readAt: new Date() })
        .where(eq(notifications.id, input.id));

      return { success: true };
    }),

  /**
   * Marcar todas como lidas
   */
  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a coordenadores e superadmin" });
      }

      await db
        .update(notifications)
        .set({ isRead: 1, readAt: new Date() })
        .where(and(
          or(isNull(notifications.targetUserId), eq(notifications.targetUserId, Number(ctx.user.id))),
          eq(notifications.isRead, 0),
        ));

      return { success: true };
    }),

  /**
   * Excluir uma notificação (somente superadmin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Somente superadmin pode excluir notificações" });
      }

      await db.delete(notifications).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  /**
   * Criar notificação (uso interno/sistema — somente superadmin via UI)
   */
  create: protectedProcedure
    .input(z.object({
      type: z.enum([
        "novo_cadastro", "novo_post", "evento_criado", "evento_confirmado",
        "evento_realizado", "instagram_sync", "token_expirando", "sistema", "outro"
      ]),
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      metadata: z.string().optional(),
      targetUserId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Somente superadmin pode criar notificações manualmente" });
      }

      await db.insert(notifications).values({
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata ?? null,
        targetUserId: input.targetUserId ?? null,
        triggeredByUserId: ctx.user.id,
        isRead: 0,
      });

      return { success: true };
    }),
});

/**
 * Helper para criar notificações a partir de outros routers/serviços
 */
export async function createNotification(params: {
  type: "novo_cadastro" | "novo_post" | "evento_criado" | "evento_confirmado" | "evento_realizado" | "instagram_sync" | "token_expirando" | "sistema" | "outro";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  targetUserId?: number;
  triggeredByUserId?: number;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(notifications).values({
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    targetUserId: params.targetUserId ?? null,
    triggeredByUserId: params.triggeredByUserId ?? null,
    isRead: 0,
  });
}
