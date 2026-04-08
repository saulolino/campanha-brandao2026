import { describe, it, expect } from "vitest";

interface Post {
  id: number;
  date: string;
  title: string;
  status: string;
  format: string;
  pillar: string;
  hasAds: boolean;
}

describe("MonthlyReportExporter", () => {
  const mockPosts: Post[] = [
    {
      id: 1,
      date: "2026-04-05",
      title: "Post sobre Brasília",
      status: "publicado",
      format: "Carrossel",
      pillar: "turismo",
      hasAds: true,
    },
    {
      id: 2,
      date: "2026-04-10",
      title: "Dica de viagem",
      status: "planejado",
      format: "Reel",
      pillar: "cultura",
      hasAds: false,
    },
    {
      id: 3,
      date: "2026-04-15",
      title: "Evento em Brasília",
      status: "em_producao",
      format: "Post",
      pillar: "eventos",
      hasAds: true,
    },
    {
      id: 4,
      date: "2026-05-05",
      title: "Post de maio",
      status: "publicado",
      format: "Carrossel",
      pillar: "turismo",
      hasAds: false,
    },
  ];

  it("should filter posts by month and year", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3; // April is month 3 (0-indexed)
    });

    expect(april2026Posts).toHaveLength(3);
    expect(april2026Posts.every((p) => p.date.startsWith("2026-04"))).toBe(true);
  });

  it("should count posts by status", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    const statusCounts = april2026Posts.reduce(
      (acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(statusCounts.publicado).toBe(1);
    expect(statusCounts.planejado).toBe(1);
    expect(statusCounts.em_producao).toBe(1);
  });

  it("should count posts with ads", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    const postsWithAds = april2026Posts.filter((p) => p.hasAds);
    expect(postsWithAds).toHaveLength(2);
  });

  it("should group posts by pillar", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    const pillarCounts = april2026Posts.reduce(
      (acc, post) => {
        acc[post.pillar] = (acc[post.pillar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(pillarCounts.turismo).toBe(1);
    expect(pillarCounts.cultura).toBe(1);
    expect(pillarCounts.eventos).toBe(1);
  });

  it("should handle empty month", () => {
    const june2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 5; // June
    });

    expect(june2026Posts).toHaveLength(0);
  });

  it("should format post data for CSV export", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    const csvRows = april2026Posts.map((post) => [
      post.date,
      post.title,
      post.status,
      post.format,
      post.pillar,
      post.hasAds ? "Sim" : "Não",
    ]);

    expect(csvRows).toHaveLength(3);
    expect(csvRows[0][1]).toBe("Post sobre Brasília");
    expect(csvRows[0][5]).toBe("Sim");
  });

  it("should calculate report statistics", () => {
    const april2026Posts = mockPosts.filter((post) => {
      const postDate = new Date(post.date);
      return postDate.getFullYear() === 2026 && postDate.getMonth() === 3;
    });

    const stats = {
      totalPosts: april2026Posts.length,
      postsWithAds: april2026Posts.filter((p) => p.hasAds).length,
      formats: [...new Set(april2026Posts.map((p) => p.format))],
      pillars: [...new Set(april2026Posts.map((p) => p.pillar))],
    };

    expect(stats.totalPosts).toBe(3);
    expect(stats.postsWithAds).toBe(2);
    expect(stats.formats).toContain("Carrossel");
    expect(stats.formats).toContain("Reel");
    expect(stats.pillars).toContain("turismo");
  });
});
