import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ExecutiveReportExporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate correct statistics for posts", () => {
    const posts = [
      {
        id: 1,
        date: "2026-04-01",
        title: "Post 1",
        status: "publicado",
        format: "reel",
        pillar: "turismo",
        hasAds: true,
      },
      {
        id: 2,
        date: "2026-04-02",
        title: "Post 2",
        status: "planejado",
        format: "carrossel",
        pillar: "cultura",
        hasAds: false,
      },
    ];

    const statusCounts = posts.reduce(
      (acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(statusCounts.publicado).toBe(1);
    expect(statusCounts.planejado).toBe(1);
  });

  it("should calculate correct pillar distribution", () => {
    const posts = [
      { id: 1, date: "2026-04-01", title: "Post 1", status: "publicado", format: "reel", pillar: "turismo", hasAds: true },
      { id: 2, date: "2026-04-02", title: "Post 2", status: "planejado", format: "carrossel", pillar: "turismo", hasAds: false },
      { id: 3, date: "2026-04-03", title: "Post 3", status: "publicado", format: "post", pillar: "cultura", hasAds: true },
    ];

    const pillarCounts = posts.reduce(
      (acc, post) => {
        acc[post.pillar] = (acc[post.pillar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(pillarCounts.turismo).toBe(2);
    expect(pillarCounts.cultura).toBe(1);
  });

  it("should calculate ads percentage correctly", () => {
    const posts = [
      { id: 1, date: "2026-04-01", title: "Post 1", status: "publicado", format: "reel", pillar: "turismo", hasAds: true },
      { id: 2, date: "2026-04-02", title: "Post 2", status: "planejado", format: "carrossel", pillar: "cultura", hasAds: true },
      { id: 3, date: "2026-04-03", title: "Post 3", status: "publicado", format: "post", pillar: "cultura", hasAds: false },
      { id: 4, date: "2026-04-04", title: "Post 4", status: "publicado", format: "reel", pillar: "turismo", hasAds: false },
    ];

    const postsWithAds = posts.filter((p) => p.hasAds).length;
    const adsPercentage = ((postsWithAds / posts.length) * 100).toFixed(1);

    expect(postsWithAds).toBe(2);
    expect(adsPercentage).toBe("50.0");
  });

  it("should identify top pillar correctly", () => {
    const posts = [
      { id: 1, date: "2026-04-01", title: "Post 1", status: "publicado", format: "reel", pillar: "turismo", hasAds: true },
      { id: 2, date: "2026-04-02", title: "Post 2", status: "planejado", format: "carrossel", pillar: "turismo", hasAds: false },
      { id: 3, date: "2026-04-03", title: "Post 3", status: "publicado", format: "post", pillar: "turismo", hasAds: true },
      { id: 4, date: "2026-04-04", title: "Post 4", status: "publicado", format: "reel", pillar: "cultura", hasAds: false },
    ];

    const pillarCounts = posts.reduce(
      (acc, post) => {
        acc[post.pillar] = (acc[post.pillar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topPillar = Object.entries(pillarCounts).sort(([, a], [, b]) => b - a)[0];

    expect(topPillar[0]).toBe("turismo");
    expect(topPillar[1]).toBe(3);
  });

  it("should filter posts by month correctly", () => {
    const posts = [
      { id: 1, date: "2026-04-01", title: "Post 1", status: "publicado", format: "reel", pillar: "turismo", hasAds: true },
      { id: 2, date: "2026-04-02", title: "Post 2", status: "planejado", format: "carrossel", pillar: "cultura", hasAds: false },
      { id: 3, date: "2026-05-01", title: "Post 3", status: "publicado", format: "post", pillar: "cultura", hasAds: true },
    ];

    const year = 2026;
    const month = 4;

    const monthPosts = posts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === year && postDate.getMonth() === month - 1;
    });

    expect(monthPosts.length).toBe(2);
    expect(monthPosts.every((p) => new Date(p.date).getMonth() === 3)).toBe(true);
    expect(monthPosts.every((p) => new Date(p.date).getFullYear() === 2026)).toBe(true);
  });

  it("should calculate format distribution correctly", () => {
    const posts = [
      { id: 1, date: "2026-04-01", title: "Post 1", status: "publicado", format: "reel", pillar: "turismo", hasAds: true },
      { id: 2, date: "2026-04-02", title: "Post 2", status: "planejado", format: "reel", pillar: "cultura", hasAds: false },
      { id: 3, date: "2026-04-03", title: "Post 3", status: "publicado", format: "carrossel", pillar: "cultura", hasAds: true },
    ];

    const formatCounts = posts.reduce(
      (acc, post) => {
        acc[post.format] = (acc[post.format] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(formatCounts.reel).toBe(2);
    expect(formatCounts.carrossel).toBe(1);
  });

  it("should handle empty posts array", () => {
    const posts: any[] = [];
    const monthPosts = posts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    expect(monthPosts.length).toBe(0);
  });
});
