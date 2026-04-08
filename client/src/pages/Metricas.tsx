import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";
import { useState } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Heart, MessageCircle, Share2, TrendingUp, Filter, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Metricas() {
  const { animationClass } = usePageTransition();
  const [period, setPeriod] = useState("semanal");
  const [contentType, setContentType] = useState("todos");

  // Buscar dados reais do Instagram
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery();
  const { data: engagementByType, isLoading: engagementLoading } = trpc.instagram.getEngagementByType.useQuery();
  const { data: topPosts, isLoading: topLoading } = trpc.instagram.getTopPosts.useQuery({ limit: 10 });
  const { data: growth, isLoading: growthLoading } = trpc.instagram.getGrowth.useQuery();

  // Preparar dados para gráficos
  const growthData = growth?.daily?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }),
    followers: item.followers,
    engagement: item.engagement,
  })) || [];

  // Filtrar posts por tipo de conteúdo
  const filteredPosts = topPosts?.filter((post: any) => {
    if (contentType === 'todos') return true;
    const postType = post.mediaType?.toLowerCase() || '';
    if (contentType === 'reels') return postType.includes('reel');
    if (contentType === 'carousel') return postType.includes('carousel');
    if (contentType === 'image') return postType.includes('image');
    if (contentType === 'video') return postType.includes('video');
    return true;
  }) || [];

  // Preparar dados de distribuição de engajamento
  const engagementDistribution = [
    { name: 'Curtidas', value: metrics?.likes || 0, color: '#ef4444' },
    { name: 'Comentários', value: metrics?.comments || 0, color: '#3b82f6' },
    { name: 'Compartilhamentos', value: metrics?.shares || 0, color: '#10b981' },
    { name: 'Salvos', value: metrics?.saves || 0, color: '#f59e0b' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="metricas" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {metricsError <div className="p-8 max-w-6xl mx-auto"><div className="p-8 max-w-6xl mx-auto"> <InstagramErrorAlert error={metricsError as unknown as Error} />}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Alcance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : (metrics?.reach || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pessoas alcançadas</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Seguidores</CardTitle>
                  <CardDescription>Evolução nos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="followers" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Dados de crescimento não disponíveis
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
                          <h4 className="font-semibold capitalize mb-3">{item.type}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Posts</span>
                              <span className="font-semibold">{item.posts}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Engajamento Médio</span>
                              <span className="font-semibold">{item.avgEngagement.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Alcance Total</span>
                              <span className="font-semibold">{item.totalReach.toLocaleString()}</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Top Posts por Engajamento</CardTitle>
                  <CardDescription>Posts com melhor performance</CardDescription>
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
                            <div className="flex-1">
                              <h4 className="font-semibold line-clamp-2 mb-1">#{index + 1} - {post.caption || 'Sem legenda'}</h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-border/30">
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
                              <p className="text-xs text-muted-foreground mb-1">Alcance</p>
                              <p className="font-semibold text-green-500">{post.reach?.toLocaleString() || 0}</p>
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
