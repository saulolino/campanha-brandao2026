/**
 * Página de Relatório de Performance do Instagram
 * Gera relatório comparativo com análise de IA especialista sênior em redes sociais.
 * Inclui histórico de relatórios salvos.
 */
import { useState, useRef } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText, TrendingUp, TrendingDown, Minus, Users, Heart,
  MessageCircle, Share2, Bookmark, Star, AlertTriangle,
  ChevronRight, ExternalLink, Download, Loader2, RefreshCw,
  BarChart3, Brain, Calendar, Save, History, Trash2, Eye,
  Clock, Database,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Streamdown } from "streamdown";

// ─── Helpers ────────────────────────────────────────────────────────────────
function VariationBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">sem dados ant.</span>;
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400">
      <TrendingUp className="w-3 h-3" />+{value}%
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-400">
      <TrendingDown className="w-3 h-3" />{value}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="w-3 h-3" />0%
    </span>
  );
}

function MetricCard({ label, value, prev, variation, icon: Icon }: {
  label: string; value: number; prev: number; variation: number | null;
  icon: any;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value.toLocaleString('pt-BR')}</div>
      <div className="flex items-center gap-2">
        <VariationBadge value={variation} />
        {prev > 0 && <span className="text-xs text-muted-foreground">ant: {prev.toLocaleString('pt-BR')}</span>}
      </div>
    </div>
  );
}

// ─── Componente de Thumbnail com proxy e placeholder ───────────────────────
function PostThumbnail({ thumbnailUrl, mediaType }: { thumbnailUrl?: string; mediaType?: string }) {
  const [error, setError] = useState(false);
  const proxyUrl = thumbnailUrl && !error
    ? `/api/image-proxy?url=${encodeURIComponent(thumbnailUrl)}`
    : null;
  const isVideo = mediaType === 'VIDEO' || mediaType === 'REELS';
  const isCarousel = mediaType === 'CAROUSEL_ALBUM';
  if (proxyUrl) {
    return (
      <div className="relative flex-shrink-0 w-12 h-12">
        <img
          src={proxyUrl}
          alt=""
          className="w-12 h-12 rounded object-cover"
          onError={() => setError(true)}
        />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-12 h-12 rounded bg-muted/40 border border-border/30 flex items-center justify-center">
      {isVideo ? (
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-muted-foreground/50 border-b-[6px] border-b-transparent ml-0.5" />
      ) : isCarousel ? (
        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
          {[0,1,2,3].map(i => <div key={i} className="bg-muted-foreground/30 rounded-sm" />)}
        </div>
      ) : (
        <div className="w-5 h-5 rounded bg-muted-foreground/30" />
      )}
    </div>
  );
}

// ─── Componente de exibição de relatório (reutilizado em Gerar e Histórico) ─
function ReportDisplay({ reportData }: { reportData: any }) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho do relatório */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Relatório: {reportData.period?.label ?? reportData.periodLabel}</p>
          {reportData.previousPeriod && (
            <p className="text-xs text-muted-foreground">Comparado com: {reportData.previousPeriod.label}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {reportData.dataSource && (
            <Badge variant="outline" className="text-xs gap-1">
              <Database className="w-3 h-3" />
              {reportData.dataSource === 'mysql' ? 'MySQL' : 'JSON'}
            </Badge>
          )}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Gerado em</p>
            <p className="text-xs font-medium">
              {new Date(reportData.generatedAt ?? reportData.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
      {/* Crescimento de seguidores */}
      {reportData.followers?.growth !== null && reportData.followers?.growth !== undefined && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Crescimento de Seguidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="text-2xl font-bold">{reportData.followers.start?.toLocaleString('pt-BR') ?? '—'}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Fim</p>
                <p className="text-2xl font-bold">{reportData.followers.end?.toLocaleString('pt-BR') ?? '—'}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Crescimento</p>
                <p className={`text-3xl font-bold ${reportData.followers.growth > 0 ? 'text-emerald-400' : reportData.followers.growth < 0 ? 'text-red-400' : 'text-foreground'}`}>
                  {reportData.followers.growth > 0 ? '+' : ''}{reportData.followers.growth}
                </p>
                {reportData.followers.growthPct !== null && reportData.followers.growthPct !== undefined && (
                  <p className="text-xs text-muted-foreground">{reportData.followers.growthPct}% no período</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Grid de métricas */}
      {reportData.currentMetrics && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Métricas de Engajamento</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="Posts" value={reportData.currentMetrics.totalPosts} prev={reportData.previousMetrics?.totalPosts ?? 0} variation={reportData.variations?.posts ?? null} icon={BarChart3} />
            <MetricCard label="Curtidas" value={reportData.currentMetrics.totalLikes} prev={reportData.previousMetrics?.totalLikes ?? 0} variation={reportData.variations?.likes ?? null} icon={Heart} />
            <MetricCard label="Comentários" value={reportData.currentMetrics.totalComments} prev={reportData.previousMetrics?.totalComments ?? 0} variation={reportData.variations?.comments ?? null} icon={MessageCircle} />
            <MetricCard label="Engajamento Total" value={reportData.currentMetrics.totalEngagement} prev={reportData.previousMetrics?.totalEngagement ?? 0} variation={reportData.variations?.engagement ?? null} icon={Star} />
            <MetricCard label="Média/Post" value={reportData.currentMetrics.avgEngagement} prev={reportData.previousMetrics?.avgEngagement ?? 0} variation={reportData.variations?.avgEngagement ?? null} icon={TrendingUp} />
          </div>
        </div>
      )}
      {/* Engajamento por tipo de conteúdo */}
      {reportData.byType && reportData.byType.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Engajamento por Tipo de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.byType} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}
                    formatter={(value: any, name: string) => [value, name === 'avgEngagement' ? 'Média Engaj.' : name === 'posts' ? 'Posts' : name]}
                  />
                  <Bar dataKey="avgEngagement" name="Média Engaj." radius={[4, 4, 0, 0]}>
                    {reportData.byType.map((_: any, i: number) => (
                      <Cell key={i} fill={['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'][i % 3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {reportData.byType.map((t: any) => (
                <div key={t.type} className="bg-muted/30 rounded-md p-2 text-center">
                  <p className="text-xs font-medium">{t.type}</p>
                  <p className="text-lg font-bold">{t.posts}</p>
                  <p className="text-xs text-muted-foreground">posts · {t.avgEngagement} eng. médio</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Top Posts */}
      {reportData.topPosts && reportData.topPosts.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              Top 5 Posts por Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportData.topPosts.map((post: any, i: number) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <PostThumbnail thumbnailUrl={post.thumbnailUrl} mediaType={post.mediaType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2 mb-1">{post.caption || '(sem legenda)'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments}</span>
                    {post.shares > 0 && <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares}</span>}
                    {post.saves > 0 && <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{post.saves}</span>}
                    <Badge variant="outline" className="text-xs py-0">{post.mediaType}</Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-primary">{post.engagement}</p>
                  <p className="text-xs text-muted-foreground">engajamentos</p>
                  {post.permalink && (
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/70 hover:text-primary flex items-center gap-0.5 mt-1 justify-end">
                      <ExternalLink className="w-3 h-3" />ver
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Posts com menor desempenho */}
      {reportData.worstPosts && reportData.worstPosts.length > 0 && reportData.currentMetrics?.totalPosts > 3 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Posts com Menor Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportData.worstPosts.map((post: any, i: number) => (
              <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <p className="flex-1 text-sm text-foreground line-clamp-1">{post.caption || '(sem legenda)'}</p>
                <span className="text-xs text-muted-foreground">{post.engagement} eng.</span>
                {post.permalink && (
                  <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Análise de IA */}
      {reportData.aiAnalysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Análise do Especialista em Redes Sociais
              <Badge variant="outline" className="text-xs ml-auto">IA · Especialista Sênior</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none text-foreground">
              <Streamdown>{reportData.aiAnalysis}</Streamdown>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Erro de IA */}
      {reportData.aiError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Não foi possível gerar a análise de IA: {reportData.aiError}
        </div>
      )}
      {/* Rodapé */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t border-border/30">
        Relatório gerado automaticamente pelo Painel de Campanha Eduardo Brandão · DF 2026
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Relatorio() {
  const { animationClass } = usePageTransition();
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Datas padrão: últimos 30 dias
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // Estado para modal de salvar
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  // Estado para visualizar relatório salvo
  const [viewingReportId, setViewingReportId] = useState<number | null>(null);

  // Estado para confirmar exclusão
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null);

  // Mutations e queries
  const generateMutation = trpc.report.generate.useMutation({
    onSuccess: (data) => {
      setReportData(data);
      setIsGenerating(false);
      toast.success("Relatório gerado com sucesso!");
    },
    onError: (err) => {
      setIsGenerating(false);
      toast.error(`Erro ao gerar relatório: ${err.message}`);
    },
  });

  const saveMutation = trpc.report.save.useMutation({
    onSuccess: () => {
      toast.success("Relatório salvo no histórico!");
      setShowSaveDialog(false);
      setSaveTitle('');
      listQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  const listQuery = trpc.report.list.useQuery(undefined, {
    enabled: activeTab === 'history',
    refetchOnWindowFocus: false,
  });

  const viewQuery = trpc.report.getById.useQuery(
    { id: viewingReportId! },
    { enabled: viewingReportId !== null }
  );

  const deleteMutation = trpc.report.delete.useMutation({
    onSuccess: () => {
      toast.success("Relatório excluído.");
      setDeletingReportId(null);
      listQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao excluir: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!fromDate || !toDate) {
      toast.error("Selecione as datas de início e fim.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("A data de início deve ser anterior à data de fim.");
      return;
    }
    setIsGenerating(true);
    setReportData(null);
    generateMutation.mutate({ from: fromDate, to: toDate });
  };

  const handleOpenSaveDialog = () => {
    if (!reportData) return;
    const defaultTitle = `Relatório ${reportData.period?.label ?? `${fromDate} a ${toDate}`}`;
    setSaveTitle(defaultTitle);
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    if (!reportData || !saveTitle.trim()) {
      toast.error("Informe um título para o relatório.");
      return;
    }
    saveMutation.mutate({
      title: saveTitle.trim(),
      periodFrom: reportData.period.from,
      periodTo: reportData.period.to,
      periodLabel: reportData.period.label,
      currentMetrics: reportData.currentMetrics,
      previousMetrics: reportData.previousMetrics,
      variations: reportData.variations,
      followersData: reportData.followers ?? null,
      topPosts: reportData.topPosts ?? null,
      byType: reportData.byType ?? null,
      aiAnalysis: reportData.aiAnalysis ?? null,
      dataSource: reportData.dataSource ?? 'mysql',
    });
  };

  const buildPdfData = () => {
    if (viewingReportId !== null && viewQuery.data) {
      const d = viewQuery.data as any;
      return {
        ...d,
        period: { from: d.periodFrom, to: d.periodTo, label: d.periodLabel },
        followers: d.followersData,
        generatedAt: d.createdAt,
      };
    }
    return reportData;
  };

  const handleExportPDF = async () => {
    const data = buildPdfData();
    if (!data) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 20;
      // Cabeçalho
      doc.setFillColor(22, 40, 30);
      doc.rect(0, 0, pageW, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Performance — Instagram", margin, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const periodLabel = data.period?.label ?? data.periodLabel ?? '';
      doc.text(`@eduardobrandaopv · ${periodLabel}`, margin, 28);
      doc.text(`Gerado em: ${new Date(data.generatedAt ?? data.createdAt).toLocaleString('pt-BR')}`, margin, 35);
      y = 50;
      // Métricas principais
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Métricas do Período", margin, y);
      y += 8;
      const m = data.currentMetrics;
      const v = data.variations;
      const metricsRows = [
        ["Posts publicados", m.totalPosts, v?.posts ?? null],
        ["Curtidas", m.totalLikes, v?.likes ?? null],
        ["Comentários", m.totalComments, v?.comments ?? null],
        ["Engajamento total", m.totalEngagement, v?.engagement ?? null],
        ["Engajamento médio/post", m.avgEngagement, v?.avgEngagement ?? null],
      ];
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      metricsRows.forEach(([label, value, variation]) => {
        doc.setFillColor(245, 247, 245);
        doc.rect(margin, y - 4, contentW, 8, "F");
        doc.setTextColor(50, 50, 50);
        doc.text(String(label), margin + 2, y);
        doc.text(String(value), margin + 80, y);
        const varStr = variation !== null ? (Number(variation) > 0 ? `+${variation}%` : `${variation}%`) : "—";
        doc.setTextColor(Number(variation) > 0 ? 0 : Number(variation) < 0 ? 180 : 100, Number(variation) > 0 ? 150 : 50, 50);
        doc.text(varStr, margin + 110, y);
        doc.setTextColor(50, 50, 50);
        y += 9;
      });
      y += 5;
      // Seguidores
      const followers = data.followers ?? data.followersData;
      if (followers?.growth !== null && followers?.growth !== undefined) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Crescimento de Seguidores", margin, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Início: ${followers.start ?? '—'} · Fim: ${followers.end ?? '—'} · Crescimento: ${followers.growth > 0 ? '+' : ''}${followers.growth} (${followers.growthPct ?? '—'}%)`, margin, y);
        y += 10;
      }
      // Top Posts
      if (data.topPosts?.length > 0) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Top 5 Posts por Engajamento", margin, y);
        y += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        data.topPosts.forEach((p: any, i: number) => {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 248 : 255);
          doc.rect(margin, y - 4, contentW, 10, "F");
          doc.setTextColor(50, 50, 50);
          const caption = (p.caption || '').slice(0, 60) + ((p.caption || '').length > 60 ? '...' : '');
          doc.text(`${i + 1}. ${caption}`, margin + 2, y);
          doc.text(`❤ ${p.likes}  💬 ${p.comments}  ⚡ ${p.engagement}`, margin + 130, y);
          y += 11;
        });
        y += 5;
      }
      // Análise de IA
      if (data.aiAnalysis) {
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text("Análise do Especialista (IA)", margin, y);
        y += 8;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const plainText = data.aiAnalysis
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`/g, '');
        const lines = doc.splitTextToSize(plainText, contentW);
        lines.forEach((line: string) => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, margin, y);
          y += 5;
        });
      }
      const fileLabel = periodLabel.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      doc.save(`relatorio-instagram-${fileLabel || `${fromDate}-${toDate}`}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao exportar PDF.");
    }
  };

  const canDelete = user?.role === 'coordinator' || user?.role === 'superadmin';
  const isAuthenticated = Boolean(user);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="relatorio" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatório de Performance</h1>
                <p className="text-muted-foreground text-sm">Análise completa com avaliação de especialista em redes sociais</p>
              </div>
            </div>
          </div>

          {/* Tabs principais */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'generate' | 'history')}>
            <TabsList className="mb-6">
              <TabsTrigger value="generate" className="gap-2">
                <Brain className="w-4 h-4" />
                Gerar Relatório
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                Histórico
                {listQuery.data && listQuery.data.length > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1 h-4 px-1">
                    {listQuery.data.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ─── ABA: GERAR RELATÓRIO ─── */}
            <TabsContent value="generate">
              {/* Seletor de período */}
              <Card className="mb-6 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Selecione o Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Data de início</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        max={toDate}
                        className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Data de fim</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        min={fromDate}
                        max={today.toISOString().slice(0, 10)}
                        className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      {/* Atalhos de período */}
                      <div className="flex gap-1">
                        {[
                          { label: "7d", days: 7 },
                          { label: "15d", days: 15 },
                          { label: "30d", days: 30 },
                        ].map(({ label, days }) => {
                          const d = new Date();
                          const f = new Date(d);
                          f.setDate(d.getDate() - days);
                          return (
                            <button
                              key={label}
                              onClick={() => { setFromDate(f.toISOString().slice(0, 10)); setToDate(d.toISOString().slice(0, 10)); }}
                              className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="gap-2 min-w-[140px]"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
                        ) : (
                          <><Brain className="w-4 h-4" />Gerar Relatório</>
                        )}
                      </Button>
                    </div>
                  </div>
                  {isGenerating && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analisando dados e consultando especialista IA... isso pode levar até 30 segundos.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resultado do relatório */}
              {reportData && (
                <div ref={printRef}>
                  {/* Barra de ações do relatório */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Relatório gerado · {new Date(reportData.generatedAt).toLocaleString('pt-BR')}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar PDF
                      </Button>
                      {isAuthenticated && (
                        <Button
                          onClick={handleOpenSaveDialog}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                          disabled={saveMutation.isPending}
                        >
                          {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Salvar Relatório
                        </Button>
                      )}
                    </div>
                  </div>
                  <ReportDisplay reportData={reportData} />
                </div>
              )}

              {/* Estado vazio */}
              {!reportData && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum relatório gerado</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-md">
                    Selecione o período desejado acima e clique em <strong>Gerar Relatório</strong> para obter uma análise completa com avaliação de especialista.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ─── ABA: HISTÓRICO ─── */}
            <TabsContent value="history">
              {/* Se está visualizando um relatório específico */}
              {viewingReportId !== null ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingReportId(null)}
                      className="gap-2 text-muted-foreground"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Voltar ao histórico
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </Button>
                  </div>
                  {viewQuery.isLoading && (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  {viewQuery.error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Erro ao carregar relatório: {viewQuery.error.message}
                    </div>
                  )}
                  {viewQuery.data && (
                    <ReportDisplay
                      reportData={{
                        ...viewQuery.data,
                        period: {
                          from: (viewQuery.data as any).periodFrom,
                          to: (viewQuery.data as any).periodTo,
                          label: (viewQuery.data as any).periodLabel,
                        },
                        followers: (viewQuery.data as any).followersData,
                        generatedAt: (viewQuery.data as any).createdAt,
                      }}
                    />
                  )}
                </div>
              ) : (
                /* Lista de relatórios salvos */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Relatórios salvos para consulta posterior
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => listQuery.refetch()}
                      disabled={listQuery.isFetching}
                      className="gap-2 text-muted-foreground"
                    >
                      <RefreshCw className={`w-4 h-4 ${listQuery.isFetching ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                  </div>

                  {listQuery.isLoading && (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {listQuery.error && (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Erro ao carregar histórico: {listQuery.error.message}
                    </div>
                  )}

                  {listQuery.data && listQuery.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <History className="w-16 h-16 text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum relatório salvo</h3>
                      <p className="text-sm text-muted-foreground/70 max-w-md">
                        Gere um relatório na aba <strong>Gerar Relatório</strong> e clique em <strong>Salvar Relatório</strong> para manter um histórico.
                      </p>
                    </div>
                  )}

                  {listQuery.data && listQuery.data.length > 0 && (
                    <div className="space-y-3">
                      {listQuery.data.map((report: any) => {
                        const metrics = report.currentMetrics as any;
                        const variations = report.variations as any;
                        return (
                          <div
                            key={report.id}
                            className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-4"
                          >
                            {/* Ícone */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            {/* Informações */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{report.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {report.periodLabel}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                {report.dataSource && (
                                  <Badge variant="outline" className="text-xs h-4 px-1">
                                    {report.dataSource === 'mysql' ? 'MySQL' : 'JSON'}
                                  </Badge>
                                )}
                              </div>
                              {/* Métricas resumidas */}
                              {metrics && (
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{metrics.totalPosts}</span> posts
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{metrics.totalEngagement?.toLocaleString('pt-BR')}</span> eng.
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{metrics.avgEngagement}</span> méd/post
                                  </span>
                                  {variations?.engagement !== null && variations?.engagement !== undefined && (
                                    <VariationBadge value={variations.engagement} />
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Ações */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingReportId(report.id)}
                                className="gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Ver
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingReportId(report.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ─── Modal: Salvar Relatório ─── */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Salvar Relatório
            </DialogTitle>
            <DialogDescription>
              Escolha um título para identificar este relatório no histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Título do relatório</label>
            <Input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Ex: Relatório Abril 2026"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              autoFocus
            />
            {reportData && (
              <p className="text-xs text-muted-foreground mt-2">
                Período: {reportData.period?.label} · {reportData.currentMetrics?.totalPosts} posts · {reportData.currentMetrics?.totalEngagement?.toLocaleString('pt-BR')} engajamentos
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !saveTitle.trim()}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal: Confirmar Exclusão ─── */}
      <Dialog open={deletingReportId !== null} onOpenChange={(open) => { if (!open) setDeletingReportId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Excluir Relatório
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O relatório será removido permanentemente do histórico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingReportId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingReportId !== null) {
                  deleteMutation.mutate({ id: deletingReportId });
                }
              }}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
