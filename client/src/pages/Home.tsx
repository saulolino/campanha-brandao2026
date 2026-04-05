// ============================================================
// DESIGN: Command Center Militar Verde
// Dashboard interno da campanha Eduardo Brandão
// Brasília Cidade Parque - Meta: 20.000 seguidores
// ============================================================
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import GaugeChart from "@/components/GaugeChart";
import AnimatedCounter from "@/components/AnimatedCounter";
import NextWeekSection from "@/components/NextWeekSection";
import ContentBankSection from "@/components/ContentBankSection";
import StatusTrackerSection from "@/components/StatusTrackerSection";
import MoodboardSection from "@/components/MoodboardSection";
import WeeklyReportSection from "@/components/WeeklyReportSection";
import MonthlyCalendarSection from "@/components/MonthlyCalendarSection";
import CompetitorsSection from "@/components/CompetitorsSection";
import NotificationsSection from "@/components/NotificationsSection";
import RealTimeMetricsSection from "@/components/RealTimeMetricsSection";
import PresentationMode from "@/components/PresentationMode";
import CreativeBriefingSection from "@/components/CreativeBriefingSection";
import SupportersPage from "@/components/SupportersPage";
import {
  CAMPAIGN,
  MONTHLY_PROJECTION,
  PILLARS,
  WEEKLY_SCHEDULE,
  KPIS,
  TEAM,
  BUDGET,
  DONT_DO_RULES,
  CONTENT_PILLARS,
  VIRAL_TYPES,
  CHECKLIST_ITEMS,
  POSTS_2026,
  INSTAGRAM_REAL,
} from "@/lib/campaignData";
import {
  UserPlus,
  TrendingUp,
  Target,
  Calendar,
  Heart,
  MessageCircle,
  Eye,
  Zap,
  DollarSign,
  Users,
  Star,
  Share2,
  Globe,
  Bookmark,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Wifi,
  Presentation,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const iconMap: Record<string, any> = {
  UserPlus, Heart, MessageCircle, TrendingUp, Eye, Zap, Bookmark, Share2,
  DollarSign, Users, Star, Globe,
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showPresentation, setShowPresentation] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    sectionRefs.current[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(CAMPAIGN.endDate);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.ceil(daysRemaining / 7);
  const progressPercent = Math.min(((CAMPAIGN.totalDays - daysRemaining) / CAMPAIGN.totalDays) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      <PresentationMode isOpen={showPresentation} onClose={() => setShowPresentation(false)} />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="pl-10 lg:pl-0">
              <h2 className="text-sm font-bold text-foreground tracking-tight">PAINEL DE COMANDO</h2>
              <p className="text-[10px] text-muted-foreground">Campanha Eduardo Brandão - Brasília Cidade Parque</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-card px-3 py-1.5 rounded-md border border-border">
                <Clock size={12} className="text-primary" />
                <span className="text-xs font-mono text-muted-foreground">
                  <span className="text-primary font-bold">{daysRemaining}</span> dias restantes
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-[#2d6a4f]/15 px-3 py-1.5 rounded-md border border-[#2d6a4f]/30">
                <Wifi size={12} className="text-[#2d6a4f]" />
                <span className="text-[10px] font-mono text-[#2d6a4f] font-bold">DADOS REAIS</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                <Target size={12} className="text-primary" />
                <span className="text-xs font-mono text-primary font-bold">META: 20.000</span>
              </div>
              <button
                onClick={() => setShowPresentation(true)}
                className="flex items-center gap-1.5 bg-[#c9a84c]/15 px-3 py-1.5 rounded-md border border-[#c9a84c]/30 hover:bg-[#c9a84c]/25 transition-colors"
              >
                <Presentation size={12} className="text-[#c9a84c]" />
                <span className="text-[10px] font-mono text-[#c9a84c] font-bold hidden sm:inline">APRESENTAR</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          {/* ============ DASHBOARD ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["dashboard"] = el; }}>
            {/* Hero banner */}
            <div className="relative rounded-xl overflow-hidden mb-6 h-40 lg:h-48">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/header-brasilia-sketch-NcazQTSj2yHumWs7WBRG7t.webp"
                alt="Brasília Cidade Parque"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center px-6 lg:px-10">
                <div>
                  <p className="text-primary text-xs font-mono tracking-[0.3em] uppercase mb-1">Campanha 2026</p>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
                    Brasília Cidade Parque
                  </h1>
                  <p className="text-white/70 text-sm mt-1">Eduardo Brandão - Deputado Distrital</p>
                </div>
              </div>
            </div>

            {/* Main metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <MetricCard
                title="Seguidores Atuais"
                value={CAMPAIGN.currentFollowers}
                icon={Users}
                subtitle="Base inicial"
                status="ok"
              />
              <MetricCard
                title="Meta Final"
                value={CAMPAIGN.targetFollowers}
                icon={Target}
                subtitle="Outubro 2026"
                status="ok"
              />
              <MetricCard
                title="Crescimento Necessário"
                value={CAMPAIGN.targetFollowers - CAMPAIGN.currentFollowers}
                prefix="+"
                icon={TrendingUp}
                subtitle="+1.229%"
                status="warning"
              />
              <MetricCard
                title="Crescimento/Semana"
                value={CAMPAIGN.weeklyGrowth}
                prefix="+"
                icon={ArrowUpRight}
                subtitle={`${CAMPAIGN.dailyGrowth}/dia`}
                status="ok"
              />
            </div>

            {/* Progress + Gauges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Progress bar */}
              <div className="lg:col-span-2 bg-card rounded-lg p-5 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground">PROGRESSO DA CAMPANHA</h3>
                  <span className="text-xs font-mono text-primary">{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #2d6a4f, #40916c, #52b788)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>25 Abr 2026</span>
                  <span className="text-primary font-bold">{daysRemaining} dias restantes</span>
                  <span>31 Out 2026</span>
                </div>

                {/* Timeline markers */}
                <div className="mt-5 grid grid-cols-7 gap-1">
                  {MONTHLY_PROJECTION.map((m, i) => {
                    const monthProgress = ((i + 1) / MONTHLY_PROJECTION.length) * 100;
                    const isPast = monthProgress <= progressPercent;
                    return (
                      <div key={m.month} className="text-center">
                        <div className={`w-full h-1.5 rounded-full mb-1 ${isPast ? "bg-primary" : "bg-muted"}`} />
                        <span className="text-[9px] font-mono text-muted-foreground">{m.month}</span>
                        <p className="text-[9px] font-mono text-foreground/70">{m.total.toLocaleString("pt-BR")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gauges */}
              <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">INDICADORES</h3>
                <div className="grid grid-cols-2 gap-4">
                  <GaugeChart
                    value={CAMPAIGN.currentFollowers}
                    max={CAMPAIGN.targetFollowers}
                    label="Seguidores"
                    sublabel={`${CAMPAIGN.currentFollowers.toLocaleString("pt-BR")} / ${CAMPAIGN.targetFollowers.toLocaleString("pt-BR")}`}
                    color="#2d6a4f"
                  />
                  <GaugeChart
                    value={CAMPAIGN.totalDays - daysRemaining}
                    max={CAMPAIGN.totalDays}
                    label="Tempo"
                    sublabel={`${daysRemaining} dias restantes`}
                    color="#c9a84c"
                  />
                  <GaugeChart
                    value={47.4}
                    max={80}
                    label="Curtidas/Post"
                    sublabel="Meta: 80+"
                    color="#40916c"
                  />
                  <GaugeChart
                    value={7.4}
                    max={15}
                    label="Comentários"
                    sublabel="Meta: 15+"
                    color="#52b788"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============ PRÓXIMA SEMANA ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["nextweek"] = el; }}>
            <NextWeekSection />
          </section>

          {/* ============ CRESCIMENTO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["growth"] = el; }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-foreground">PROJEÇÃO DE CRESCIMENTO</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Area chart */}
              <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Seguidores Projetados
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={MONTHLY_PROJECTION}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.015 250)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a8a9a" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8a8a9a" }} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.19 0.018 250)",
                        border: "1px solid oklch(0.30 0.015 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#2d6a4f"
                      strokeWidth={2}
                      fill="url(#greenGrad)"
                      name="Total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart - growth per month */}
              <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Crescimento Mensal
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={MONTHLY_PROJECTION}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.015 250)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8a8a9a" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8a8a9a" }} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.19 0.018 250)",
                        border: "1px solid oklch(0.30 0.015 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="growth" fill="#2d6a4f" radius={[4, 4, 0, 0]} name="Crescimento" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly projection table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Detalhamento Mensal
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Período</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Crescimento</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Total</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Investimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHLY_PROJECTION.map((m) => (
                      <tr key={m.month} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{m.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-primary">+{m.growth.toLocaleString("pt-BR")}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{m.total.toLocaleString("pt-BR")}</td>
                        <td className="px-4 py-3 text-right font-mono text-accent">R$ {m.investment.toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ============ PILARES ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["pillars"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-foreground">8 PILARES DE AMPLIFICAÇÃO</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PILLARS.map((pillar) => {
                const Icon = iconMap[pillar.icon] || Zap;
                return (
                  <div
                    key={pillar.id}
                    className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-all duration-200 group"
                    style={{ borderLeftColor: pillar.color, borderLeftWidth: "3px" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: pillar.color + "20" }}
                      >
                        <Icon size={16} style={{ color: pillar.color }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{pillar.percentage}</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-1">{pillar.name}</h4>
                    <p className="text-[11px] text-muted-foreground mb-3">{pillar.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary">
                        +{pillar.growthMin}-{pillar.growthMax}/mês
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-2">{pillar.responsible}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ============ CALENDÁRIO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["calendar"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-accent rounded-full" />
              <h2 className="text-lg font-bold text-foreground">CALENDÁRIO SEMANAL</h2>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <p className="text-xs text-muted-foreground">
                  Estrutura semanal de publicações — 3 posts/semana (TER, QUI, SAB)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase w-16">Dia</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Conteúdo</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Amplificação</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Engajamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKLY_SCHEDULE.map((day) => {
                      const isPostDay = ["TER", "QUI", "SAB"].includes(day.day);
                      return (
                        <tr
                          key={day.day}
                          className={`border-b border-border/50 transition-colors ${
                            isPostDay ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className={`text-xs font-mono font-bold ${isPostDay ? "text-primary" : "text-muted-foreground"}`}>
                              {day.day}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground text-xs">{day.content}</td>
                          <td className="px-4 py-3 text-foreground/80 text-xs">{day.amplification}</td>
                          <td className="px-4 py-3 text-foreground/80 text-xs">{day.engagement}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ============ CALENDÁRIO MENSAL ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["monthlycal"] = el; }}>
            <div className="mt-6"><MonthlyCalendarSection /></div>
          </section>

          {/* ============ CONTEÚDO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["content"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-foreground">PILARES DE CONTEÚDO</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Content pillars */}
              <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Distribuição de Conteúdo
                </h3>
                <div className="space-y-3">
                  {CONTENT_PILLARS.map((p) => (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{p.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">{p.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart */}
              <div className="bg-card rounded-lg p-5 border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Proporção Visual
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={CONTENT_PILLARS}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="percentage"
                      nameKey="name"
                      strokeWidth={2}
                      stroke="oklch(0.19 0.018 250)"
                    >
                      {CONTENT_PILLARS.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.19 0.018 250)",
                        border: "1px solid oklch(0.30 0.015 250)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {CONTENT_PILLARS.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                      <span className="text-[10px] text-muted-foreground">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Viral types */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tipos de Conteúdo Viral
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border">
                {VIRAL_TYPES.map((v) => (
                  <div key={v.type} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={14} className="text-accent" />
                      <h4 className="text-xs font-bold text-foreground">{v.type}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{v.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        v.potential === "Muito Alto"
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                      }`}>
                        {v.potential}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{v.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts 2026 reference */}
            <div className="bg-card rounded-lg border border-border overflow-hidden mt-4">
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Referência: Posts de 2026 (Base de Análise)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Data</th>
                      <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Tipo</th>
                      <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Tema</th>
                      <th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Curtidas</th>
                      <th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Comentários</th>
                      <th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Alcance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POSTS_2026.map((post, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{post.date}</td>
                        <td className="px-4 py-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            post.type === "VIDEO" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                          }`}>
                            {post.type === "VIDEO" ? "Vídeo" : "Carrossel"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-foreground">{post.caption}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-foreground">{post.likes}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-foreground">{post.comments}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-primary">{post.reach}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ============ BANCO DE CONTEÚDO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["contentbank"] = el; }}>
            <ContentBankSection />
          </section>

          {/* ============ STATUS DOS POSTS ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["tracker"] = el; }}>
            <StatusTrackerSection />
          </section>

          {/* ============ REFERÊNCIAS VISUAIS ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["moodboard"] = el; }}>
            <MoodboardSection />
          </section>

          {/* ============ RELATÓRIO SEMANAL ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["report"] = el; }}>
            <WeeklyReportSection />
          </section>

          {/* ============ EQUIPE ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["team"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-foreground">EQUIPE NECESSÁRIA</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estrutura</h3>
                  <span className="text-xs font-mono text-primary">170h/semana (2,1 FTE)</span>
                </div>
                <div className="divide-y divide-border/50">
                  {TEAM.map((member) => (
                    <div key={member.role} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{member.role}</span>
                        <span className="text-xs font-mono text-accent">{member.hours}h/sem</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{member.responsibilities}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    KPIs Principais
                  </h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
                  {KPIS.map((kpi) => {
                    const Icon = iconMap[kpi.icon] || Target;
                    return (
                      <div key={kpi.name} className="p-4 hover:bg-muted/20 transition-colors">
                        <Icon size={16} className="text-primary mb-2" />
                        <p className="text-xs font-medium text-foreground mb-0.5">{kpi.name}</p>
                        <p className="text-sm font-mono font-bold text-primary">{kpi.target}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ============ ORÇAMENTO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["budget"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-accent rounded-full" />
              <h2 className="text-lg font-bold text-foreground">ORÇAMENTO MENSAL</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Item</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Mínimo</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Máximo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BUDGET.map((b) => (
                        <tr key={b.item} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3 text-foreground text-xs font-medium">{b.item}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                            R$ {b.min.toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-accent">
                            R$ {b.max.toLocaleString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-bold">
                        <td className="px-4 py-3 text-foreground text-xs">TOTAL MENSAL</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                          R$ {BUDGET.reduce((s, b) => s + b.min, 0).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-accent">
                          R$ {BUDGET.reduce((s, b) => s + b.max, 0).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Budget summary */}
              <div className="space-y-3">
                <div className="bg-card rounded-lg p-5 border border-border glow-gold">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Investimento Total (7 meses)</p>
                  <p className="text-2xl font-mono font-bold text-accent">
                    R$ 258k - 328k
                  </p>
                </div>
                <div className="bg-card rounded-lg p-5 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ads Mensal</p>
                  <p className="text-xl font-mono font-bold text-primary">R$ 2.500</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Total Ads: ~R$ 16.500</p>
                </div>
                <div className="bg-card rounded-lg p-5 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Custo por Seguidor</p>
                  <p className="text-xl font-mono font-bold text-foreground">R$ 14 - 18</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Estimativa média</p>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CONCORRENTES ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["competitors"] = el; }}>
            <div className="mt-6"><CompetitorsSection /></div>
          </section>

          {/* ============ ALERTAS (O QUE NÃO FAZER) ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["donts"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-destructive rounded-full" />
              <h2 className="text-lg font-bold text-foreground">ALERTAS: O QUE NÃO FAZER</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DONT_DO_RULES.map((rule, i) => (
                <div
                  key={i}
                  className={`bg-card rounded-lg p-4 border transition-colors hover:bg-card/80 ${
                    rule.severity === "critical"
                      ? "border-destructive/30 status-critical"
                      : "border-accent/30 status-warning"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {rule.severity === "critical" ? (
                      <XCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-accent mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">{rule.rule}</p>
                      <p className="text-[11px] text-muted-foreground">{rule.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============ NOTIFICAÇÕES ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["notifications"] = el; }}>
            <div className="mt-6"><NotificationsSection /></div>
          </section>

          {/* ============ MÉTRICAS EM TEMPO REAL ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["realtime"] = el; }}>
            <div className="mt-6"><RealTimeMetricsSection /></div>
          </section>

          {/* ============ BRIEFING CRIATIVO ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["briefing"] = el; }}>
            <div className="mt-6"><CreativeBriefingSection /></div>
          </section>

          {/* ============ APOIADORES ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["supporters"] = el; }}>
            <div className="mt-6"><SupportersPage /></div>
          </section>

          {/* ============ CHECKLIST ============ */}
          <section ref={(el: HTMLElement | null) => { sectionRefs.current["checklist"] = el; }}>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-foreground">CHECKLIST ANTES DE PUBLICAR</h2>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs text-muted-foreground mb-4">
                Antes de publicar QUALQUER post, verifique todos os itens abaixo:
              </p>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      item.critical ? "border-destructive/50" : "border-primary/50"
                    }`}>
                      <CheckCircle2 size={12} className="text-muted-foreground/30" />
                    </div>
                    <span className="text-sm text-foreground">{item.question}</span>
                    {item.critical && (
                      <span className="text-[9px] font-mono bg-destructive/20 text-destructive px-1.5 py-0.5 rounded ml-auto shrink-0">
                        CRÍTICO
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium">
                  Se responder NÃO para qualquer item CRÍTICO → NÃO PUBLICAR
                </p>
              </div>
            </div>
          </section>

          {/* Footer illustration */}
          <div className="mt-8 mb-4">
            <div className="relative rounded-xl overflow-hidden h-32">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/park-illustration-RAiSq2G3JVKt5Tt2TpZdcG.webp"
                alt="Brasília Cidade Parque"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs font-mono text-primary tracking-[0.3em] uppercase">Juntos por uma</p>
                  <p className="text-lg font-bold text-foreground">Brasília Cidade Parque</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Painel Interno - Campanha Eduardo Brandão 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
