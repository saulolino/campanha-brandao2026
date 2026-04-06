import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
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
   * Ativar/Desativar usuário (apenas SuperAdmin)
   */
  toggleActive: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode ativar/desativar usuários" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(users)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(eq(users.id, input.userId));

      return { success: true, message: `Usuário ${input.isActive ? "ativado" : "desativado"}` };
    }),

  /**
   * Atualizar departamento do usuário
   */
  updateDepartment: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        department: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Usuário só pode atualizar a si mesmo, ou SuperAdmin pode atualizar qualquer um
      if (ctx.user?.id !== input.userId && ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para atualizar este usuário" });
      }

      await db
        .update(users)
        .set({ department: input.department })
        .where(eq(users.id, input.userId));

      return { success: true, message: "Departamento atualizado" };
    }),

  /**
   * Obter permissões do usuário atual
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const { getPermissions } = await import("../../shared/permissions");
    return getPermissions(ctx.user?.role || "visitor");
  }),
});
