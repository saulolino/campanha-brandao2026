import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, TrendingUp, BarChart3, Calendar, Lightbulb, Settings, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const [lastSync, setLastSync] = useState<string>('');
  
  // Buscar métricas reais do Instagram
  const { data: metrics, isLoading: metricsLoading } = trpc.instagram.getMetrics.useQuery();
  
  const handleNavigate = (route: string) => {
    navigate(route);
  };

  // Calcular KPIs baseado em dados reais
  const targetFollowers = 20000;
  const currentFollowers = metrics?.followers || 0;
  const requiredGrowth = Math.max(0, targetFollowers - currentFollowers);
  const weeklyGrowth = Math.floor(currentFollowers * 0.02); // Estimativa: 2% crescimento semanal
  
  // Atualizar timestamp de última sincronização
  useEffect(() => {
    if (metrics) {
      const now = new Date().toLocaleTimeString('pt-BR');
      setLastSync(now);
    }
  }, [metrics]);
  
  const kpis = {
    currentFollowers,
    targetFollowers,
    requiredGrowth,
    weeklyGrowth,
  };

  const progressPercentage = (kpis.currentFollowers / kpis.targetFollowers) * 100;

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="home" />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Painel Principal</h1>
            <p className="text-muted-foreground">Visão executiva da campanha Eduardo Brandão — Brasília Cidade Parque</p>
          </div>

          {/* Status de Sincronização */}
          {lastSync && (
            <div className="flex items-center justify-between mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Última sincronização: {lastSync}</span>
              <RefreshCw className="w-4 h-4 text-green-500" />
            </div>
          )}
          
          {/* KPI Cards - 4 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : kpis.currentFollowers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Do Instagram em tempo real</p>
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
                <div className="text-3xl font-bold text-accent">{kpis.targetFollowers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Objetivo da campanha</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Faltando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{kpis.requiredGrowth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores necessários</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Crescimento Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+{metricsLoading ? '...' : kpis.weeklyGrowth}</div>
                <p className="text-xs text-muted-foreground mt-1">Estimativa semanal</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 border border-border/50">
            <CardHeader>
              <CardTitle>Progresso da Campanha</CardTitle>
              <CardDescription>
                {kpis.currentFollowers.toLocaleString()} de {kpis.targetFollowers.toLocaleString()} seguidores ({progressPercentage.toFixed(1)}%)
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
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
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
