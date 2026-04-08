import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
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

interface MonthlyReportExporterWithChartsProps {
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

export function MonthlyReportExporterWithCharts({
  posts,
  year,
  month,
  monthName,
}: MonthlyReportExporterWithChartsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "csv">("pdf");

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

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const margin = 15;
      let yPosition = 20;

      // Página 1: Capa e Estatísticas
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(`Relatório de Posts - ${monthName} ${year}`, margin, yPosition);

      yPosition += 12;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, margin, yPosition);

      yPosition += 6;
      doc.text(`Total de Posts: ${monthPosts.length}`, margin, yPosition);

      // Estatísticas por Status
      yPosition += 12;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Estatísticas por Status:", margin, yPosition);

      yPosition += 7;
      doc.setFontSize(9);
      Object.entries(statusCounts).forEach(([status, count]) => {
        const label = statusLabels[status] || status;
        const percentage = ((count / monthPosts.length) * 100).toFixed(1);
        doc.text(`• ${label}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
      });

      // Estatísticas por Pilar
      yPosition += 3;
      doc.setFontSize(11);
      doc.text("Distribuição por Pilar:", margin, yPosition);

      yPosition += 7;
      doc.setFontSize(9);
      Object.entries(pillarCounts).forEach(([pillar, count]) => {
        const label = pillar.charAt(0).toUpperCase() + pillar.slice(1);
        const percentage = ((count / monthPosts.length) * 100).toFixed(1);
        doc.text(`• ${label}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
      });

      // Estatísticas por Formato
      yPosition += 3;
      doc.setFontSize(11);
      doc.text("Distribuição por Formato:", margin, yPosition);

      yPosition += 7;
      doc.setFontSize(9);
      Object.entries(formatCounts).forEach(([format, count]) => {
        const percentage = ((count / monthPosts.length) * 100).toFixed(1);
        doc.text(`• ${format}: ${count} (${percentage}%)`, margin + 5, yPosition);
        yPosition += 5;
      });

      // Posts com Anúncios
      const postsWithAds = monthPosts.filter((p) => p.hasAds).length;
      yPosition += 3;
      doc.setFontSize(11);
      doc.text("Posts com Anúncios:", margin, yPosition);
      yPosition += 6;
      doc.setFontSize(9);
      doc.text(
        `${postsWithAds} de ${monthPosts.length} posts (${((postsWithAds / monthPosts.length) * 100).toFixed(1)}%)`,
        margin + 5,
        yPosition
      );

      // Página 2: Tabela de Posts
      if (monthPosts.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Lista de Posts", margin, 20);

        const tableData = monthPosts.map((post) => [
          format(new Date(post.date), "dd/MM", { locale: ptBR }),
          post.title.substring(0, 25) + (post.title.length > 25 ? "..." : ""),
          statusLabels[post.status] || post.status,
          post.format,
          post.pillar.charAt(0).toUpperCase() + post.pillar.slice(1),
          post.hasAds ? "Sim" : "Não",
        ]);

        (doc as any).autoTable({
          head: [["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"]],
          body: tableData,
          startY: 30,
          margin: margin,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50],
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 55 },
            2: { cellWidth: 28 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 18 },
          },
        });
      }

      // Salvar PDF
      doc.save(`Relatorio_Posts_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
    }
  };

  const generateCSV = () => {
    setIsGenerating(true);
    try {
      const headers = ["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"];
      const rows = monthPosts.map((post) => [
        format(new Date(post.date), "dd/MM/yyyy", { locale: ptBR }),
        `"${post.title}"`,
        statusLabels[post.status] || post.status,
        post.format,
        post.pillar,
        post.hasAds ? "Sim" : "Não",
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `Relatorio_Posts_${monthName}_${year}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
      alert("Erro ao gerar CSV. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
    }
  };

  const handleExport = () => {
    if (selectedFormat === "pdf") {
      generatePDF();
    } else {
      generateCSV();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={monthPosts.length === 0}
      >
        <BarChart3 size={16} />
        Relatório
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} />
              Exportar Relatório - {monthName} {year}
            </DialogTitle>
            <DialogDescription>
              Total de posts: {monthPosts.length}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato de Exportação</label>
              <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Relatório Formatado</SelectItem>
                  <SelectItem value="csv">CSV - Planilha de Dados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                {selectedFormat === "pdf"
                  ? "Será gerado um relatório em PDF com estatísticas e tabela de posts."
                  : "Será gerado um arquivo CSV compatível com Excel e Google Sheets."}
              </p>
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
                onClick={handleExport}
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
                    Exportar {selectedFormat.toUpperCase()}
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
