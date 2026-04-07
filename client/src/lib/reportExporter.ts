import { Post } from "@/hooks/usePublicationPosts";

/**
 * Exportar posts para CSV
 */
export function exportPostsToCSV(posts: Post[], filename: string = "posts.csv"): void {
  const headers = [
    "ID",
    "Título",
    "Status",
    "Criado por",
    "Data de Criação",
    "Última Atualização",
    "Data Agendada",
    "Legenda",
    "Histórico de Transições",
  ];

  const rows = posts.map((post) => [
    post.id,
    `"${post.title.replace(/"/g, '""')}"`, // Escapar aspas
    post.status,
    post.createdBy,
    new Date(post.createdAt).toLocaleString("pt-BR"),
    new Date(post.updatedAt).toLocaleString("pt-BR"),
    new Date(post.scheduledDate).toLocaleString("pt-BR"),
    `"${(post.caption || "").replace(/"/g, '""')}"`,
    `"${formatHistoryForCSV(post.history)}"`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
}

/**
 * Exportar posts para PDF
 */
export async function exportPostsToPDF(posts: Post[], filename: string = "posts.pdf"): Promise<void> {
  try {
    // Dinâmicamente importar jsPDF para evitar aumentar o bundle
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Posts", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Data do relatório
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10, yPosition);
    yPosition += 5;

    // Resumo
    doc.setFontSize(11);
    doc.text(`Total de Posts: ${posts.length}`, 10, yPosition);
    yPosition += 5;

    const statusCounts = posts.reduce(
      (acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`  • ${status}: ${count}`, 15, yPosition);
      yPosition += 4;
    });

    yPosition += 5;

    // Tabela de posts
    const tableData = posts.map((post) => [
      post.id.toString(),
      post.title.substring(0, 30),
      post.status,
      post.createdBy.substring(0, 20),
      new Date(post.createdAt).toLocaleDateString("pt-BR"),
      post.history.length.toString(),
    ]);

    autoTable(doc, {
      head: [["ID", "Título", "Status", "Criado por", "Data", "Transições"]],
      body: tableData,
      startY: yPosition,
      margin: 10,
      theme: "grid",
      headStyles: {
        fillColor: [34, 139, 34], // Verde
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
    });

    // Adicionar página com histórico detalhado se houver espaço
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 100;
    if (finalY > pageHeight - 30) {
      doc.addPage();
      yPosition = 10;
    } else {
      yPosition = finalY + 10;
    }

    // Histórico detalhado
    doc.setFontSize(12);
    doc.text("Histórico de Transições", 10, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    posts.forEach((post) => {
      if (post.history.length > 0) {
        doc.text(`Post #${post.id} - ${post.title}:`, 10, yPosition);
        yPosition += 4;

        post.history.forEach((transition) => {
          const date = new Date(transition.timestamp).toLocaleString("pt-BR");
          const text = `  • ${transition.fromStatus} → ${transition.toStatus} por ${transition.movedBy} em ${date}`;
          doc.text(text, 15, yPosition);
          yPosition += 4;

          if (yPosition > pageHeight - 10) {
            doc.addPage();
            yPosition = 10;
          }
        });

        yPosition += 2;
      }
    });

    doc.save(filename);
  } catch (error) {
    console.error("[reportExporter] Erro ao gerar PDF:", error);
    throw new Error("Erro ao gerar PDF. Certifique-se de que jsPDF está instalado.");
  }
}

/**
 * Formatar histórico para CSV
 */
function formatHistoryForCSV(history: Post["history"]): string {
  return history
    .map(
      (h) =>
        `${h.fromStatus}→${h.toStatus} por ${h.movedBy} em ${new Date(h.timestamp).toLocaleString("pt-BR")}`
    )
    .join(" | ");
}

/**
 * Download de arquivo
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gerar relatório de performance
 */
export function generatePerformanceReport(posts: Post[]): {
  totalPosts: number;
  byStatus: Record<string, number>;
  averageTimeInReview: number;
  mostActiveCreator: string;
} {
  const byStatus = posts.reduce(
    (acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calcular tempo médio em revisão
  const reviewTimes = posts
    .filter((post) => post.history.length > 0)
    .map((post) => {
      const reviewStart = post.history.find((h) => h.toStatus === "review");
      const reviewEnd = post.history.find(
        (h, i) =>
          i > (post.history.findIndex((x) => x.toStatus === "review") || -1) &&
          h.toStatus !== "review"
      );

      if (reviewStart && reviewEnd) {
        return (
          new Date(reviewEnd.timestamp).getTime() -
          new Date(reviewStart.timestamp).getTime()
        );
      }
      return 0;
    })
    .filter((time) => time > 0);

  const averageTimeInReview =
    reviewTimes.length > 0
      ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length / (1000 * 60 * 60) // em horas
      : 0;

  // Encontrar criador mais ativo
  const creatorCounts = posts.reduce(
    (acc, post) => {
      acc[post.createdBy] = (acc[post.createdBy] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const mostActiveCreator = Object.entries(creatorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    totalPosts: posts.length,
    byStatus,
    averageTimeInReview: Math.round(averageTimeInReview * 100) / 100,
    mostActiveCreator,
  };
}
