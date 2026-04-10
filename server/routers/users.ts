import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, accessLogs, passwordResetTokens } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import crypto from "crypto";

// Utilitário simples de hash de senha (SHA-256 com salt fixo)
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

  /**
   * Listar log de acessos (apenas SuperAdmin)
   */
  listAccessLogs: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({
      limit: z.number().min(1).max(200).default(50),
      userId: z.number().optional(), // filtrar por usuário específico
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let query = db.select().from(accessLogs).orderBy(desc(accessLogs.createdAt)).limit(input.limit);
      return await query;
    }),

  /**
   * Gerar token de recuperação de senha (apenas SuperAdmin)
   * Cria um token válido por 24h e retorna o link de redefinição
   */
  generatePasswordResetToken: protectedProcedure
    .use(superadminMiddleware)
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verificar se usuário existe
      const user = await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Invalidar tokens anteriores do mesmo usuário
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.userId));

      // Criar novo token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      await db.insert(passwordResetTokens).values({
        userId: input.userId,
        token,
        expiresAt,
      });

      return {
        success: true,
        token,
        expiresAt,
        userName: user[0].name,
        userEmail: user[0].email,
      };
    }),

  /**
   * Cadastro público — cria usuário como visitante para posterior classificação pelo admin
   */
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      whatsapp: z.string().min(10).max(20),
      password: z.string().min(6).max(100),
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
        throw new TRPCError({ code: "CONFLICT", message: "Já existe uma conta com este e-mail" });
      }

      const openId = `local:${input.email}`;
      const passwordHash = hashPassword(input.password);

      await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        role: "visitor", // sempre visitante até o admin classificar
        loginMethod: "local",
        passwordHash,
        lastSignedIn: new Date(),
      });

      // Notificar admin sobre novo cadastro
      notifyOwner({
        title: `🆕 Novo cadastro: ${input.name}`,
        content: [
          `**${input.name}** acabou de se cadastrar no painel e aguarda aprovação.`,
          ``,
          `📧 **E-mail:** ${input.email}`,
          `📱 **WhatsApp:** ${input.whatsapp}`,
          `🔑 **Role atual:** Visitante (pendente de classificação)`,
          ``,
          `Acesse o painel em **Usuários → Gerenciar** para promover o acesso.`,
        ].join("\n"),
      }).catch(() => {}); // não bloquear o cadastro se a notificação falhar

      return { success: true, message: "Cadastro realizado! Aguarde a aprovação do administrador para acessar o painel." };
    }),

  /**
   * Listar usuários visitantes pendentes de classificação (apenas SuperAdmin e Coordenador)
   */
  listPending: protectedProcedure
    .use(async ({ ctx, next }: any) => {
      if (!ctx.user || !['superadmin', 'coordinator'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
      }
      return next({ ctx });
    })
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const pending = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        whatsapp: users.whatsapp,
        role: users.role,
        createdAt: users.createdAt,
        loginMethod: users.loginMethod,
      }).from(users)
        .where(eq(users.role, "visitor"))
        .orderBy(desc(users.createdAt));

      return pending;
    }),

  /**
   * Redefinir senha via token (público — não requer autenticação)
   */
  resetPasswordWithToken: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(4).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar token válido
      const tokenRecord = await db.select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, input.token))
        .limit(1);

      if (!tokenRecord.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido ou expirado" });
      }

      const record = tokenRecord[0];

      if (record.usedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este link já foi utilizado" });
      }

      if (new Date() > record.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este link expirou. Solicite um novo ao administrador" });
      }

      // Atualizar senha
      const passwordHash = hashPassword(input.newPassword);
      await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));

      // Marcar token como usado
      await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));

      return { success: true, message: "Senha redefinida com sucesso" };
    }),
});
