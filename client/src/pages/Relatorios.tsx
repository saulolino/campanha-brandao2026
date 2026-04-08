import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";
import { useState } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Mail, TrendingUp, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Relatorios() {
  const { animationClass } = usePageTransition();

  // Buscar dados reais do Instagram
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery();
  const { data: growth, isLoading: growthLoading } = trpc.instagram.getGrowth.useQuery();
  const { data: engagementByType, isLoading: engagementLoading } = trpc.instagram.getEngagementByType.useQuery();
  const { data: topPosts, isLoading: topLoading } = trpc.instagram.getTopPosts.useQuery({ limit: 10 });

  // Preparar dados de crescimento semanal
  const growthData = growth?.daily?.map((item: any) => ({
    week: new Date(item.date).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }),
    followers: item.followers,
    engagement: item.engagement,
  })) || [];

  // Preparar dados de distribuição de conteúdo
  const distributionData = engagementByType?.map((item: any) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.posts,
    color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][Math.random() * 4 | 0],
  })) || [];

  // Calcular resumo executivo
  const totalPosts = engagementByType?.reduce((sum: number, item: any) => sum + item.posts, 0) || 0;
  const avgEngagement = engagementByType && engagementByType.length > 0
    ? engagementByType.reduce((sum: number, item: any) => sum + item.avgEngagement, 0) / engagementByType.length
    : 0;

  const handleDownloadPDF = () => {
    alert("Exportando relatório em PDF...\n\nEm produção, isso geraria um PDF com:\n- Resumo executivo\n- Gráficos de crescimento\n- Análise de engajamento\n- Top posts\n- Recomendações");
  };

  const handleSendEmail = () => {
    alert("Enviando relatório por email...\n\nEm produção, isso enviaria o relatório em PDF para o email configurado.");
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="relatorios" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {metricsError <div className="p-8 max-w-6xl mx-auto"><div className="p-8 max-w-6xl mx-auto"> <InstagramErrorAlert error={metricsError as unknown as Error} />}
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            </div>
            <p className="text-muted-foreground mb-6">Análise completa da campanha com dados reais do Instagram</p>

            {/* Ações */}
            <div className="flex flex-col md:flex-row gap-3">
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar PDF
              </Button>
              <Button variant="outline" onClick={handleSendEmail} className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Enviar por Email
              </Button>
            </div>
          </div>

          <Tabs defaultValue="crescimento" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
            </TabsList>

            {/* Crescimento */}
            <TabsContent value="crescimento" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento Semanal</CardTitle>
                  <CardDescription>Evolução de seguidores e engajamento nos últimos 7 dias</CardDescription>
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
                        <XAxis dataKey="week" stroke="#9ca3af" />
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
                          name="Seguidores"
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

              <Card>
                <CardHeader>
                  <CardTitle>Engajamento Semanal</CardTitle>
                  <CardDescription>Taxa de engajamento ao longo da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  {growthLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="week" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="engagement" fill="#3b82f6" name="Engajamento %" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Dados de engajamento não disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Conteúdo</CardTitle>
                  <CardDescription>Quantidade de posts por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : distributionData.length > 0 ? (
                    <div className="flex justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
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
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Dados de distribuição não disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Tipo</CardTitle>
                  <CardDescription>Engajamento médio de cada tipo de conteúdo</CardDescription>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : engagementByType && engagementByType.length > 0 ? (
                    <div className="space-y-4">
                      {engagementByType.map((item: any) => (
                        <div key={item.type} className="border border-border/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold capitalize">{item.type}</h4>
                            <span className="text-sm text-muted-foreground">{item.posts} posts</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Engajamento Médio</span>
                              <span className="font-semibold">{item.avgEngagement.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Alcance Total</span>
                              <span className="font-semibold">{item.totalReach.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${(item.avgEngagement / 100) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Dados de performance não disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Posts</CardTitle>
                  <CardDescription>Posts com melhor engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  {topLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : topPosts && topPosts.length > 0 ? (
                    <div className="space-y-3">
                      {topPosts.slice(0, 5).map((post: any, index: number) => (
                        <div key={post.id || index} className="border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold line-clamp-1 flex-1">#{index + 1} - {post.caption || 'Sem legenda'}</h4>
                            <span className="text-xs text-muted-foreground ml-2">{new Date(post.timestamp).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Curtidas</span>
                              <p className="font-semibold text-red-500">{post.likes?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Comentários</span>
                              <p className="font-semibold text-blue-500">{post.comments?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Alcance</span>
                              <p className="font-semibold text-green-500">{post.reach?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum post encontrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resumo Executivo */}
            <TabsContent value="resumo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Executivo</CardTitle>
                  <CardDescription>Visão geral da performance da campanha</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-border/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Métricas Gerais</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seguidores</span>
                          <span className="font-semibold">{metricsLoading ? '...' : (metrics?.followers || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total de Posts</span>
                          <span className="font-semibold">{totalPosts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Curtidas</span>
                          <span className="font-semibold">{metricsLoading ? '...' : (metrics?.likes || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comentários</span>
                          <span className="font-semibold">{metricsLoading ? '...' : (metrics?.comments || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Alcance</span>
                          <span className="font-semibold">{metricsLoading ? '...' : (metrics?.reach || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Recomendações</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Manter frequência de posts consistente</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Focar em conteúdo com maior engajamento</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Aumentar interação com comentários</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Testar novos formatos de conteúdo</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Passos</CardTitle>
                  <CardDescription>Ações recomendadas para otimizar a campanha</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="font-semibold mb-1">Aumentar Frequência</h4>
                      <p className="text-sm text-muted-foreground">Publicar mais conteúdo nos horários de pico para maximizar alcance</p>
                    </div>
                    <div className="border-l-4 border-accent pl-4 py-2">
                      <h4 className="font-semibold mb-1">Otimizar Hashtags</h4>
                      <p className="text-sm text-muted-foreground">Usar hashtags mais relevantes e com maior volume de busca</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-semibold mb-1">Engajar Comunidade</h4>
                      <p className="text-sm text-muted-foreground">Responder comentários e interagir com seguidores regularmente</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold mb-1">Testar Parcerias</h4>
                      <p className="text-sm text-muted-foreground">Colaborar com influenciadores e contas complementares</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
