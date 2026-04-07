import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  /**
   * Endpoint público temporário para atualizar role por email
   * NOTA: Remover após uso inicial
   */
  updateRoleByEmailPublic: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        newRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
        secret: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Verificação de segurança simples
      if (input.secret !== "temp-setup-secret-change-me") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Secret inválido" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar o usuário por email
      const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!userResult.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const user = userResult[0];

      // Mapear o novo role para o valor que o banco de dados aceita
      // Se for superadmin, mapear para admin (que é o equivalente no banco)
      const dbRole = input.newRole === "superadmin" ? "admin" : input.newRole;

      await db
        .update(users)
        .set({ role: dbRole as any })
        .where(eq(users.id, user.id));

      return { success: true, message: `Usuário ${input.email} atualizado para ${input.newRole}` };
    }),
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
   * Buscar usuário por email (apenas SuperAdmin)
   */
  getByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode buscar usuários por email" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!result.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      return result[0];
    }),

  /**
   * Atualizar role de um usuário por email (apenas SuperAdmin)
   */
  updateRoleByEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        newRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode atualizar roles" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar o usuário por email
      const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!userResult.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const user = userResult[0];

      // Não permitir remover SuperAdmin do próprio usuário
      if (user.id === ctx.user.id && input.newRole !== "superadmin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode remover seu próprio acesso de SuperAdmin",
        });
      }

      await db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, user.id));

      return { success: true, message: `Usuário ${input.email} atualizado para ${input.newRole}` };
    }),

  /**
   * Ativar/Desativar usuário (apenas SuperAdmin)
   */




  /**
   * Obter permissões do usuário atual
   */
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const { getPermissions } = await import("../../shared/permissions");
    return getPermissions(ctx.user?.role || "visitor");
  }),
});
