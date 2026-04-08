import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import Sidebar from "@/components/SidebarNew";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, DollarSign, Zap } from "lucide-react";

export default function Projecoes() {
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

  // Mock data
  const growthProjection = [
    { month: "Abril", atual: 15234, projetado: 15234 },
    { month: "Maio", atual: 15234, projetado: 16500 },
    { month: "Junho", atual: 15234, projetado: 17800 },
    { month: "Julho", atual: 15234, projetado: 19200 },
    { month: "Agosto", atual: 15234, projetado: 20000 },
  ];

  const monthlyGrowth = [
    { month: "Abril", crescimento: 234, meta: 250 },
    { month: "Maio", crescimento: 1266, meta: 1300 },
    { month: "Junho", crescimento: 1300, meta: 1300 },
    { month: "Julho", crescimento: 1400, meta: 1400 },
    { month: "Agosto", crescimento: 800, meta: 800 },
  ];

  const investmentVsResult = [
    { semana: "Sem 1", investimento: 500, resultado: 234 },
    { semana: "Sem 2", investimento: 750, resultado: 456 },
    { semana: "Sem 3", investimento: 1000, resultado: 678 },
    { semana: "Sem 4", investimento: 1200, resultado: 789 },
  ];

  const projectionTable = [
    { mes: "Abril", inicio: 14500, fim: 15234, crescimento: 734, taxa: "5.1%" },
    { mes: "Maio", inicio: 15234, fim: 16500, crescimento: 1266, taxa: "8.3%" },
    { mes: "Junho", inicio: 16500, fim: 17800, crescimento: 1300, taxa: "7.9%" },
    { mes: "Julho", inicio: 17800, fim: 19200, crescimento: 1400, taxa: "7.9%" },
    { mes: "Agosto", inicio: 19200, fim: 20000, crescimento: 800, taxa: "4.2%" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="projecoes" onNavigate={handleNavigate} />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Projeções</h1>
            </div>
            <p className="text-muted-foreground">Crescimento, metas e análise de investimento</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20.000</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Faltando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.766</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+1.193/mês</div>
                <p className="text-xs text-muted-foreground mt-1">Crescimento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2x</div>
                <p className="text-xs text-green-500 mt-1">Retorno estimado</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Projeção de Crescimento */}
            <Card>
              <CardHeader>
                <CardTitle>Projeção de Crescimento</CardTitle>
                <CardDescription>Próximos 5 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthProjection}>
                    <defs>
                      <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#55c12e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#55c12e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="projetado" stroke="#55c12e" fillOpacity={1} fill="url(#colorProjetado)" />
                    <Line type="monotone" dataKey="atual" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Crescimento Mensal vs Meta */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento Mensal vs Meta</CardTitle>
                <CardDescription>Realizado vs Planejado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="crescimento" fill="#3b82f6" />
                    <Bar dataKey="meta" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Investimento vs Resultado */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Investimento vs Resultado</CardTitle>
              <CardDescription>Análise de ROI por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={investmentVsResult}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="investimento" stroke="#ef4444" strokeWidth={2} name="Investimento (R$)" />
                  <Line yAxisId="right" type="monotone" dataKey="resultado" stroke="#10b981" strokeWidth={2} name="Resultado (Seguidores)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção Detalhada</CardTitle>
              <CardDescription>Mês a mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold">Mês</th>
                      <th className="text-right py-2 px-4 font-semibold">Início</th>
                      <th className="text-right py-2 px-4 font-semibold">Fim</th>
                      <th className="text-right py-2 px-4 font-semibold">Crescimento</th>
                      <th className="text-right py-2 px-4 font-semibold">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">{row.mes}</td>
                        <td className="text-right py-3 px-4">{row.inicio.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-semibold">{row.fim.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-500">+{row.crescimento.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{row.taxa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
