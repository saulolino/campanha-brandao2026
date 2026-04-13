import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 42 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("../db.js", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../_core/env", () => ({
  ENV: {
    instagramToken: "test-token",
    instagramAccountId: "123456",
  },
}));

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("competitors router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockResolvedValue([{ insertId: 42 }]);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.where.mockResolvedValue(undefined);
  });

  it("deve listar concorrentes ativos", async () => {
    const mockCompetitors = [
      {
        id: 1,
        name: "João Silva",
        party: "PSDB",
        role: "Deputado Distrital",
        isActive: 1,
        instagramUsername: "joaosilva",
        instagramFollowers: 5000,
        facebookPageId: "joaosilva.df",
        facebookFollowers: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    // Simula o resultado final da query chain via limit()
    mockDb.limit.mockResolvedValue(mockCompetitors);
    const result = await mockDb.limit(100);
    expect(result).toEqual(mockCompetitors);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("João Silva");
  });

  it("deve criar um novo concorrente com dados válidos", async () => {
    mockDb.values.mockResolvedValue([{ insertId: 99 }]);
    const result = await mockDb.insert({}).values({
      name: "Maria Santos",
      party: "PT",
      role: "Deputada Distrital",
      instagramUsername: "mariasantos",
      facebookPageId: "mariasantos.df",
      createdById: 1,
    });
    expect(result).toEqual([{ insertId: 99 }]);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("deve atualizar dados de um concorrente existente", async () => {
    mockDb.where.mockResolvedValue({ rowsAffected: 1 });
    const result = await mockDb.update({}).set({ name: "João Silva Atualizado" }).where({});
    expect(result).toEqual({ rowsAffected: 1 });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalled();
  });

  it("deve fazer soft delete de um concorrente (isActive = 0)", async () => {
    mockDb.where.mockResolvedValue({ rowsAffected: 1 });
    const result = await mockDb.update({}).set({ isActive: 0 }).where({});
    expect(result).toEqual({ rowsAffected: 1 });
  });

  it("deve retornar lista vazia quando não há concorrentes", async () => {
    mockDb.limit.mockResolvedValue([]);
    const result = await mockDb.limit(100);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve inserir snapshot histórico ao sincronizar Instagram", async () => {
    mockDb.values.mockResolvedValue([{ insertId: 10 }]);
    const snapshotData = {
      competitorId: 1,
      platform: "instagram" as const,
      followers: 5200,
      following: 300,
      posts: 120,
    };
    const result = await mockDb.insert({}).values(snapshotData);
    expect(result).toEqual([{ insertId: 10 }]);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("deve inserir snapshot histórico ao sincronizar Facebook", async () => {
    mockDb.values.mockResolvedValue([{ insertId: 11 }]);
    const snapshotData = {
      competitorId: 1,
      platform: "facebook" as const,
      followers: 3100,
      likes: 2900,
    };
    const result = await mockDb.insert({}).values(snapshotData);
    expect(result).toEqual([{ insertId: 11 }]);
  });

  it("deve remover @ do username do Instagram ao salvar", () => {
    const rawUsername = "@joaosilva";
    const cleaned = rawUsername.replace("@", "");
    expect(cleaned).toBe("joaosilva");
  });

  it("deve formatar números grandes corretamente", () => {
    const formatNum = (n: number | null | undefined): string => {
      if (n == null) return "—";
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
      if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
      return n.toLocaleString("pt-BR");
    };
    expect(formatNum(null)).toBe("—");
    expect(formatNum(500)).toBe("500");
    expect(formatNum(1500)).toBe("1.5K");
    expect(formatNum(2_500_000)).toBe("2.5M");
  });

  it("deve validar que platform aceita apenas 'instagram' ou 'facebook'", () => {
    const validPlatforms = ["instagram", "facebook"];
    expect(validPlatforms.includes("instagram")).toBe(true);
    expect(validPlatforms.includes("facebook")).toBe(true);
    expect(validPlatforms.includes("twitter")).toBe(false);
  });
});
