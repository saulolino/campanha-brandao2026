import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, TrendingUp, BarChart3, Calendar, Lightbulb, Settings } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  // Mock data - será substituído por dados reais do Instagram
  const kpis = {
    currentFollowers: 15234,
    targetFollowers: 20000,
    requiredGrowth: 4766,
    weeklyGrowth: 234,
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
                <div className="text-3xl font-bold text-primary">{kpis.currentFollowers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Contagem em tempo real</p>
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
                <div className="text-3xl font-bold text-green-500">+{kpis.weeklyGrowth}</div>
                <p className="text-xs text-muted-foreground mt-1">Novos seguidores</p>
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
