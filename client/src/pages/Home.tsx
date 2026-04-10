import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, TrendingUp, BarChart3, Calendar, Lightbulb, Settings, RefreshCw, Heart, MessageCircle, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";

export default function Home() {
  const [, navigate] = useLocation();
  const [lastSync, setLastSync] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  
  // Buscar métricas reais do Instagram
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery();

  // Mutation para sincronizar dados diretamente da API do Instagram
  const syncMutation = trpc.instagram.syncFromAPI.useMutation({
    onSuccess: async (result) => {
      if (result.success) {
        // Invalidar todas as queries do Instagram para buscar dados frescos
        await utils.instagram.getMetrics.invalidate();
        await utils.instagram.getPosts.invalidate();
        await utils.instagram.getGrowth.invalidate();
        await utils.instagram.getEngagementByType.invalidate();
        await utils.instagram.getTopPosts.invalidate();
        const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSync(now);
        setSyncError(null);
      } else {
        setSyncError(result.error || 'Erro desconhecido na sincronização');
      }
    },
    onError: (err) => {
      setSyncError(err.message);
    },
  });
  
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handleRefresh = () => {
    setSyncError(null);
    syncMutation.mutate();
  };

  // Calcular KPIs baseado em dados reais
  const targetFollowers = 20000;
  const currentFollowers = metrics?.followers || 0;
  const requiredGrowth = Math.max(0, targetFollowers - currentFollowers);
  const totalPosts = metrics?.posts || 0;
  const totalLikes = metrics?.likes || 0;
  const totalComments = metrics?.comments || 0;
  const avgEngagement = totalPosts > 0 ? Math.round((totalLikes + totalComments) / Math.min(totalPosts, 20)) : 0;
  
  // Atualizar timestamp de última sincronização
  useEffect(() => {
    if (metrics) {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSync(now);
    }
  }, [metrics]);

  const progressPercentage = (currentFollowers / targetFollowers) * 100;

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="home" />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Error Alert */}
          {metricsError && <InstagramErrorAlert error={metricsError as unknown as Error} />}
          
          {/* Header com perfil real */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Painel Principal</h1>
              {metrics?.username ? (
                <p className="text-muted-foreground">
                  <span className="text-primary font-medium">@{metrics.username}</span> — {metrics.name || 'Eduardo Brandão'}
                </p>
              ) : (
                <p className="text-muted-foreground">Visão executiva da campanha Eduardo Brandão — Brasília Cidade Parque</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={syncMutation.isPending || metricsLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>

          {/* Status de Sincronização */}
          {syncError && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-400">Erro na sincronização: {syncError}</span>
            </div>
          )}
          {lastSync && !syncError && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600">Dados sincronizados diretamente do Instagram às {lastSync}</span>
            </div>
          )}
          
          {/* KPI Cards - 4 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : currentFollowers.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Seguindo: {metricsLoading ? '...' : (metrics?.following || 0).toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{targetFollowers.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground mt-1">Faltam {requiredGrowth.toLocaleString('pt-BR')} seguidores</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Engajamento Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {metricsLoading ? '...' : avgEngagement.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por post (últimos 20)</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total de Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {metricsLoading ? '...' : totalPosts.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Publicações no perfil</p>
              </CardContent>
            </Card>
          </div>

          {/* Engajamento detalhado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : totalLikes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Curtidas (últimos 20 posts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : totalComments.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Comentários (últimos 20 posts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : currentFollowers > 0 ? ((avgEngagement / currentFollowers) * 100).toFixed(2) + '%' : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Taxa de engajamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 border border-border/50">
            <CardHeader>
              <CardTitle>Progresso da Campanha</CardTitle>
              <CardDescription>
                {currentFollowers.toLocaleString('pt-BR')} de {targetFollowers.toLocaleString('pt-BR')} seguidores ({progressPercentage.toFixed(1)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>0</span>
                <span>{(targetFollowers / 2).toLocaleString('pt-BR')}</span>
                <span>{targetFollowers.toLocaleString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access - 3 colunas */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido aos Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleNavigate("/conteudo")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Conteúdo
                  </CardTitle>
                  <CardDescription>Calendário e cronograma de posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleNavigate("/estrategia")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Estratégia
                  </CardTitle>
                  <CardDescription>Direção e narrativa da campanha</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleNavigate("/metricas")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Métricas
                  </CardTitle>
                  <CardDescription>Engajamento e performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleNavigate("/projecoes")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Projeções
                  </CardTitle>
                  <CardDescription>Crescimento e metas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleNavigate("/configuracoes")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações
                  </CardTitle>
                  <CardDescription>Credenciais e preferências</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
