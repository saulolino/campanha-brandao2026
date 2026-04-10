import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, BarChart3, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

interface ExecutiveReportExporterProps {
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
};

const formatLabels: Record<string, string> = {
  carrossel: "Carrossel",
  reel: "Reel",
  post: "Post",
  stories: "Stories",
};

export function ExecutiveReportExporter({
  posts,
  year,
  month,
  monthName,
}: ExecutiveReportExporterProps) {
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

  const postsWithAds = monthPosts.filter((p) => p.hasAds).length;
  const adsPercentage = ((postsWithAds / monthPosts.length) * 100).toFixed(1);
  
  // Find top pillar
  const topPillar = Object.entries(pillarCounts).sort(([, a], [, b]) => b - a)[0];
  const topPillarLabel = topPillar ? pillarLabels[topPillar[0]] || topPillar[0] : "N/A";
  const topPillarPercentage = topPillar ? ((topPillar[1] / monthPosts.length) * 100).toFixed(1) : "0";

  const generateExecutivePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // ============ PÁGINA 1: HEADER + KPIs + INSIGHTS ============

      // Header
      doc.setFillColor(245, 247, 250); // Light blue background
      doc.rect(0, 0, pageWidth, 50, "F");

      doc.setFontSize(28);
      doc.setTextColor(20, 30, 60); // Dark blue
      doc.setFont("helvetica", "bold");
      doc.text(`Relatório de Posts`, margin, 20);

      doc.setFontSize(14);
      doc.setTextColor(100, 120, 150); // Medium blue
      doc.setFont("helvetica", "normal");
      doc.text(`${monthName} ${year}`, margin, 28);

      doc.setFontSize(10);
      doc.setTextColor(150, 160, 180); // Light blue
      doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, margin, 36);

      yPosition = 60;

      // KPI Cards Section
      doc.setFontSize(12);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Indicadores Principais", margin, yPosition);

      yPosition += 15;

      // Card 1: Total Posts
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 240, 250);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, (pageWidth - margin * 2) / 3 - 3, 30, "FD");

      doc.setFontSize(24);
      doc.setTextColor(41, 128, 185); // Blue
      doc.setFont("helvetica", "bold");
      doc.text(monthPosts.length.toString(), margin + 8, yPosition + 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Total de Posts", margin + 8, yPosition + 26);

      // Card 2: Com Anúncios
      const card2X = margin + (pageWidth - margin * 2) / 3 + 3;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 240, 250);
      doc.rect(card2X, yPosition, (pageWidth - margin * 2) / 3 - 3, 30, "FD");

      doc.setFontSize(24);
      doc.setTextColor(46, 204, 113); // Green
      doc.setFont("helvetica", "bold");
      doc.text(`${adsPercentage}%`, card2X + 8, yPosition + 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Com Anúncios", card2X + 8, yPosition + 26);

      // Card 3: Pilar Principal
      const card3X = card2X + (pageWidth - margin * 2) / 3 + 3;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 240, 250);
      doc.rect(card3X, yPosition, (pageWidth - margin * 2) / 3 - 3, 30, "FD");

      doc.setFontSize(24);
      doc.setTextColor(155, 89, 182); // Purple
      doc.setFont("helvetica", "bold");
      doc.text(`${topPillarPercentage}%`, card3X + 8, yPosition + 18);

      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "normal");
      doc.text(topPillarLabel, card3X + 8, yPosition + 26);

      yPosition += 50;

      // Insights Section
      doc.setFontSize(12);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Principais Insights", margin, yPosition);

      yPosition += 10;

      // Insight 1: Top Pillar
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      const insight1 = `Foco principal em ${topPillarLabel.toLowerCase()} com ${topPillarPercentage}% do conteúdo`;
      doc.text(insight1, margin + 5, yPosition, { maxWidth: pageWidth - margin * 2 - 10 });

      yPosition += 8;

      // Insight 2: Ads Usage
      const adsInsight = postsWithAds === 0 ? "Nenhum post com anúncios" : `${postsWithAds} posts com anúncios (${adsPercentage}%)`;
      doc.text(`• ${adsInsight}`, margin + 5, yPosition, { maxWidth: pageWidth - margin * 2 - 10 });

      yPosition += 8;

      // Insight 3: Top Format
      const topFormat = Object.entries(formatCounts).sort(([, a], [, b]) => b - a)[0];
      const topFormatLabel = topFormat ? formatLabels[topFormat[0]] || topFormat[0] : "N/A";
      const topFormatPercentage = topFormat ? ((topFormat[1] / monthPosts.length) * 100).toFixed(1) : "0";
      doc.text(`• Formato predominante: ${topFormatLabel} (${topFormatPercentage}%)`, margin + 5, yPosition, { maxWidth: pageWidth - margin * 2 - 10 });

      yPosition += 8;

      // Insight 4: Status Distribution
      const publishedCount = statusCounts["publicado"] || 0;
      const publishedPercentage = ((publishedCount / monthPosts.length) * 100).toFixed(1);
      doc.text(`• ${publishedCount} posts publicados (${publishedPercentage}%)`, margin + 5, yPosition, { maxWidth: pageWidth - margin * 2 - 10 });

      yPosition += 15;

      // Distribution Section
      doc.setFontSize(12);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição de Conteúdo", margin, yPosition);

      yPosition += 10;

      // Status Distribution
      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "bold");
      doc.text("Por Status:", margin, yPosition);

      yPosition += 6;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      Object.entries(statusCounts).forEach(([status, count]) => {
        const label = statusLabels[status] || status;
        const percentage = ((count / monthPosts.length) * 100).toFixed(1);
        doc.text(`  • ${label}: ${count} posts (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // Format Distribution
      doc.setFontSize(10);
      doc.setTextColor(100, 120, 150);
      doc.setFont("helvetica", "bold");
      doc.text("Por Formato:", margin, yPosition);

      yPosition += 6;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      Object.entries(formatCounts).forEach(([format, count]) => {
        const label = formatLabels[format] || format;
        const percentage = ((count / monthPosts.length) * 100).toFixed(1);
        doc.text(`  • ${label}: ${count} posts (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
      });

      // ============ PÁGINA 2: TABELA DE POSTS ============
      doc.addPage();
      yPosition = margin;

      doc.setFontSize(16);
      doc.setTextColor(20, 30, 60);
      doc.setFont("helvetica", "bold");
      doc.text("Lista Detalhada de Posts", margin, yPosition);

      yPosition += 12;

      if (monthPosts.length > 0) {
        const tableData = monthPosts.map((post) => [
          format(new Date(post.date), "dd/MM", { locale: ptBR }),
          post.title.substring(0, 30) + (post.title.length > 30 ? "..." : ""),
          statusLabels[post.status] || post.status,
          formatLabels[post.format] || post.format,
          pillarLabels[post.pillar] || post.pillar,
          post.hasAds ? "Sim" : "Não",
        ]);

        autoTable(doc, {
          head: [["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"]],
          body: tableData,
          startY: yPosition,
          margin: margin,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10,
            halign: "left",
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50],
            halign: "left",
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 70 },
            2: { cellWidth: 28 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 18 },
          },
          didDrawPage: (data) => {
            // Footer
            const pageCount = (doc as any).internal.pages.length - 1;
            const currentPage = data.pageNumber;
            doc.setFontSize(8);
            doc.setTextColor(150, 160, 180);
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.text(
              `Página ${currentPage} de ${pageCount} | Brasília Cidade Parque - Pré campanha Eduardo Brandão`,
              margin,
              pageHeight - 10
            );
          },
        });
      }

      // Save PDF
      doc.save(`Relatorio_Executivo_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF executivo:", error);
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
        <TrendingUp size={16} />
        Relatório Executivo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Gerar Relatório Executivo
            </DialogTitle>
            <DialogDescription>
              Relatório moderno e visual para {monthName} {year}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">📊 Relatório Premium</p>
              <p className="text-sm text-blue-800 mt-2">
                Documento executivo com design moderno, KPIs destacados, insights estratégicos e tabela detalhada de posts.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Conteúdo do Relatório:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Header com período e data de geração</li>
                <li>✓ 3 KPIs principais em cards visuais</li>
                <li>✓ Insights estratégicos sobre conteúdo</li>
                <li>✓ Distribuição por status e formato</li>
                <li>✓ Tabela detalhada de todos os posts</li>
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
                onClick={generateExecutivePDF}
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
