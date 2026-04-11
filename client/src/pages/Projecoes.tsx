// ============================================================
// DESIGN: Command Center Militar Verde
// Página de Projeções - Pré campanha Eduardo Brandão
// Brasília Cidade Parque - Meta: 20.000 seguidores
// ============================================================

import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
} from "recharts";
import {
  TrendingUp, Target, DollarSign, Users, Zap, Star,
  MessageCircle, Share2, Eye, Bookmark, UserPlus, Heart,
  AlertTriangle, Globe,
} from "lucide-react";
import {
  CAMPAIGN, MONTHLY_PROJECTION, PILLARS, KPIS, BUDGET,
  CONTENT_PILLARS, VIRAL_TYPES, DONT_DO_RULES, TEAM,
} from "@/lib/campaignData";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  UserPlus, Heart, MessageCircle, TrendingUp, Eye, Zap, Bookmark, Share2,
  DollarSign, Users, Star, Globe,
};

const totalBudgetMin = BUDGET.reduce((s, b) => s + b.min, 0);
const totalBudgetMax = BUDGET.reduce((s, b) => s + b.max, 0);
const CONTENT_COLORS = ["#2d6a4f", "#40916c", "#c9a84c", "#e76f51"];

export default function Projecoes() {
  const { animationClass } = usePageTransition();

  // Busca dados reais do Instagram — atualiza automaticamente após cada sync
  const { data: metricsData } = trpc.instagram.getMetrics.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Usa seguidores reais do banco; fallback para campaignData se ainda não carregou
  const currentFollowers = metricsData?.followers ?? CAMPAIGN.currentFollowers;

  const progressPct = Math.round((currentFollowers / CAMPAIGN.targetFollowers) * 100);
  const remainingFollowers = CAMPAIGN.targetFollowers - currentFollowers;
  const daysLeft = Math.max(1, Math.ceil(
    (new Date(CAMPAIGN.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ));
  const requiredDailyGrowth = Math.ceil(remainingFollowers / daysLeft);

  const growthChartData = useMemo(() => [
    { month: "Hoje", seguidores: currentFollowers, crescimento: 0, investimento: 0 },
    ...MONTHLY_PROJECTION.map((m) => ({
      month: m.month,
      seguidores: m.total,
      crescimento: m.growth,
      investimento: m.investment,
    })),
  ], [currentFollowers]);

  const investmentData = useMemo(() => MONTHLY_PROJECTION.map((m) => ({
    month: m.month,
    investimento: m.investment,
  })), []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav activeSection="projecoes" />
      <main className={`flex-1 p-6 overflow-y-auto ${animationClass}`}>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">Projeções da Pré campanha</h1>
          </div>
          <p className="text-muted-foreground">
            Plano de crescimento de {currentFollowers.toLocaleString()} para{" "}
            {CAMPAIGN.targetFollowers.toLocaleString()} seguidores até outubro de 2026
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Seguidores Atuais</p>
              <p className="text-3xl font-bold text-primary">{currentFollowers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">de {CAMPAIGN.targetFollowers.toLocaleString()} meta</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Progresso</p>
              <p className="text-3xl font-bold text-yellow-400">{progressPct}%</p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Faltam</p>
              <p className="text-3xl font-bold text-blue-400">{remainingFollowers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">seguidores para a meta</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crescimento Diário Necessário</p>
              <p className="text-3xl font-bold text-green-400">+{requiredDailyGrowth}</p>
              <p className="text-xs text-muted-foreground mt-1">{daysLeft} dias restantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Acumulado */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Projeção de Crescimento Acumulado
            </CardTitle>
            <CardDescription>
              Evolução mês a mês de {currentFollowers.toLocaleString()} até 20.000 seguidores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={growthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40916c" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#40916c" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a2e1a", border: "1px solid #2d6a4f" }}
                  labelStyle={{ color: "#d1fae5" }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name === "seguidores" ? "Seguidores" : name]}
                />
                <ReferenceLine y={20000} stroke="#c9a84c" strokeDasharray="6 3" label={{ value: "Meta 20k", fill: "#c9a84c", fontSize: 11 }} />
                <Area type="monotone" dataKey="seguidores" stroke="#52b788" fill="url(#colorSeg)" strokeWidth={2.5} dot={{ fill: '#52b788', r: 4 }} name="Seguidores" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela Mensal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Projeção Mensal Detalhada
            </CardTitle>
            <CardDescription>Crescimento, investimento e acumulado mês a mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Período</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Início</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Crescimento</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Investimento</th>
                    <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Custo/Seguidor</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_PROJECTION.map((row, idx) => {
                    const inicio = idx === 0 ? CAMPAIGN.currentFollowers : MONTHLY_PROJECTION[idx - 1].total;
                    const custoSeguidor = (row.investment / row.growth).toFixed(2);
                    return (
                      <tr key={row.month} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{row.label}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">{inicio.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-400 font-semibold">+{row.growth.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-bold">{row.total.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-yellow-400">R$ {row.investment.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-blue-400">R$ {custoSeguidor}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td className="py-3 px-4 font-bold">TOTAL</td>
                    <td className="py-3 px-4" />
                    <td className="text-right py-3 px-4 text-green-400 font-bold">+{MONTHLY_PROJECTION.reduce((s, m) => s + m.growth, 0).toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-bold text-primary">20.000</td>
                    <td className="text-right py-3 px-4 text-yellow-400 font-bold">R$ {MONTHLY_PROJECTION.reduce((s, m) => s + m.investment, 0).toLocaleString()}</td>
                    <td className="py-3 px-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Barras: Crescimento + Investimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crescimento Mensal Planejado</CardTitle>
              <CardDescription>Novos seguidores por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a2e1a", border: "1px solid #2d6a4f" }} formatter={(v: number) => [v.toLocaleString(), "Novos seguidores"]} />
                  <Bar dataKey="crescimento" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investimento em Ads por Mês</CardTitle>
              <CardDescription>Orçamento de impulsionamento pago</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={investmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a2e1a", border: "1px solid #2d6a4f" }} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, "Investimento"]} />
                  <Bar dataKey="investimento" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              KPIs — Indicadores de Performance
            </CardTitle>
            <CardDescription>Metas mensais para cada métrica da pré campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPIS.map((kpi) => {
                const Icon = iconMap[kpi.icon] || TrendingUp;
                return (
                  <div key={kpi.name} className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                    <p className="text-xs text-muted-foreground leading-tight">{kpi.name}</p>
                    <p className="text-lg font-bold text-foreground">{kpi.target}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pilares */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              8 Pilares de Crescimento
            </CardTitle>
            <CardDescription>Estratégias e responsáveis por cada alavanca de crescimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PILLARS.map((pillar) => {
                const Icon = iconMap[pillar.icon] || Zap;
                return (
                  <div
                    key={pillar.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors"
                    style={{ borderLeftColor: pillar.color, borderLeftWidth: 3 }}
                  >
                    <div className="p-2 rounded-md flex-shrink-0" style={{ backgroundColor: `${pillar.color}22` }}>
                      <Icon className="w-4 h-4" style={{ color: pillar.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">{pillar.name}</p>
                        <Badge variant="outline" className="text-xs flex-shrink-0" style={{ color: pillar.color, borderColor: pillar.color }}>{pillar.percentage}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{pillar.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">{pillar.responsible}</span>
                        {" · "}
                        <span className="text-green-400">+{pillar.growthMin}–{pillar.growthMax}/mês</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mix de Conteúdo + Virais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mix de Conteúdo</CardTitle>
              <CardDescription>Distribuição por tipo de conteúdo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={CONTENT_PILLARS} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="percentage" nameKey="name">
                      {CONTENT_PILLARS.map((_, index) => (
                        <Cell key={index} fill={CONTENT_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1a2e1a", border: "1px solid #2d6a4f" }} formatter={(v: number) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {CONTENT_PILLARS.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CONTENT_COLORS[i] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: CONTENT_COLORS[i] }}>{p.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formatos Virais</CardTitle>
              <CardDescription>Tipos de conteúdo com maior potencial viral</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {VIRAL_TYPES.map((vt) => (
                  <div key={vt.type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{vt.type}</p>
                      <p className="text-xs text-muted-foreground">{vt.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className={vt.potential === "Muito Alto" ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"}>{vt.potential}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{vt.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orçamento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              Orçamento da Pré campanha
            </CardTitle>
            <CardDescription>
              Total estimado: R$ {totalBudgetMin.toLocaleString()} – R$ {totalBudgetMax.toLocaleString()} / mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Item</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Mín</th>
                      <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Máx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUDGET.map((b) => (
                      <tr key={b.item} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-2 px-3">{b.item}</td>
                        <td className="text-right py-2 px-3 text-yellow-400">R$ {b.min.toLocaleString()}</td>
                        <td className="text-right py-2 px-3 text-green-400">R$ {b.max.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td className="py-2 px-3 font-bold">TOTAL</td>
                      <td className="text-right py-2 px-3 font-bold text-yellow-400">R$ {totalBudgetMin.toLocaleString()}</td>
                      <td className="text-right py-2 px-3 font-bold text-green-400">R$ {totalBudgetMax.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={BUDGET} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="item" stroke="#9ca3af" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a2e1a", border: "1px solid #2d6a4f" }} formatter={(v: number) => [`R$ ${v.toLocaleString()}`]} />
                  <Bar dataKey="min" fill="#c9a84c" name="Mínimo" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="max" fill="#2d6a4f" name="Máximo" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Equipe — oculto a pedido */}

        {/* Regras */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Regras — O Que NÃO Fazer
            </CardTitle>
            <CardDescription>Ações que comprometem o crescimento e a imagem da pré campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DONT_DO_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${rule.severity === "critical" ? "border-red-500/40 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}
                >
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${rule.severity === "critical" ? "text-red-400" : "text-yellow-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{rule.rule}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rule.impact}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-auto flex-shrink-0 text-xs ${rule.severity === "critical" ? "border-red-500 text-red-400" : "border-yellow-500 text-yellow-400"}`}
                  >
                    {rule.severity === "critical" ? "Crítico" : "Aviso"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
