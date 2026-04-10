import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Loader2 } from "lucide-react";
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

interface MonthlyReportExporterProps {
  posts: Post[];
  year: number;
  month: number;
  monthName: string;
}

export function MonthlyReportExporter({ posts, year, month, monthName }: MonthlyReportExporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "csv">("pdf");

  const monthPosts = posts.filter((post) => {
    const postDate = new Date(post.date);
    return postDate.getFullYear() === year && postDate.getMonth() === month - 1;
  });

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Título
      doc.setFontSize(20);
      doc.text(`Relatório de Posts - ${monthName} ${year}`, margin, 20);

      // Informações gerais
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, margin, 28);
      doc.text(`Total de Posts: ${monthPosts.length}`, margin, 34);

      // Estatísticas
      const statusCounts = monthPosts.reduce(
        (acc, post) => {
          acc[post.status] = (acc[post.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      let yPosition = 42;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Estatísticas por Status:", margin, yPosition);

      yPosition += 6;
      doc.setFontSize(9);
      Object.entries(statusCounts).forEach(([status, count]) => {
        const statusLabel = {
          planejado: "Planejado",
          em_producao: "Em Produção",
          aprovado: "Aprovado",
          publicado: "Publicado",
        }[status] || status;

        doc.text(`• ${statusLabel}: ${count}`, margin + 5, yPosition);
        yPosition += 5;
      });

      // Tabela de posts
      const tableData = monthPosts.map((post) => [
        format(new Date(post.date), "dd/MM", { locale: ptBR }),
        post.title.substring(0, 30) + (post.title.length > 30 ? "..." : ""),
        {
          planejado: "Planejado",
          em_producao: "Em Produção",
          aprovado: "Aprovado",
          publicado: "Publicado",
        }[post.status] || post.status,
        post.format,
        post.pillar.charAt(0).toUpperCase() + post.pillar.slice(1),
        post.hasAds ? "Sim" : "Não",
      ]);

      (doc as any).autoTable({
        head: [["Data", "Título", "Status", "Formato", "Pilar", "Anúncios"]],
        body: tableData,
        startY: yPosition + 8,
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
          1: { cellWidth: 60 },
          2: { cellWidth: 28 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 18 },
        },
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 250;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página 1 de 1 | Brasília Cidade Parque - Pré campanha Eduardo Brandão`,
        margin,
        pageHeight - 10
      );

      // Salvar PDF
      doc.save(`Relatorio_Posts_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
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
        {
          planejado: "Planejado",
          em_producao: "Em Produção",
          aprovado: "Aprovado",
          publicado: "Publicado",
        }[post.status] || post.status,
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
    } catch (error) {
      console.error("Erro ao gerar CSV:", error);
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
        <Download size={16} />
        Exportar Relatório
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
                disabled={isGenerating}
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
