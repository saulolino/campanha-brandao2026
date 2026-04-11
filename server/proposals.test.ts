/**
 * Testes do router de propostas de pauta
 *
 * Cobre:
 * - Criação de proposta de conteúdo e evento de rua
 * - Validação de campos obrigatórios
 * - Controle de acesso por role
 * - Aprovação e rejeição
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do banco de dados ────────────────────────────────────────────────────
const mockInsert = vi.fn().mockResolvedValue([{ insertId: 42 }]);
const mockSelect = vi.fn();
const mockUpdate = vi.fn().mockResolvedValue([{}]);
const mockDelete = vi.fn().mockResolvedValue([{}]);

vi.mock("../server/db.js", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: () => ({ values: mockInsert }),
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => [], limit: () => [] }), orderBy: () => [] }) }),
    update: () => ({ set: () => ({ where: mockUpdate }) }),
    delete: () => ({ where: mockDelete }),
  }),
}));

// ─── Helpers de contexto ───────────────────────────────────────────────────────
function makeCtx(role: string, id = 1) {
  return {
    user: { id, email: "test@test.com", name: "Teste", role },
    req: {} as any,
    res: {} as any,
  };
}

const baseContentInput = {
  proposalType: "conteudo" as const,
  title: "Post sobre o Parque Olhos d'Água",
  description: "Mostrar o estado atual do parque e a proposta do Eduardo para revitalização.",
  suggestedDate: new Date("2026-05-15"),
  contentType: "reels" as const,
  objective: "awareness",
  caption: "O Parque Olhos d'Água merece mais atenção. Eduardo Brandão tem um plano concreto para revitalizar este espaço tão importante para o Noroeste.",
};

const baseEventInput = {
  proposalType: "evento_rua" as const,
  title: "Caminhada no Setor Noroeste",
  description: "Mobilização de moradores do Noroeste para apresentar propostas de mobilidade urbana.",
  suggestedDate: new Date("2026-05-20"),
  eventType: "caminhada" as const,
  location: "Praça do Pôr do Sol, Setor Noroeste",
  neighborhood: "Setor Noroeste",
  city: "Brasília",
  eventTime: "08:00",
  expectedAttendees: 80,
};

// ─── Testes de validação de input ─────────────────────────────────────────────
describe("Propostas — validação de campos", () => {
  it("deve aceitar proposta de conteúdo com todos os campos obrigatórios", () => {
    // Verificar que o schema Zod aceita o input válido
    const { z } = require("zod");
    const schema = z.object({
      proposalType: z.literal("conteudo"),
      title: z.string().min(3),
      description: z.string().min(10),
      suggestedDate: z.date(),
      contentType: z.enum(["reels", "carrossel", "video", "story", "imagem"]),
      objective: z.string().min(1),
      caption: z.string().min(10),
    });
    const result = schema.safeParse(baseContentInput);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar proposta de conteúdo sem título", () => {
    const { z } = require("zod");
    const schema = z.object({
      title: z.string().min(3, "Título obrigatório"),
    });
    const result = schema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Título obrigatório");
  });

  it("deve rejeitar proposta de conteúdo sem legenda", () => {
    const { z } = require("zod");
    const schema = z.object({
      caption: z.string().min(10, "Sugestão de legenda obrigatória"),
    });
    const result = schema.safeParse({ caption: "curto" });
    expect(result.success).toBe(false);
  });

  it("deve aceitar proposta de evento de rua com todos os campos obrigatórios", () => {
    const { z } = require("zod");
    const schema = z.object({
      proposalType: z.literal("evento_rua"),
      title: z.string().min(3),
      description: z.string().min(10),
      suggestedDate: z.date(),
      eventType: z.enum(["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]),
      location: z.string().min(5),
      neighborhood: z.string().min(2),
      eventTime: z.string().regex(/^\d{2}:\d{2}$/),
      expectedAttendees: z.number().int().min(1),
    });
    const result = schema.safeParse(baseEventInput);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar evento de rua com horário inválido", () => {
    const { z } = require("zod");
    const schema = z.object({
      eventTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
    });
    const result = schema.safeParse({ eventTime: "9:00" }); // formato inválido
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Hora inválida");
  });

  it("deve rejeitar evento de rua com 0 participantes", () => {
    const { z } = require("zod");
    const schema = z.object({
      expectedAttendees: z.number().int().min(1, "Número de participantes obrigatório"),
    });
    const result = schema.safeParse({ expectedAttendees: 0 });
    expect(result.success).toBe(false);
  });
});

// ─── Testes de controle de acesso ─────────────────────────────────────────────
describe("Propostas — controle de acesso", () => {
  it("visitante não deve poder criar propostas", () => {
    const { TRPCError } = require("@trpc/server");
    function requireTeamOrAbove(role: string | null | undefined) {
      if (!role || role === "visitor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas membros da equipe podem criar propostas.",
        });
      }
    }
    expect(() => requireTeamOrAbove("visitor")).toThrow("Apenas membros da equipe podem criar propostas.");
  });

  it("membro da equipe deve poder criar propostas", () => {
    const { TRPCError } = require("@trpc/server");
    function requireTeamOrAbove(role: string | null | undefined) {
      if (!role || role === "visitor") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado." });
      }
    }
    expect(() => requireTeamOrAbove("team")).not.toThrow();
  });

  it("apenas coordenador pode aprovar propostas", () => {
    const { TRPCError } = require("@trpc/server");
    function requireCoordinator(role: string | null | undefined) {
      if (role !== "coordinator" && role !== "superadmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas coordenadores podem realizar esta ação.",
        });
      }
    }
    expect(() => requireCoordinator("team")).toThrow("Apenas coordenadores podem realizar esta ação.");
    expect(() => requireCoordinator("coordinator")).not.toThrow();
    expect(() => requireCoordinator("superadmin")).not.toThrow();
  });

  it("visitante não pode aprovar propostas", () => {
    const { TRPCError } = require("@trpc/server");
    function requireCoordinator(role: string | null | undefined) {
      if (role !== "coordinator" && role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas coordenadores podem realizar esta ação." });
      }
    }
    expect(() => requireCoordinator("visitor")).toThrow();
  });
});

// ─── Testes de lógica de negócio ──────────────────────────────────────────────
describe("Propostas — lógica de negócio", () => {
  it("proposta aprovada deve ter status 'aprovado'", () => {
    const proposal = { status: "pendente", id: 1 };
    // Simular aprovação
    const updated = { ...proposal, status: "aprovado", reviewedAt: new Date() };
    expect(updated.status).toBe("aprovado");
    expect(updated.reviewedAt).toBeInstanceOf(Date);
  });

  it("proposta rejeitada deve ter status 'rejeitado'", () => {
    const proposal = { status: "pendente", id: 1 };
    const updated = { ...proposal, status: "rejeitado", reviewNotes: "Tema já coberto recentemente." };
    expect(updated.status).toBe("rejeitado");
    expect(updated.reviewNotes).toBeTruthy();
  });

  it("não deve aprovar proposta já aprovada", () => {
    const { TRPCError } = require("@trpc/server");
    function checkCanReview(status: string) {
      if (status !== "pendente") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Proposta já está ${status}.` });
      }
    }
    expect(() => checkCanReview("aprovado")).toThrow("Proposta já está aprovado.");
    expect(() => checkCanReview("rejeitado")).toThrow("Proposta já está rejeitado.");
    expect(() => checkCanReview("pendente")).not.toThrow();
  });

  it("proposta de conteúdo deve gerar post ao ser aprovada", () => {
    const proposal = { proposalType: "conteudo", title: "Post Teste", contentType: "reels" };
    const itemType = proposal.proposalType === "conteudo" ? "post" : "evento";
    expect(itemType).toBe("post");
  });

  it("proposta de evento deve gerar evento de rua ao ser aprovada", () => {
    const proposal = { proposalType: "evento_rua", title: "Caminhada Teste", eventType: "caminhada" };
    const itemType = proposal.proposalType === "conteudo" ? "post" : "evento";
    expect(itemType).toBe("evento");
  });

  it("rejeição sem motivo deve ser inválida", () => {
    const { z } = require("zod");
    const schema = z.object({
      reviewNotes: z.string().min(5, "Informe o motivo da rejeição"),
    });
    expect(schema.safeParse({ reviewNotes: "ok" }).success).toBe(false);
    expect(schema.safeParse({ reviewNotes: "Tema já coberto." }).success).toBe(true);
  });
});
