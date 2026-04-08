import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Utilitário simples de hash de senha (SHA-256 com salt fixo)
// Em produção real, use bcrypt — aqui usamos SHA-256 para evitar dependência extra
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(`campanha2026:${password}`).digest("hex");
}

// Middleware de SuperAdmin reutilizável
const superadminMiddleware = async ({ ctx, next }: any) => {
  if (ctx.user?.role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas SuperAdmin pode gerenciar usuários" });
  }
  return next({ ctx });
};

export const usersRouter = router({
  /**
   * Listar todos os usuários (apenas SuperAdmin)
   */
  list: protectedProcedure
    .use(superadminMiddleware)
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        // Não retornar passwordHash por segurança
      }).from(users).orderBy(users.createdAt);
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

      if (ctx.user?.id !== input.userId && ctx.user?.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não tem permissão para ver este usuário" });
      }

      const user = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      }).from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      return user[0];
    }),

  /**
   * Criar novo usuário (apenas SuperAdmin)
   */
  create: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({
      name: z.string().min(1).max(120),
      email: z.string().email(),
      password: z.string().min(4).max(100),
      role: z.enum(["visitor", "team", "coordinator", "superadmin"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se email já existe
      const existing = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Já existe um usuário com este e-mail" });
      }

      const openId = `local:${input.email}`;
      const passwordHash = hashPassword(input.password);

      await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email,
        role: input.role,
        loginMethod: "local",
        passwordHash,
        lastSignedIn: new Date(),
      });

      return { success: true, message: "Usuário criado com sucesso" };
    }),

  /**
   * Atualizar dados completos de um usuário (apenas SuperAdmin)
   */
  update: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({
      userId: z.number(),
      name: z.string().min(1).max(120).optional(),
      email: z.string().email().optional(),
      role: z.enum(["visitor", "team", "coordinator", "superadmin"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Não permitir remover SuperAdmin do próprio usuário
      if (input.userId === ctx.user?.id && input.role && input.role !== "superadmin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode remover seu próprio acesso de SuperAdmin",
        });
      }

      const updateSet: Record<string, unknown> = {};
      if (input.name !== undefined) updateSet.name = input.name;
      if (input.email !== undefined) {
        // Verificar se novo email já existe em outro usuário
        const existing = await db.select({ id: users.id })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);
        if (existing.length > 0 && existing[0].id !== input.userId) {
          throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já está em uso por outro usuário" });
        }
        updateSet.email = input.email;
        // Atualizar openId para manter consistência
        updateSet.openId = `local:${input.email}`;
      }
      if (input.role !== undefined) updateSet.role = input.role;

      if (Object.keys(updateSet).length === 0) {
        return { success: true, message: "Nenhuma alteração realizada" };
      }

      await db.update(users).set(updateSet).where(eq(users.id, input.userId));
      return { success: true, message: "Usuário atualizado com sucesso" };
    }),

  /**
   * Atualizar senha de um usuário (apenas SuperAdmin)
   */
  updatePassword: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(4).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const passwordHash = hashPassword(input.newPassword);
      await db.update(users).set({ passwordHash }).where(eq(users.id, input.userId));

      return { success: true, message: "Senha atualizada com sucesso" };
    }),

  /**
   * Atualizar role de um usuário (apenas SuperAdmin) — mantido para compatibilidade
   */
  updateRole: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({
      userId: z.number(),
      newRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (input.userId === ctx.user?.id && input.newRole !== "superadmin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode remover seu próprio acesso de SuperAdmin",
        });
      }

      await db.update(users).set({ role: input.newRole }).where(eq(users.id, input.userId));
      return { success: true, message: `Usuário atualizado para ${input.newRole}` };
    }),

  /**
   * Remover usuário — apenas SuperAdmin, não pode remover a si mesmo
   */
  delete: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      if (input.userId === ctx.user?.id) {
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
