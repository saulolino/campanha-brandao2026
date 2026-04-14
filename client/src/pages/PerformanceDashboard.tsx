import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Loader2,
} from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: publishedPosts, isLoading, refetch } = trpc.posts.list.useQuery({
    status: "published",
    limit: 100,
  });

  // Alertas de metodologia
  const { data: alertsData, isLoading: alertsLoading } = trpc.posts.getAlerts.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const alerts = alertsData?.alerts ?? [];

  // Análise IA de performance
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const analyzePerformanceMutation = trpc.posts.analyzePerformance.useMutation({
    onSuccess: (data) => { setAiAnalysis(data); setAiLoading(false); },
    onError: () => setAiLoading(false),
  });

  const handleAnalyzeAI = () => {
    setAiLoading(true);
    const period: "week" | "month" = selectedPeriod === 'week' ? 'week' : 'month';
    analyzePerformanceMutation.mutate({ period });
  };

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Calcular métricas agregadas
  const metrics = publishedPosts?.reduce(
    (acc: any, post: any) => {
      const likes = post.instagramMetrics?.likes || 0;
      const comments = post.instagramMetrics?.comments || 0;
      const impressions = post.instagramMetrics?.impressions || 0;
      const reach = post.instagramMetrics?.reach || 0;

      return {
        totalLikes: acc.totalLikes + likes,
        totalComments: acc.totalComments + comments,
        totalImpressions: acc.totalImpressions + impressions,
        totalReach: acc.totalReach + reach,
        avgEngagement:
          (acc.totalLikes + acc.totalComments) /
          (publishedPosts.length || 1),
      };
    },
    {
      totalLikes: 0,
      totalComments: 0,
      totalImpressions: 0,
      totalReach: 0,
      avgEngagement: 0,
    }
  ) || {
    totalLikes: 0,
    totalComments: 0,
    totalImpressions: 0,
    totalReach: 0,
    avgEngagement: 0,
  };

  // Dados para gráfico de tendência
  const trendData = publishedPosts?.map((post: any) => ({
    date: new Date(post.publishedAt || new Date()).toLocaleDateString("pt-BR"),
    likes: post.instagramMetrics?.likes || 0,
    comments: post.instagramMetrics?.comments || 0,
    reach: post.instagramMetrics?.reach || 0,
  })) || [];

  // Dados para gráfico de engajamento
  const engagementData = [
    {
      name: "Curtidas",
      value: metrics.totalLikes,
      color: "#ef4444",
    },
    {
      name: "Comentários",
      value: metrics.totalComments,
      color: "#3b82f6",
    },
  ];

  const COLORS = ["#ef4444", "#3b82f6"];

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="performance" />
      <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Performance de Posts
              </h1>
              <p className="text-muted-foreground mt-2">
                Análise de métricas dos posts publicados no Instagram
              </p>
            </div>
            <Button
              onClick={handleRefreshMetrics}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Atualizando..." : "Atualizar Métricas"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total de Curtidas
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.totalLikes.toLocaleString("pt-BR")}
                </p>
              </div>
              <Heart size={32} className="text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total de Comentários
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.totalComments.toLocaleString("pt-BR")}
                </p>
              </div>
              <MessageCircle size={32} className="text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Alcance Total
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(metrics.totalReach / 1000).toFixed(1)}K
                </p>
              </div>
              <Eye size={32} className="text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Impressões
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(metrics.totalImpressions / 1000).toFixed(1)}K
                </p>
              </div>
              <TrendingUp size={32} className="text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Tendência */}
          <Card className="lg:col-span-2 p-6 border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Tendência de Engajamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#ef4444"
                  name="Curtidas"
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#3b82f6"
                  name="Comentários"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Pizza */}
          <Card className="p-6 border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuição de Engajamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Lista de Posts Publicados */}
        <Card className="p-6 border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Posts Publicados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Post
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Data
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <Heart size={16} className="inline mr-1" /> Curtidas
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <MessageCircle size={16} className="inline mr-1" /> Comentários
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <Eye size={16} className="inline mr-1" /> Alcance
                  </th>
                </tr>
              </thead>
              <tbody>
                {publishedPosts?.map((post: any) => (
                  <tr
                    key={post.id}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {post.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {post.caption}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {post.instagramMetrics?.likes || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {post.instagramMetrics?.comments || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {(post.instagramMetrics?.reach || 0) / 1000 > 0
                          ? `${((post.instagramMetrics?.reach || 0) / 1000).toFixed(1)}K`
                          : "0"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!publishedPosts || publishedPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum post publicado ainda
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ─── ALERTAS DE METODOLOGIA ─── */}
        {alerts && alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas de Produção
            </h2>
            {alerts.map((alert: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}>
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
                  {alert.suggestion && (
                    <p className="text-xs mt-1 opacity-70 italic">💡 {alert.suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {alerts && alerts.length === 0 && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-lg border bg-green-500/10 border-green-500/30 text-green-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Nenhum alerta de produção — sua máquina de conteúdo está saudável!</p>
          </div>
        )}

        {/* ─── ANÁLISE IA ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Análise de Performance com IA
            </h2>
            <Button onClick={handleAnalyzeAI} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</> : <><Zap className="w-4 h-4 mr-2" /> Analisar com IA</>}
            </Button>
          </div>
          {!aiAnalysis && !aiLoading && (
            <div className="p-8 rounded-lg border border-dashed border-border text-center">
              <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Clique em "Analisar com IA" para obter insights sobre seus posts publicados: quais replicar, ajustar ou descartar.</p>
            </div>
          )}
          {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Posts */}
              <Card className="p-5 border-green-500/30 bg-green-500/5">
                <h3 className="text-sm font-semibold text-green-400 flex items-center gap-1.5 mb-3">
                  <ThumbsUp className="w-4 h-4" /> Replicar ({aiAnalysis.topPosts?.length || 0})
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.topPosts?.map((p: any) => (
                    <div key={p.id} className="text-xs">
                      <p className="font-medium text-foreground line-clamp-1">{p.title}</p>
                      <p className="text-muted-foreground">{p.reason}</p>
                    </div>
                  ))}
                  {(!aiAnalysis.topPosts || aiAnalysis.topPosts.length === 0) && (
                    <p className="text-xs text-muted-foreground">Nenhum post de destaque no período</p>
                  )}
                </div>
              </Card>
              {/* Posts para Ajustar */}
              <Card className="p-5 border-amber-500/30 bg-amber-500/5">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5 mb-3">
                  <Lightbulb className="w-4 h-4" /> Ajustar ({aiAnalysis.adjustPosts?.length || 0})
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.adjustPosts?.map((p: any) => (
                    <div key={p.id} className="text-xs">
                      <p className="font-medium text-foreground line-clamp-1">{p.title}</p>
                      <p className="text-muted-foreground">{p.suggestion}</p>
                    </div>
                  ))}
                  {(!aiAnalysis.adjustPosts || aiAnalysis.adjustPosts.length === 0) && (
                    <p className="text-xs text-muted-foreground">Nenhum post para ajustar</p>
                  )}
                </div>
              </Card>
              {/* Posts para Descartar */}
              <Card className="p-5 border-red-500/30 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1.5 mb-3">
                  <ThumbsDown className="w-4 h-4" /> Descartar ({aiAnalysis.discardPosts?.length || 0})
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.discardPosts?.map((p: any) => (
                    <div key={p.id} className="text-xs">
                      <p className="font-medium text-foreground line-clamp-1">{p.title}</p>
                      <p className="text-muted-foreground">{p.reason}</p>
                    </div>
                  ))}
                  {(!aiAnalysis.discardPosts || aiAnalysis.discardPosts.length === 0) && (
                    <p className="text-xs text-muted-foreground">Nenhum post para descartar</p>
                  )}
                </div>
              </Card>
              {/* Insights Gerais */}
              {aiAnalysis.insights && (
                <Card className="md:col-span-3 p-5 border-primary/30 bg-primary/5">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4" /> Insights Gerais
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{aiAnalysis.insights}</p>
                </Card>
              )}
            </div>
          )}
        </div>

      </div>
      </main>
    </div>
  );
}
