import { z } from "zod";
import { protectedProcedure, router } from "../\_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  /**
   * Listar todos os usuários (apenas SuperAdmin)
   */
  list: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode listar usuários" });
      }
      return next({ ctx });
    })
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const allUsers = await db.select().from(users);
      return allUsers;
    }),

  /**
   * Obter usuário por ID
   */
  getById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Usuário só pode ver a si mesmo, ou SuperAdmin pode ver qualquer um
      if (ctx.user?.id !== input.userId && ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para ver este usuário" });
      }

      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      return user[0];
    }),

  /**
   * Atualizar role de um usuário (apenas SuperAdmin)
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        newRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode atualizar roles" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Não permitir remover SuperAdmin do próprio usuário
      if (input.userId === ctx.user.id && input.newRole !== "superadmin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode remover seu próprio acesso de SuperAdmin",
        });
      }

      await db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.userId));

      return { success: true, message: `Usuário atualizado para ${input.newRole}` };
    }),

  /**
   * Atualizar nome do usuário — apenas SuperAdmin
   */
  updateName: protectedProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string().min(1).max(120),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode editar usuários" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await db.update(users).set({ name: input.name }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /**
   * Remover usuário — apenas SuperAdmin, não pode remover a si mesmo
   */
  delete: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode remover usuários" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode remover sua própria conta" });
      }
      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /**
   * Obter permissões do usuário atual
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const { getPermissions } = await import("../../shared/permissions");
    return getPermissions(ctx.user?.role || "visitor");
  }),
});
