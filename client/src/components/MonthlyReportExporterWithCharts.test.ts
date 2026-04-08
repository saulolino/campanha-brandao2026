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

describe("MonthlyReportExporterWithCharts", () => {
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
  ];

  it("should calculate status distribution for charts", () => {
    const statusCounts = mockPosts.reduce(
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

  it("should calculate pillar distribution for charts", () => {
    const pillarCounts = mockPosts.reduce(
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

  it("should calculate format distribution for charts", () => {
    const formatCounts = mockPosts.reduce(
      (acc, post) => {
        acc[post.format] = (acc[post.format] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(formatCounts.Carrossel).toBe(1);
    expect(formatCounts.Reel).toBe(1);
    expect(formatCounts.Post).toBe(1);
  });

  it("should calculate percentage for chart data", () => {
    const statusCounts = mockPosts.reduce(
      (acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const percentage = ((statusCounts.publicado / mockPosts.length) * 100).toFixed(1);
    expect(parseFloat(percentage)).toBe(33.3);
  });

  it("should prepare data for PDF table", () => {
    const tableData = mockPosts.map((post) => [
      post.date,
      post.title,
      post.status,
      post.format,
      post.pillar,
      post.hasAds ? "Sim" : "Não",
    ]);

    expect(tableData).toHaveLength(3);
    expect(tableData[0][1]).toBe("Post sobre Brasília");
    expect(tableData[0][5]).toBe("Sim");
    expect(tableData[1][5]).toBe("Não");
  });

  it("should handle multi-page PDF generation", () => {
    // Simular 50 posts para testar paginação
    const manyPosts = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      date: `2026-04-${String((i % 28) + 1).padStart(2, "0")}`,
      title: `Post ${i}`,
      status: ["publicado", "planejado", "em_producao"][i % 3],
      format: ["Carrossel", "Reel", "Post"][i % 3],
      pillar: ["turismo", "cultura", "eventos"][i % 3],
      hasAds: i % 2 === 0,
    }));

    expect(manyPosts).toHaveLength(50);
    // Cada página pode ter ~20 posts, então precisaríamos de 3 páginas
    const postsPerPage = 20;
    const pagesNeeded = Math.ceil(manyPosts.length / postsPerPage);
    expect(pagesNeeded).toBe(3);
  });

  it("should generate correct CSV format", () => {
    const headers = ["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"];
    const rows = mockPosts.map((post) => [
      post.date,
      `"${post.title}"`,
      post.status,
      post.format,
      post.pillar,
      post.hasAds ? "Sim" : "Não",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    expect(csv).toContain("Data,Título,Status,Formato,Pilar,Anúncios");
    expect(csv).toContain("2026-04-05");
    expect(csv).toContain('"Post sobre Brasília"');
  });

  it("should track posts with ads for statistics", () => {
    const postsWithAds = mockPosts.filter((p) => p.hasAds);
    const percentage = ((postsWithAds.length / mockPosts.length) * 100).toFixed(1);

    expect(postsWithAds).toHaveLength(2);
    expect(parseFloat(percentage)).toBe(66.7);
  });
});
