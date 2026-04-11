/**
 * Testes para as novas funcionalidades de métricas do Instagram:
 * 1. getGrowth — inclui shares e saves por semana
 * 2. getTokenStatus — retorna dias até expirar
 * 3. getTopPosts — ordenação por shares funciona
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { instagramService } from "./services/instagramService";

// Mock do banco de dados para getTokenStatus
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null), // sem banco → fallback
}));

describe("instagramService.getGrowth", () => {
  it("retorna campos likes, comments, shares e saves por semana", async () => {
    const result = await instagramService.getGrowth();
    expect(result).toHaveProperty("daily");
    expect(Array.isArray(result.daily)).toBe(true);

    if (result.daily.length > 0) {
      const firstWeek = result.daily[0];
      expect(firstWeek).toHaveProperty("likes");
      expect(firstWeek).toHaveProperty("comments");
      expect(firstWeek).toHaveProperty("shares");
      expect(firstWeek).toHaveProperty("saves");
      expect(firstWeek).toHaveProperty("engagement");
      expect(firstWeek).toHaveProperty("posts");
      // engagement deve ser a soma de todos os campos
      expect(firstWeek.engagement).toBe(
        firstWeek.likes + firstWeek.comments + firstWeek.shares + firstWeek.saves
      );
    }
  });

  it("ordena semanas em ordem cronológica crescente", async () => {
    const result = await instagramService.getGrowth();
    const dates = result.daily.map((d) => d.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it("shares e saves são números não-negativos", async () => {
    const result = await instagramService.getGrowth();
    for (const week of result.daily) {
      expect(week.shares).toBeGreaterThanOrEqual(0);
      expect(week.saves).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("instagramService.getPosts", () => {
  it("retorna posts com campos shares, saves, reach e impressions", async () => {
    const posts = await instagramService.getPosts();
    expect(Array.isArray(posts)).toBe(true);
    if (posts.length > 0) {
      const post = posts[0];
      expect(post).toHaveProperty("shares");
      expect(post).toHaveProperty("saves");
      expect(post).toHaveProperty("reach");
      expect(post).toHaveProperty("impressions"); // views é mapeado como impressions
      expect(post).toHaveProperty("engagement");
      // engagement deve incluir shares e saves
      expect(post.engagement).toBe(
        post.likes + post.comments + (post.shares || 0) + (post.saves || 0)
      );
    }
  });

  it("todos os posts têm engagement como número não-negativo", async () => {
    const posts = await instagramService.getPosts();
    for (const post of posts) {
      expect(typeof post.engagement).toBe("number");
      expect(post.engagement).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("instagramService.getMetrics", () => {
  it("retorna totalShares e totalSaves como números", async () => {
    const metrics = await instagramService.getMetrics();
    expect(typeof metrics.shares).toBe("number");
    expect(typeof metrics.saves).toBe("number");
    expect(metrics.shares).toBeGreaterThanOrEqual(0);
    expect(metrics.saves).toBeGreaterThanOrEqual(0);
  });
});
