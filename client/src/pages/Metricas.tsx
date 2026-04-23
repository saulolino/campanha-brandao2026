import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";
import InstagramTokenAlert from "@/components/InstagramTokenAlert";
import { useState } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Heart, MessageCircle, Share2, TrendingUp, Filter, Loader, RefreshCw, Users, Pencil, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Metricas() {
  const { animationClass } = usePageTransition();
  const [period, setPeriod] = useState("semanal");
  const [contentType, setContentType] = useState("todos");
  const [sortBy, setSortBy] = useState<"engagement" | "shares" | "saves" | "likes">("engagement");

  // Estado do modal de atualização de métricas
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    realLikes: 0,
    realComments: 0,
    realShares: 0,
    realSaves: 0,
    realReach: 0,
    aiAnalysis: "neutro" as "top" | "fraco" | "neutro",
    aiSuggestion: "ajustar" as "replicar" | "ajustar" | "descartar",
    aiSuggestionNote: "",
  });

  const utils = trpc.useUtils();

  // Buscar dados reais do Instagram
  const queryOpts = { staleTime: 0, refetchOnWindowFocus: true, refetchInterval: 5 * 60 * 1000 };
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery(undefined, queryOpts);
  const { data: engagementByType, isLoading: engagementLoading } = trpc.instagram.getEngagementByType.useQuery(undefined, queryOpts);
  const { data: topPosts, isLoading: topLoading } = trpc.instagram.getTopPosts.useQuery({ limit: 10 }, queryOpts);
  const { data: growth, isLoading: growthLoading } = trpc.instagram.getGrowth.useQuery(undefined, queryOpts);
  const { data: lastSync } = trpc.instagram.getLastSync.useQuery(undefined, queryOpts);
  const { data: followersHistory } = trpc.instagram.getFollowersHistory.useQuery(undefined, queryOpts);

  // Mutação de sincronização
  const syncMutation = trpc.instagram.syncFromAPI.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Sincronizado! ${result.followers} seguidores · ${result.posts} posts atualizados.`);
        utils.instagram.getMetrics.invalidate();
        utils.instagram.getGrowth.invalidate();
        utils.instagram.getEngagementByType.invalidate();
        utils.instagram.getTopPosts.invalidate();
        utils.instagram.getLastSync.invalidate();
        utils.instagram.getFollowersHistory.invalidate();
      } else {
        toast.error(`Erro na sincronização: ${result.error || 'Tente novamente.'}`);
      }
    },
    onError: () => toast.error('Falha ao sincronizar com Instagram.'),
  });

  // Buscar posts publicados da agenda (para atualização manual de métricas)
  const { data: publishedPosts, isLoading: publishedLoading } = trpc.posts.list.useQuery(
    { status: "published", limit: 50 },
    { staleTime: 0 }
  );

  // Mutation de atualização de métricas reais
  const updateMetricsMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Métricas atualizadas com sucesso!");
      utils.posts.list.invalidate();
      setEditingPost(null);
    },
    onError: () => toast.error("Erro ao atualizar métricas."),
  });

  // Abrir modal de edição de métricas
  const openEditMetrics = (post: any) => {
    setEditingPost(post);
    setEditForm({
      realLikes: post.realLikes ?? post.expectedLikes ?? 0,
      realComments: post.realComments ?? post.expectedComments ?? 0,
      realShares: post.realShares ?? 0,
      realSaves: post.realSaves ?? 0,
      realReach: post.realReach ?? post.expectedReach ?? 0,
      aiAnalysis: (post.aiAnalysis as "top" | "fraco" | "neutro") ?? "neutro",
      aiSuggestion: (post.aiSuggestion as "replicar" | "ajustar" | "descartar") ?? "ajustar",
      aiSuggestionNote: post.aiSuggestionNote ?? "",
    });
  };

  // Salvar métricas atualizadas
  const saveMetrics = () => {
    if (!editingPost) return;
    updateMetricsMutation.mutate({
      id: editingPost.id,
      realLikes: editForm.realLikes,
      realComments: editForm.realComments,
      realShares: editForm.realShares,
      realSaves: editForm.realSaves,
      realReach: editForm.realReach,
      aiAnalysis: editForm.aiAnalysis,
      aiSuggestion: editForm.aiSuggestion,
      aiSuggestionNote: editForm.aiSuggestionNote || null,
    });
  };

  // Preparar dados para gráficos — o backend retorna engagement/posts por semana (não followers)
  const growthData = growth?.daily?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }),
    likes: item.likes || 0,
    comments: item.comments || 0,
    shares: item.shares || 0,
    saves: item.saves || 0,
    engagement: item.engagement || 0,
    posts: item.posts || 0,
    avgEngagement: item.avgEngagement || 0,
  })) || [];

  // Calcular limiar viral: máximo entre 15 e a média de compartilhamentos
  const allPostsArr = (topPosts || []) as any[];
  const avgShares = allPostsArr.length > 0
    ? allPostsArr.reduce((s: number, p: any) => s + (p.shares || 0), 0) / allPostsArr.length
    : 0;
  const viralThreshold = Math.max(15, avgShares);

  // Comparativo semanal: últimas 2 semanas do growthData
  const weeklyComparison = (() => {
    if (!growthData || growthData.length < 2) return null;
    const half = Math.floor(growthData.length / 2);
    const thisWeek = growthData.slice(-half);
    const lastWeek = growthData.slice(-half * 2, -half);
    if (thisWeek.length === 0 || lastWeek.length === 0) return null;
    const sum = (arr: any[], key: string) => arr.reduce((s, d) => s + (d[key] || 0), 0);
    const pct = (curr: number, prev: number) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);
    return {
      likes: pct(sum(thisWeek, 'likes'), sum(lastWeek, 'likes')),
      comments: pct(sum(thisWeek, 'comments'), sum(lastWeek, 'comments')),
      shares: pct(sum(thisWeek, 'shares'), sum(lastWeek, 'shares')),
      saves: pct(sum(thisWeek, 'saves'), sum(lastWeek, 'saves')),
    };
  })();

  // Filtrar e ordenar posts
  const filteredPosts = (topPosts || [])
    .filter((post: any) => {
      if (contentType === 'todos') return true;
      const postType = post.mediaType?.toLowerCase() || '';
      if (contentType === 'reels') return postType.includes('reel');
      if (contentType === 'carousel') return postType.includes('carousel');
      if (contentType === 'image') return postType.includes('image');
      if (contentType === 'video') return postType.includes('video');
      return true;
    })
    .sort((a: any, b: any) => (b[sortBy] || 0) - (a[sortBy] || 0));

  // Preparar dados de distribuição de engajamento
  const engagementDistribution = [
    { name: 'Curtidas', value: metrics?.likes || 0, color: '#ef4444' },
    { name: 'Comentários', value: metrics?.comments || 0, color: '#3b82f6' },
    { name: 'Compartilhamentos', value: metrics?.shares || 0, color: '#10b981' },
    { name: 'Salvos', value: metrics?.saves || 0, color: '#f59e0b' },
  ];

  return (
    <>
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="metricas" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {metricsError && <InstagramErrorAlert error={metricsError as unknown as Error} />}
          <InstagramTokenAlert />

          {/* Barra de status de sincronização */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs text-muted-foreground">
              {lastSync?.lastSync
                ? `Última sincronização: ${new Date(lastSync.lastSync).toLocaleString('pt-BR')}`
                : 'Dados do cache local'}
            </p>
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Métricas</h1>
            </div>
            <p className="text-muted-foreground mb-6">Engajamento, performance e indicadores em tempo real do Instagram</p>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Últimos 7 dias</SelectItem>
                  <SelectItem value="mensal">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>

              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo de conteúdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                  <SelectItem value="image">Imagens</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Curtidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : (metrics?.likes || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Comentários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : (metrics?.comments || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-green-500" />
                  Compartilhamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : (metrics?.shares || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Seguidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : (metrics?.followers || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total atual</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="crescimento" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
              <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
              <TabsTrigger value="topPosts">Top Posts</TabsTrigger>
            </TabsList>

            {/* Crescimento */}
            <TabsContent value="crescimento" className="space-y-4">
              {/* Gráfico de Evolução Real de Seguidores */}
              {followersHistory && followersHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-violet-400" />
                      Evolução de Seguidores
                    </CardTitle>
                    <CardDescription>
                      Crescimento real de seguidores ao longo do tempo — {followersHistory.length} snapshots diários registrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={followersHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }}
                          tickFormatter={(v: string) => { const [, m, d] = v.split('-'); return `${d}/${m}`; }}
                        />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                          formatter={(v: any) => [v.toLocaleString(), 'Seguidores']}
                          labelFormatter={(l: string) => { const [y, m, d] = l.split('-'); return `${d}/${m}/${y}`; }}
                        />
                        <Line type="monotone" dataKey="followers" stroke="#a78bfa" strokeWidth={2.5}
                          dot={{ fill: '#a78bfa', r: 4 }} name="Seguidores" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução por Semana</CardTitle>
                  <CardDescription>Curtidas, comentários e compartilhamentos por semana (últimos posts)</CardDescription>
                  {weeklyComparison && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {[
                        { label: 'Curtidas', value: weeklyComparison.likes, color: 'text-red-400' },
                        { label: 'Comentários', value: weeklyComparison.comments, color: 'text-blue-400' },
                        { label: 'Compartilhamentos', value: weeklyComparison.shares, color: 'text-green-400' },
                        { label: 'Salvos', value: weeklyComparison.saves, color: 'text-yellow-400' },
                      ].map(({ label, value, color }) => value !== null && (
                        <span key={label} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/60 font-medium ${color}`}>
                          {value > 0 ? '▲' : value < 0 ? '▼' : '—'} {label}: {value > 0 ? '+' : ''}{value}%
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                          itemStyle={{ color: '#f3f4f6' }}
                        />
                        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 13 }} />
                        <Line 
                          type="monotone" 
                          dataKey="likes" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', r: 4 }}
                          name="Curtidas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="comments" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          name="Comentários"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="shares" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 4 }}
                          name="Compartilhamentos"
                          strokeDasharray="5 3"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="saves" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b', r: 4 }}
                          name="Salvos"
                          strokeDasharray="2 4"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum dado de engajamento disponível. Clique em "Sincronizar agora".
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribuição de Engajamento */}
            <TabsContent value="distribuicao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Engajamento</CardTitle>
                  <CardDescription>Proporção de curtidas, comentários, compartilhamentos e salvos</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={engagementDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {engagementDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#f3f4f6' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Engajamento por Tipo */}
              {engagementByType && engagementByType.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Engajamento por Tipo de Conteúdo</CardTitle>
                    <CardDescription>Performance média de cada tipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {engagementByType.map((item: any) => (
                        <div key={item.type} className="border border-border/50 rounded-lg p-4">
                          <h4 className="font-semibold capitalize mb-3">
                            {item.type === 'VIDEO' ? 'Vídeo / Reels' : item.type === 'CAROUSEL_ALBUM' ? 'Carrossel' : item.type === 'IMAGE' ? 'Imagem' : item.type}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Posts</span>
                              <span className="font-semibold">{item.posts}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Engajamento Médio</span>
                              <span className="font-semibold">{(item.avgEngagement ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Compartilhamentos</span>
                              <span className="font-semibold text-green-500">{(item.totalShares || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Salvos</span>
                              <span className="font-semibold text-yellow-500">{(item.totalSaves || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Alcance Total</span>
                              <span className="font-semibold text-purple-500">{(item.totalReach || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Top Posts */}
            <TabsContent value="topPosts" className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="reels">Reels</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ordenar por:</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-44 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Mais Engajamento</SelectItem>
                      <SelectItem value="shares">Mais Compartilhados</SelectItem>
                      <SelectItem value="saves">Mais Salvos</SelectItem>
                      <SelectItem value="likes">Mais Curtidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Posts do Instagram (via API) */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Top Posts por {sortBy === 'engagement' ? 'Engajamento' : sortBy === 'shares' ? 'Compartilhamentos' : sortBy === 'saves' ? 'Salvos' : 'Curtidas'}
                  </CardTitle>
                  <CardDescription>Posts com melhor performance via API do Instagram — {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  {topLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map((post: any, index: number) => (
                        <div key={post.id || index} className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <h4 className="font-semibold line-clamp-2 flex-1">#{index + 1} - {post.caption || 'Sem legenda'}</h4>
                                {(post.shares || 0) >= viralThreshold && (
                                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm">
                                    🔥 Viral
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {post.permalink && (
                              <a href={post.permalink} target="_blank" rel="noopener noreferrer"
                                className="ml-2 text-muted-foreground hover:text-primary transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 pt-3 border-t border-border/30">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Engajamento</p>
                              <p className="font-semibold text-primary">{post.engagement?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Curtidas</p>
                              <p className="font-semibold text-red-500">{post.likes?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Comentários</p>
                              <p className="font-semibold text-blue-500">{post.comments?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Compartilhamentos</p>
                              <p className="font-semibold text-green-500">{post.shares?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Salvos</p>
                              <p className="font-semibold text-yellow-500">{post.saves?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Alcance</p>
                              <p className="font-semibold text-purple-500">{post.reach?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum post encontrado para este filtro
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Posts da Agenda — Atualização Manual de Métricas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-primary" />
                        Atualizar Métricas dos Posts da Agenda
                      </CardTitle>
                      <CardDescription>
                        Posts publicados pela equipe — insira as métricas reais coletadas manualmente do Instagram
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {publishedLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (publishedPosts || []).length > 0 ? (
                    <div className="space-y-3">
                      {(publishedPosts as any[] || []).map((post: any) => {
                        const hasRealMetrics = post.realLikes != null || post.realReach != null;
                        const totalEngagement = (post.realLikes ?? 0) + (post.realComments ?? 0) + (post.realShares ?? 0) + (post.realSaves ?? 0);
                        return (
                          <div key={post.id} className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-sm">{post.title}</h4>
                                  <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                                  {post.contentCategory && (
                                    <Badge variant="secondary" className="text-xs capitalize">{post.contentCategory.replace('_', ' ')}</Badge>
                                  )}
                                  {hasRealMetrics && (
                                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                      <CheckCircle2 className="w-3 h-3 mr-1" /> Métricas inseridas
                                    </Badge>
                                  )}
                                  {post.aiSuggestion && (
                                    <Badge className={`text-xs ${
                                      post.aiSuggestion === 'replicar' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                      post.aiSuggestion === 'descartar' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                      {post.aiSuggestion === 'replicar' ? '✅ Replicar' : post.aiSuggestion === 'descartar' ? '❌ Descartar' : '⚡ Ajustar'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Publicado em {new Date(post.scheduledDate).toLocaleDateString('pt-BR')}
                                  {post.publishedBy && ` · por ${post.publishedBy}`}
                                </p>
                                {hasRealMetrics && (
                                  <div className="flex gap-4 mt-2 text-xs">
                                    <span className="text-red-400">❤️ {(post.realLikes ?? 0).toLocaleString()}</span>
                                    <span className="text-blue-400">💬 {(post.realComments ?? 0).toLocaleString()}</span>
                                    <span className="text-green-400">🔁 {(post.realShares ?? 0).toLocaleString()}</span>
                                    <span className="text-yellow-400">🔖 {(post.realSaves ?? 0).toLocaleString()}</span>
                                    <span className="text-purple-400">👁️ {(post.realReach ?? 0).toLocaleString()}</span>
                                    <span className="text-primary font-semibold">⚡ {totalEngagement.toLocaleString()} eng.</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => openEditMetrics(post)}
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                {hasRealMetrics ? 'Editar' : 'Inserir Métricas'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhum post publicado na agenda ainda.</p>
                      <p className="text-xs mt-1">Posts com status "Publicado" aparecerão aqui para atualização de métricas.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>

    {/* Modal de Atualizacao de Metricas */}
    <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Atualizar Métricas Reais
          </DialogTitle>
        </DialogHeader>
        {editingPost && (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="font-medium text-sm">{editingPost.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(editingPost.scheduledDate).toLocaleDateString('pt-BR')} · {editingPost.type}
              </p>
            </div>

            {/* Métricas de Engajamento */}
            <div>
              <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Métricas de Engajamento</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">❤️ Curtidas</Label>
                  <Input
                    type="number" min={0}
                    value={editForm.realLikes}
                    onChange={(e) => setEditForm(f => ({ ...f, realLikes: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">💬 Comentários</Label>
                  <Input
                    type="number" min={0}
                    value={editForm.realComments}
                    onChange={(e) => setEditForm(f => ({ ...f, realComments: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">🔁 Compartilhamentos</Label>
                  <Input
                    type="number" min={0}
                    value={editForm.realShares}
                    onChange={(e) => setEditForm(f => ({ ...f, realShares: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">🔖 Salvos</Label>
                  <Input
                    type="number" min={0}
                    value={editForm.realSaves}
                    onChange={(e) => setEditForm(f => ({ ...f, realSaves: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">👁️ Alcance</Label>
                  <Input
                    type="number" min={0}
                    value={editForm.realReach}
                    onChange={(e) => setEditForm(f => ({ ...f, realReach: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Classificação IA */}
            <div>
              <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Classificação da Metodologia</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Análise</Label>
                  <Select
                    value={editForm.aiAnalysis}
                    onValueChange={(v) => setEditForm(f => ({ ...f, aiAnalysis: v as any }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">🏆 Top</SelectItem>
                      <SelectItem value="neutro">⚡ Neutro</SelectItem>
                      <SelectItem value="fraco">📉 Fraco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sugestão</Label>
                  <Select
                    value={editForm.aiSuggestion}
                    onValueChange={(v) => setEditForm(f => ({ ...f, aiSuggestion: v as any }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replicar">✅ Replicar</SelectItem>
                      <SelectItem value="ajustar">⚡ Ajustar</SelectItem>
                      <SelectItem value="descartar">❌ Descartar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 mt-3">
                <Label className="text-xs">Observação (opcional)</Label>
                <Input
                  placeholder="Ex: Alto alcance, baixo engajamento. Testar outro horário."
                  value={editForm.aiSuggestionNote}
                  onChange={(e) => setEditForm(f => ({ ...f, aiSuggestionNote: e.target.value }))}
                  className="h-9"
                />
              </div>
            </div>

            {/* Resumo de engajamento calculado */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Engajamento Total Calculado</p>
              <p className="text-2xl font-bold text-primary">
                {(editForm.realLikes + editForm.realComments + editForm.realShares + editForm.realSaves).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Taxa de engajamento: {editForm.realReach > 0
                  ? ((editForm.realLikes + editForm.realComments + editForm.realShares + editForm.realSaves) / editForm.realReach * 100).toFixed(2)
                  : '0.00'}%
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingPost(null)}>Cancelar</Button>
          <Button
            onClick={saveMetrics}
            disabled={updateMetricsMutation.isPending}
            className="bg-primary text-primary-foreground"
          >
            {updateMetricsMutation.isPending ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Salvar Métricas</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
