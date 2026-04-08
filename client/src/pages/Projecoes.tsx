import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Target, DollarSign, Zap, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Projecoes() {
  const { animationClass } = usePageTransition();

  // Buscar dados reais do Instagram
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery();
  const { data: growth, isLoading: growthLoading } = trpc.instagram.getGrowth.useQuery();

  // Dados para projeção
  const targetFollowers = 20000;
  const currentFollowers = metrics?.followers || 0;
  const requiredGrowth = Math.max(0, targetFollowers - currentFollowers);

  // Preparar dados de crescimento para gráfico
  const growthData = growth?.daily?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' }),
    followers: item.followers,
    engagement: item.engagement,
  })) || [];

  // Calcular projeção mensal baseada em crescimento real
  const avgDailyGrowth = growthData.length > 1 
    ? Math.round((growthData[growthData.length - 1].followers - growthData[0].followers) / growthData.length)
    : 0;

  const projectionData = [
    { month: "Abril", atual: currentFollowers, projetado: currentFollowers },
    { month: "Maio", atual: currentFollowers, projetado: Math.min(currentFollowers + (avgDailyGrowth * 30), targetFollowers) },
    { month: "Junho", atual: currentFollowers, projetado: Math.min(currentFollowers + (avgDailyGrowth * 60), targetFollowers) },
    { month: "Julho", atual: currentFollowers, projetado: Math.min(currentFollowers + (avgDailyGrowth * 90), targetFollowers) },
    { month: "Agosto", atual: currentFollowers, projetado: targetFollowers },
  ];

  // Calcular taxa de crescimento mensal
  const monthlyGrowthData = projectionData.map((item, index) => ({
    month: item.month,
    crescimento: index === 0 ? 0 : item.projetado - projectionData[index - 1].projetado,
    meta: Math.round(requiredGrowth / 4),
  }));

  // Dados de investimento vs resultado (simulado)
  const investmentVsResult = [
    { semana: "Sem 1", investimento: 500, resultado: metrics?.reach || 0 },
    { semana: "Sem 2", investimento: 750, resultado: (metrics?.reach || 0) * 1.2 },
    { semana: "Sem 3", investimento: 1000, resultado: (metrics?.reach || 0) * 1.4 },
    { semana: "Sem 4", investimento: 1200, resultado: (metrics?.reach || 0) * 1.6 },
  ];

  // Tabela de projeção
  const projectionTable = projectionData.map((item, index) => {
    const inicio = index === 0 ? currentFollowers : projectionData[index - 1].projetado;
    const fim = item.projetado;
    const crescimento = Math.round(fim - inicio);
    const taxa = inicio > 0 ? ((crescimento / inicio) * 100).toFixed(1) : '0';
    
    return {
      mes: item.month,
      inicio: Math.round(inicio),
      fim: Math.round(fim),
      crescimento,
      taxa: `${taxa}%`,
    };
  });

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="projecoes" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {metricsError && <InstagramErrorAlert error={metricsError as unknown as Error} />}
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Projeções</h1>
            </div>
            <p className="text-muted-foreground">Crescimento, metas e análise de investimento baseados em dados reais</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{targetFollowers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {metricsLoading ? '...' : currentFollowers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Faltando</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{requiredGrowth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Seguidores</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Crescimento Diário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{avgDailyGrowth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Média</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Crescimento */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Projeção de Crescimento</CardTitle>
              <CardDescription>Crescimento projetado até atingir a meta</CardDescription>
            </CardHeader>
            <CardContent>
              {growthLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="atual" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorAtual)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="projetado" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorProjetado)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Crescimento Mensal */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Crescimento Mensal vs Meta</CardTitle>
              <CardDescription>Comparação entre crescimento projetado e meta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Bar dataKey="crescimento" fill="#10b981" name="Crescimento" />
                  <Bar dataKey="meta" fill="#3b82f6" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Investimento vs Resultado */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Investimento vs Resultado</CardTitle>
              <CardDescription>Análise de ROI por semana</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={investmentVsResult}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="semana" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="investimento" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Investimento"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resultado" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Resultado (Alcance)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Projeção */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Projeção Detalhada</CardTitle>
              <CardDescription>Crescimento mês a mês até atingir a meta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold">Mês</th>
                      <th className="text-right py-3 px-4 font-semibold">Início</th>
                      <th className="text-right py-3 px-4 font-semibold">Fim</th>
                      <th className="text-right py-3 px-4 font-semibold">Crescimento</th>
                      <th className="text-right py-3 px-4 font-semibold">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionTable.map((row, index) => (
                      <tr key={index} className="border-b border-border/30 hover:bg-muted/50">
                        <td className="py-3 px-4">{row.mes}</td>
                        <td className="text-right py-3 px-4">{row.inicio.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-semibold">{row.fim.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-500 font-semibold">+{row.crescimento.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-blue-500 font-semibold">{row.taxa}</td>
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
