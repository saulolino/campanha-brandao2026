import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
// Removido jspdf-autotable - usando tabela manual
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: number;
  date: string;
  title: string;
  status: string;
  format: string;
  pillar: string;
  hasAds: boolean;
}

interface ModernExecutiveReportProps {
  posts: Post[];
  year: number;
  month: number;
  monthName: string;
}

const statusLabels: Record<string, string> = {
  planejado: "Planejado",
  em_producao: "Em Produção",
  aprovado: "Aprovado",
  publicado: "Publicado",
};

const pillarLabels: Record<string, string> = {
  turismo: "Turismo",
  cultura: "Cultura",
  eventos: "Eventos",
  causa: "Causa",
  sustentabilidade: "Sustentabilidade",
  explicacao: "Explicação",
  humano: "Humano",
  mobilizacao: "Mobilização",
};

const formatLabels: Record<string, string> = {
  carrossel: "Carrossel",
  reel: "Reel",
  post: "Post",
  stories: "Stories",
  video: "Vídeo",
};

const statusColors: Record<string, [number, number, number]> = {
  planejado: [52, 152, 219], // Blue
  em_producao: [241, 196, 15], // Yellow
  aprovado: [155, 89, 182], // Purple
  publicado: [46, 204, 113], // Green
};

const pillarColors: Record<string, [number, number, number]> = {
  turismo: [52, 152, 219],
  cultura: [155, 89, 182],
  eventos: [231, 76, 60],
  causa: [46, 204, 113],
  sustentabilidade: [26, 188, 156],
  explicacao: [241, 196, 15],
  humano: [230, 126, 34],
  mobilizacao: [52, 73, 94],
};

const formatColors: Record<string, [number, number, number]> = {
  carrossel: [52, 152, 219],
  reel: [155, 89, 182],
  post: [46, 204, 113],
  stories: [231, 76, 60],
  video: [26, 188, 156],
};

export function ModernExecutiveReport({
  posts,
  year,
  month,
  monthName,
}: ModernExecutiveReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthPosts = posts.filter((post) => {
    const postDate = new Date(post.date);
    return postDate.getFullYear() === year && postDate.getMonth() === month - 1;
  });

  // Calculate statistics
  const statusCounts = monthPosts.reduce(
    (acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pillarCounts = monthPosts.reduce(
    (acc, post) => {
      acc[post.pillar] = (acc[post.pillar] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const formatCounts = monthPosts.reduce(
    (acc, post) => {
      acc[post.format] = (acc[post.format] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Guard contra divisão por zero
  if (monthPosts.length === 0) {
    return (
      <Button
        disabled
        variant="default"
        size="sm"
        className="gap-2 bg-gray-400"
      >
        <BarChart3 size={16} />
        Sem posts
      </Button>
    );
  }

  const postsWithAds = monthPosts.filter((p) => p.hasAds).length;
  const adsPercentage = ((postsWithAds / monthPosts.length) * 100).toFixed(1);
  
  // Find top pillar
  const topPillar = Object.entries(pillarCounts).sort(([, a], [, b]) => b - a)[0];
  const topPillarLabel = topPillar ? pillarLabels[topPillar[0]] || topPillar[0] : "N/A";
  const topPillarPercentage = topPillar && monthPosts.length > 0 ? ((topPillar[1] / monthPosts.length) * 100).toFixed(1) : "0";

  // Find top format
  const topFormat = Object.entries(formatCounts).sort(([, a], [, b]) => b - a)[0];
  const topFormatLabel = topFormat ? formatLabels[topFormat[0]] || topFormat[0] : "N/A";

  const generateModernPDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      let yPosition = margin;

      // ============ PÁGINA 1: HEADER + KPIs + INSIGHTS ============

      // HEADER Section
      doc.setFillColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(20, 30, 60);
      doc.text(`${monthPosts.length}`, margin, yPosition + 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("POSTS", margin, yPosition + 28);

      doc.setFontSize(16);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text(`Relatório de Posts – ${monthName} ${year}`, margin + 35, yPosition + 15);

      doc.setFontSize(10);
      doc.setTextColor(150, 160, 180);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
        margin + 35,
        yPosition + 22
      );

      yPosition += 40;

      // KPI CARDS Section
      const cardWidth = (pageWidth - margin * 2 - 6) / 3;
      const cardHeight = 28;

      // Card 1: Total Posts
      doc.setFillColor(245, 250, 255);
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, cardWidth, cardHeight, "FD");

      doc.setFontSize(20);
      doc.setTextColor(52, 152, 219);
      doc.setFont("helvetica", "bold");
      doc.text(monthPosts.length.toString(), margin + 6, yPosition + 16);

      doc.setFontSize(9);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Total de Posts", margin + 6, yPosition + 24);

      // Card 2: Planejados %
  const plannedCount = statusCounts["planejado"] || 0;
  const plannedPercentage = monthPosts.length > 0 ? ((plannedCount / monthPosts.length) * 100).toFixed(0) : "0";
      const card2X = margin + cardWidth + 3;

      doc.setFillColor(255, 250, 245);
      doc.setDrawColor(240, 220, 200);
      doc.rect(card2X, yPosition, cardWidth, cardHeight, "FD");

      doc.setFontSize(20);
      doc.setTextColor(241, 196, 15);
      doc.setFont("helvetica", "bold");
      doc.text(`${plannedPercentage}%`, card2X + 6, yPosition + 16);

      doc.setFontSize(9);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Planejados", card2X + 6, yPosition + 24);

      // Card 3: Com Anúncios %
      const card3X = card2X + cardWidth + 3;

      doc.setFillColor(250, 245, 255);
      doc.setDrawColor(220, 200, 240);
      doc.rect(card3X, yPosition, cardWidth, cardHeight, "FD");

      doc.setFontSize(20);
      doc.setTextColor(155, 89, 182);
      doc.setFont("helvetica", "bold");
      doc.text(`${adsPercentage}%`, card3X + 6, yPosition + 16);

      doc.setFontSize(9);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Com Anúncios", card3X + 6, yPosition + 24);

      yPosition += 38;

      // INSIGHTS Section
      doc.setFontSize(12);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Principais Insights", margin, yPosition);

      yPosition += 8;

      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");

      // Insight 1
      doc.text(`• Foco maior em ${topPillarLabel.toLowerCase()} (${topPillarPercentage}%)`, margin + 3, yPosition);
      yPosition += 6;

      // Insight 2
      const adsInsight = postsWithAds === 0 ? "Nenhum post com anúncios" : `${postsWithAds} posts com anúncios`;
      doc.text(`• ${adsInsight}`, margin + 3, yPosition);
      yPosition += 6;

      // Insight 3
      doc.text(`• Formato predominante: ${topFormatLabel}`, margin + 3, yPosition);
      yPosition += 6;

      // Insight 4
      const publishedCount = statusCounts["publicado"] || 0;
      doc.text(`• ${publishedCount} posts publicados`, margin + 3, yPosition);
      yPosition += 10;

      // DISTRIBUTION Section
      doc.setFontSize(12);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição de Conteúdo", margin, yPosition);

      yPosition += 8;

      // Pillar Distribution
      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "bold");
      doc.text("Por Pilar:", margin, yPosition);

      yPosition += 6;
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");

      Object.entries(pillarCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([pillar, count]) => {
          const label = pillarLabels[pillar] || pillar;
          const percentage = ((count / monthPosts.length) * 100).toFixed(1);
          doc.text(`  ${label}: ${count} (${percentage}%)`, margin + 3, yPosition);
          yPosition += 4;
        });

      yPosition += 4;

      // Format Distribution
      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "bold");
      doc.text("Por Formato:", margin, yPosition);

      yPosition += 6;
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");

      Object.entries(formatCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([format, count]) => {
          const label = formatLabels[format] || format;
          const percentage = ((count / monthPosts.length) * 100).toFixed(1);
          doc.text(`  ${label}: ${count} (${percentage}%)`, margin + 3, yPosition);
          yPosition += 4;
        });

      // ============ PÁGINA 2: TABELA DE POSTS ============
      doc.addPage();
      yPosition = margin;

      doc.setFontSize(14);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Lista de Posts", margin, yPosition);

      yPosition += 10;

      if (monthPosts.length > 0) {
        // Tabela manual com jsPDF
        const colWidths = [16, 65, 22, 22, 22, 15];
        const rowHeight = 6;
        const headerHeight = 8;
        let tableY = yPosition;

        // Header
        doc.setFillColor(52, 152, 219);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        const headers = ["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"];
        let headerX = margin;
        headers.forEach((header, i) => {
          doc.rect(headerX, tableY, colWidths[i], headerHeight, "F");
          doc.text(header, headerX + 1, tableY + 5);
          headerX += colWidths[i];
        });

        tableY += headerHeight;

        // Rows
        monthPosts.forEach((post, idx) => {
          const isAlternate = idx % 2 === 0;
          if (isAlternate) {
            doc.setFillColor(245, 247, 250);
            let rowX = margin;
            colWidths.forEach((width) => {
              doc.rect(rowX, tableY, width, rowHeight, "F");
              rowX += width;
            });
          }

          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);

          const rowData = [
            format(new Date(post.date), "dd/MM", { locale: ptBR }),
            post.title.substring(0, 30) + (post.title.length > 30 ? "..." : ""),
            statusLabels[post.status] || post.status,
            formatLabels[post.format] || post.format,
            pillarLabels[post.pillar] || post.pillar,
            post.hasAds ? "Sim" : "Não",
          ];

          let cellX = margin;
          rowData.forEach((text, i) => {
            doc.text(text, cellX + 1, tableY + 4);
            cellX += colWidths[i];
          });

          tableY += rowHeight;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 160, 180);
        doc.setFont("helvetica", "normal");
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.text(
          `Página 2 | Brasília Cidade Parque`,
          margin,
          pageHeight - 8
        );
      }

      // Save PDF
      doc.save(`Relatorio_Executivo_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF moderno:", error);
      alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="default"
        size="sm"
        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        disabled={monthPosts.length === 0}
      >
        <BarChart3 size={16} />
        Relatório Moderno
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Relatório Executivo Moderno
            </DialogTitle>
            <DialogDescription>
              Design premium com visual hierarchy e data storytelling
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">📊 Relatório Executivo</p>
              <p className="text-sm text-blue-800 mt-2">
                Documento com design moderno, KPIs destacados, insights impactantes e tabela visual.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Estrutura do Relatório:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Header com número grande de posts</li>
                <li>✓ 3 KPI cards com cores e ícones</li>
                <li>✓ Insights estratégicos impactantes</li>
                <li>✓ Distribuição por pilar e formato</li>
                <li>✓ Tabela detalhada com badges</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              <Button
                onClick={generateModernPDF}
                disabled={isGenerating || monthPosts.length === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Gerar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
