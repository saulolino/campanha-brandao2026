import { useState, useMemo } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  FileText, Download, Calendar, ChevronLeft, ChevronRight,
  Clock, Edit3, Eye, Loader2, CheckCircle2, AlertCircle, BarChart2, Instagram
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeekLabel(year: number, week: number): string {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `Semana ${week} · ${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

const STATUS_LABEL: Record<string, string> = {
  draft:"Rascunho", design:"Design", caption:"Legenda",
  review:"Revisão", scheduled:"Agendado", published:"Publicado", failed:"Falhou",
};

const STATUS_COLOR: Record<string, string> = {
  draft:"bg-zinc-500/20 text-zinc-300",
  design:"bg-blue-500/20 text-blue-300",
  caption:"bg-purple-500/20 text-purple-300",
  review:"bg-yellow-500/20 text-yellow-300",
  scheduled:"bg-cyan-500/20 text-cyan-300",
  published:"bg-green-500/20 text-green-300",
  failed:"bg-red-500/20 text-red-300",
};

const TYPE_LABEL: Record<string, string> = {
  reels:"Reels", carrossel:"Carrossel", video:"Vídeo", story:"Story", imagem:"Imagem",
};

const DAY_NAMES = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

// ─── PDF Generator ────────────────────────────────────────────────────────────

function generatePDF(posts: any[], title: string, period: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const GREEN: [number,number,number] = [45,106,79];
  const DARK: [number,number,number] = [15,23,42];

  // Cabeçalho verde
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(20);
  doc.setFont("helvetica","bold");
  doc.text("Brasilia Cidade Parque", 14, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica","normal");
  doc.text("Pré campanha Eduardo Brandao  @eduardobrandaopv", 14, 22);
  doc.setFontSize(14);
  doc.setFont("helvetica","bold");
  doc.text(title, 14, 32);

  // Período
  doc.setFillColor(240,253,244);
  doc.roundedRect(14, 42, 182, 10, 2, 2, "F");
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica","normal");
  doc.text("Periodo: " + period, 18, 49);
  doc.text("Gerado em: " + new Date().toLocaleString("pt-BR"), 140, 49);

  // Estatísticas resumo
  const byStatus = posts.reduce((acc: Record<string,number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const stats = [
    { label:"Total de Posts", value: String(posts.length) },
    { label:"Publicados", value: String(byStatus.published || 0) },
    { label:"Agendados", value: String(byStatus.scheduled || 0) },
    { label:"Em Producao", value: String((byStatus.design||0)+(byStatus.caption||0)+(byStatus.review||0)) },
  ];
  let sx = 14;
  stats.forEach(s => {
    doc.setFillColor(...GREEN);
    doc.roundedRect(sx, 56, 42, 18, 2, 2, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(16);
    doc.setFont("helvetica","bold");
    doc.text(s.value, sx+21, 67, { align:"center" });
    doc.setFontSize(7);
    doc.setFont("helvetica","normal");
    doc.text(s.label, sx+21, 71, { align:"center" });
    sx += 46;
  });

  // Tabela principal
  const rows = posts.map(p => {
    const d = new Date(p.scheduledDate);
    const dateStr = d.toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"2-digit" });
    return [
      dateStr,
      p.scheduledTime || "12:00",
      TYPE_LABEL[p.type] || p.type,
      p.title,
      p.objective || "—",
      STATUS_LABEL[p.status] || p.status,
    ];
  });

  autoTable(doc, {
    startY: 78,
    head: [["Data","Hora","Tipo","Titulo","Objetivo","Status"]],
    body: rows,
    styles: { fontSize:8, cellPadding:3, textColor:DARK },
    headStyles: { fillColor:GREEN, textColor:[255,255,255], fontStyle:"bold", fontSize:8 },
    alternateRowStyles: { fillColor:[240,253,244] },
    columnStyles: {
      0:{cellWidth:24}, 1:{cellWidth:14}, 2:{cellWidth:22},
      3:{cellWidth:60}, 4:{cellWidth:46}, 5:{cellWidth:22}
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 5) {
        const status = posts[data.row.index]?.status;
        if (status === "published") data.cell.styles.textColor = [22,163,74];
        else if (status === "scheduled") data.cell.styles.textColor = [6,182,212];
        else if (status === "failed") data.cell.styles.textColor = [220,38,38];
        else if (status === "design") data.cell.styles.textColor = [59,130,246];
        else if (status === "review") data.cell.styles.textColor = [234,179,8];
      }
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...GREEN);
    doc.rect(0, 285, 210, 12, "F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(7);
    doc.text("Pré campanha Eduardo Brandao  Brasilia Cidade Parque  Documento Confidencial", 14, 292);
    doc.text("Pagina " + i + " de " + pageCount, 196, 292, { align:"right" });
  }

  const safeName = title.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_]/g,"");
  doc.save(safeName + ".pdf");
}

// ─── PostsTable ───────────────────────────────────────────────────────────────

function PostsTable({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <Calendar className="w-10 h-10 opacity-30" />
        <p className="text-sm">Nenhum post encontrado para este período.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            {["Data","Hora","Tipo","Título","Objetivo","Status"].map(h => (
              <th key={h} className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post, i) => {
            const d = new Date(post.scheduledDate);
            return (
              <tr key={post.id} className={`border-b border-border/20 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}>
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">{d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</span>
                    <span className="text-xs text-muted-foreground">{DAY_NAMES[d.getDay()]}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{post.scheduledTime || "12:00"}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Badge variant="outline" className="text-xs">{TYPE_LABEL[post.type] || post.type}</Badge>
                </td>
                <td className="py-3 px-3">
                  <p className="font-medium line-clamp-2 max-w-[200px]">{post.title}</p>
                </td>
                <td className="py-3 px-3">
                  <p className="text-muted-foreground text-xs line-clamp-2 max-w-[180px]">{post.objective || "—"}</p>
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[post.status] || "bg-zinc-500/20 text-zinc-300"}`}>
                    {post.status === "published" && <CheckCircle2 className="w-3 h-3" />}
                    {post.status === "failed" && <AlertCircle className="w-3 h-3" />}
                    {post.status === "design" && <Edit3 className="w-3 h-3" />}
                    {post.status === "review" && <Eye className="w-3 h-3" />}
                    {STATUS_LABEL[post.status] || post.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── StatsPanel ───────────────────────────────────────────────────────────────

function StatsPanel({ posts }: { posts: any[] }) {
  const byStatus = posts.reduce((acc: Record<string,number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const cards = [
    { label:"Total", value:posts.length, color:"text-[#2d6a4f]", icon:Calendar },
    { label:"Publicados", value:byStatus.published||0, color:"text-green-400", icon:CheckCircle2 },
    { label:"Agendados", value:byStatus.scheduled||0, color:"text-cyan-400", icon:Clock },
    { label:"Em Produção", value:(byStatus.design||0)+(byStatus.caption||0)+(byStatus.review||0), color:"text-blue-400", icon:Edit3 },
    { label:"Rascunhos", value:byStatus.draft||0, color:"text-zinc-400", icon:FileText },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-card border border-border/40 rounded-lg p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <span className="text-2xl font-bold">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── WeeklyReport ─────────────────────────────────────────────────────────────

function WeeklyReport() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [week, setWeek] = useState(getISOWeek(today));
  const { data, isLoading } = trpc.posts.getByWeek.useQuery({ year, week });
  const posts = (data as any)?.posts ?? [];

  const handlePrev = () => {
    if (week === 1) { setYear(y => y - 1); setWeek(52); }
    else setWeek(w => w - 1);
  };
  const handleNext = () => {
    if (week === 53) { setYear(y => y + 1); setWeek(1); }
    else setWeek(w => w + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[220px]">
            <p className="font-semibold">{getWeekLabel(year, week)}</p>
            <p className="text-xs text-muted-foreground">{year}</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2 text-xs"
            onClick={() => { setYear(today.getFullYear()); setWeek(getISOWeek(today)); }}>
            Semana Atual
          </Button>
        </div>
        <Button
          onClick={() => generatePDF(posts, `Agenda Semanal — ${getWeekLabel(year, week)}`, getWeekLabel(year, week))}
          disabled={isLoading || posts.length === 0}
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar PDF Semanal
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando agenda...</span>
        </div>
      ) : (
        <>
          <StatsPanel posts={posts} />
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#2d6a4f]" />
                Agenda da Semana — {posts.length} {posts.length === 1 ? "post" : "posts"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PostsTable posts={posts} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── MonthlyReport ────────────────────────────────────────────────────────────

function MonthlyReport() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const { data, isLoading } = trpc.posts.getByMonth.useQuery({ year, month });
  const posts = (data as any)?.posts ?? [];

  const handlePrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const handleNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const postsByWeek = useMemo(() => {
    const groups: Record<number, any[]> = {};
    posts.forEach((p: any) => {
      const w = getISOWeek(new Date(p.scheduledDate));
      if (!groups[w]) groups[w] = [];
      groups[w].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
  }, [posts]);

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[180px]">
            <p className="font-semibold text-lg">{MONTH_NAMES[month - 1]}</p>
            <p className="text-xs text-muted-foreground">{year}</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-2 text-xs"
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); }}>
            Mês Atual
          </Button>
        </div>
        <Button
          onClick={() => generatePDF(posts, `Agenda Mensal — ${monthLabel}`, monthLabel)}
          disabled={isLoading || posts.length === 0}
          className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar PDF Mensal
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando agenda...</span>
        </div>
      ) : postsByWeek.length > 0 ? (
        <>
          <StatsPanel posts={posts} />
          <div className="space-y-4">
            {postsByWeek.map(([weekNum, weekPosts]) => (
              <Card key={weekNum} className="border-border/40">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2d6a4f]" />
                      {getWeekLabel(year, Number(weekNum))}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {weekPosts.length} {weekPosts.length === 1 ? "post" : "posts"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <PostsTable posts={weekPosts} />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Calendar className="w-10 h-10 opacity-30" />
          <p className="text-sm">Nenhum post encontrado para {monthLabel}.</p>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Relatorios() {
  const { animationClass } = usePageTransition();
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav activeSection="relatorios" />
      <main className={`flex-1 p-6 overflow-y-auto ${animationClass}`}>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#2d6a4f]/20">
              <FileText className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Relatórios</h1>
              <p className="text-sm text-muted-foreground">
                Agenda de postagens semanal e mensal — Pré campanha Eduardo Brandão
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="semanal" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/40">
            <TabsTrigger value="semanal" className="gap-2 data-[state=active]:bg-[#2d6a4f] data-[state=active]:text-white">
              <Calendar className="w-4 h-4" />
              Agenda Semanal
            </TabsTrigger>
            <TabsTrigger value="mensal" className="gap-2 data-[state=active]:bg-[#2d6a4f] data-[state=active]:text-white">
              <BarChart2 className="w-4 h-4" />
              Agenda Mensal
            </TabsTrigger>
          </TabsList>
          <TabsContent value="semanal">
            <WeeklyReport />
          </TabsContent>
          <TabsContent value="mensal">
            <MonthlyReport />
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
