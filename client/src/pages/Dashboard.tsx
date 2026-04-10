import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import Sidebar from "@/components/SidebarNew";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target, Users } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();

  const handleNavigate = (itemId: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "conteudo": "/conteudo",
      "estrategia": "/estrategia",
      "metricas": "/metricas",
      "projecoes": "/projecoes",
      "configuracoes": "/configuracoes",
    };
    const route = routeMap[itemId] || "/dashboard";
    navigate(route);
  };

  // Mock data - será substituído por dados reais do Instagram
  const kpis = {
    currentFollowers: 15234,
    targetFollowers: 20000,
    requiredGrowth: 4766,
    weeklyGrowth: 234,
    growthPercentage: 23.8,
  };

  const progressPercentage = (kpis.currentFollowers / kpis.targetFollowers) * 100;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="dashboard" onNavigate={handleNavigate} />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Painel Principal</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho geral da pré campanha Eduardo Brandão</p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Seguidores Atuais */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{kpis.currentFollowers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Contagem em tempo real</p>
              </CardContent>
            </Card>

            {/* Meta Final */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{kpis.targetFollowers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Objetivo da pré campanha</p>
              </CardContent>
            </Card>

            {/* Crescimento Necessário */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Crescimento Necessário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{kpis.requiredGrowth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores faltando</p>
              </CardContent>
            </Card>

            {/* Crescimento Semanal */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Crescimento Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+{kpis.weeklyGrowth}</div>
                <p className="text-xs text-muted-foreground mt-1">Novos seguidores esta semana</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 border-border/50">
            <CardHeader>
              <CardTitle>Progresso da Pré campanha</CardTitle>
              <CardDescription>
                {kpis.currentFollowers.toLocaleString()} de {kpis.targetFollowers.toLocaleString()} seguidores ({progressPercentage.toFixed(1)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
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

          {/* Quick Access Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/conteudo")}>
              <CardHeader>
                <CardTitle className="text-lg">Conteúdo da Semana</CardTitle>
                <CardDescription>Calendário e timeline de posts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Conteúdo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/estrategia")}>
              <CardHeader>
                <CardTitle className="text-lg">Estratégia</CardTitle>
                <CardDescription>Tema e objetivos estratégicos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Estratégia <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/metricas")}>
              <CardHeader>
                <CardTitle className="text-lg">Métricas</CardTitle>
                <CardDescription>Engajamento e performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Métricas <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
