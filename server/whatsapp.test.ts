/**
 * Testes do router de Disparos WhatsApp
 *
 * Testa:
 * - Formatação de mensagem (buildMessage) via previewMessage
 * - Controle de acesso (visitante não pode usar o módulo)
 * - Histórico de disparos retorna array
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ──────────────────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(role: string = "team"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@campanha.com",
    name: "Teste Usuário",
    loginMethod: "local",
    role: role as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createVisitorCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Mock do banco de dados ───────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  }),
}));

// ─── Testes ───────────────────────────────────────────────────────────────────
describe("whatsapp.getHistorico", () => {
  it("retorna array vazio quando não há disparos", async () => {
    const ctx = createCtx("team");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.getHistorico();
    expect(Array.isArray(result)).toBe(true);
  });

  it("visitante não autenticado não pode ver histórico", async () => {
    const ctx = createVisitorCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.whatsapp.getHistorico()).rejects.toThrow();
  });
});

describe("whatsapp.previewMessage", () => {
  it("gera mensagem diária com itens vazios sem erro", async () => {
    const ctx = createCtx("team");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.previewMessage({
      dispatchType: "diario",
      postIds: [],
      eventIds: [],
    });
    expect(result).toHaveProperty("message");
    expect(typeof result.message).toBe("string");
    expect(result.message).toContain("AGENDA DO DIA");
    expect(result.postCount).toBe(0);
    expect(result.eventCount).toBe(0);
  });

  it("gera mensagem semanal com itens vazios sem erro", async () => {
    const ctx = createCtx("coordinator");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.previewMessage({
      dispatchType: "semanal",
      postIds: [],
      eventIds: [],
    });
    expect(result.message).toContain("AGENDA DA SEMANA");
  });

  it("visitante não pode gerar preview", async () => {
    const ctx = createVisitorCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.whatsapp.previewMessage({
        dispatchType: "diario",
        postIds: [],
        eventIds: [],
      })
    ).rejects.toThrow();
  });
});

describe("whatsapp.getAgendaItems", () => {
  it("retorna posts e eventos para disparo diário", async () => {
    const ctx = createCtx("team");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.getAgendaItems({ dispatchType: "diario" });
    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("events");
    expect(Array.isArray(result.posts)).toBe(true);
    expect(Array.isArray(result.events)).toBe(true);
  });

  it("retorna posts e eventos para disparo semanal", async () => {
    const ctx = createCtx("coordinator");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.getAgendaItems({ dispatchType: "semanal" });
    expect(Array.isArray(result.posts)).toBe(true);
    expect(Array.isArray(result.events)).toBe(true);
  });
});
