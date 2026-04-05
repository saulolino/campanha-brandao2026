// ============================================================
// DESIGN: Command Center Militar Verde
// Análise de Concorrentes — Comparativo visual
// ============================================================
import { useState } from "react";
import { COMPETITORS, OUR_PROFILE, COMPARISON_METRICS, OPPORTUNITIES, type Competitor } from "@/lib/competitors";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

function TrendIcon({ trend, percent }: { trend: string; percent: number }) {
  if (trend === "up") return <span className="flex items-center gap-0.5 text-[#2d6a4f] text-[10px]"><TrendingUp size={10} />+{percent}%</span>;
  if (trend === "down") return <span className="flex items-center gap-0.5 text-red-400 text-[10px]"><TrendingDown size={10} />{percent}%</span>;
  return <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]"><Minus size={10} />{percent}%</span>;
}

export default function CompetitorsSection() {
  const [expandedCompetitor, setExpandedCompetitor] = useState<number | null>(null);
  const [showOpportunities, setShowOpportunities] = useState(true);

  // Radar data
  const radarData = [
    { metric: "Seguidores", Eduardo: 10, ...Object.fromEntries(COMPETITORS.map((c) => [c.name, Math.min(100, (c.followers / 15800) * 100)])) },
    { metric: "Curtidas", Eduardo: 24, ...Object.fromEntries(COMPETITORS.map((c) => [c.name, Math.min(100, (c.avgLikes / 200) * 100)])) },
    { metric: "Comentários", Eduardo: 19, ...Object.fromEntries(COMPETITORS.map((c) => [c.name, Math.min(100, (c.avgComments / 35) * 100)])) },
    { metric: "Engajamento", Eduardo: 100, ...Object.fromEntries(COMPETITORS.map((c) => [c.name, Math.min(100, (c.engagementRate / 3.1) * 100)])) },
    { metric: "Frequência", Eduardo: 38, ...Object.fromEntries(COMPETITORS.map((c) => [c.name, Math.min(100, (c.postsPerWeek / 6) * 100)])) },
  ];

  // Bar chart data for engagement
  const engagementData = [
    { name: "Eduardo", value: OUR_PROFILE.engagementRate, color: OUR_PROFILE.color },
    ...COMPETITORS.map((c) => ({ name: c.name.split(" ")[1], value: c.engagementRate, color: c.color })),
  ].sort((a, b) => b.value - a.value);

  // Bar chart data for followers
  const followersData = [
    { name: "Eduardo", value: OUR_PROFILE.followers, color: OUR_PROFILE.color },
    ...COMPETITORS.map((c) => ({ name: c.name.split(" ")[1], value: c.followers, color: c.color })),
  ].sort((a, b) => b.value - a.value);

  const impactColors: Record<string, { bg: string; text: string }> = {
    alto: { bg: "#2d6a4f20", text: "#2d6a4f" },
    medio: { bg: "#c9a84c20", text: "#c9a84c" },
    baixo: { bg: "#e76f5120", text: "#e76f51" },
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">ANÁLISE DE CONCORRENTES</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Monitoramento competitivo</span>
      </div>

      {/* Eduardo vs Competitors overview */}
      <div className="bg-card rounded-xl border border-primary/20 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Posição de Eduardo Brandão</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {COMPARISON_METRICS.map((metric) => {
            const rank = [...metric.competitors, metric.eduardo].sort((a, b) => b - a).indexOf(metric.eduardo) + 1;
            const isFirst = rank === 1;
            return (
              <div key={metric.label} className={`rounded-lg border p-3 text-center ${isFirst ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</p>
                <p className={`text-xl font-mono font-bold ${isFirst ? "text-primary" : "text-foreground"}`}>
                  {typeof metric.eduardo === "number" && metric.eduardo % 1 !== 0 ? metric.eduardo.toFixed(1) : metric.eduardo.toLocaleString("pt-BR")}
                  {metric.unit}
                </p>
                <p className={`text-[9px] font-bold mt-1 ${isFirst ? "text-primary" : "text-muted-foreground"}`}>
                  {isFirst ? "1o LUGAR" : `${rank}o de 6`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Engagement comparison */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Taxa de Engajamento (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#999" }} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: "8px", fontSize: "11px" }}
                formatter={(value: number) => [`${value}%`, "Engajamento"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {engagementData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={entry.name === "Eduardo" ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Followers comparison */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Seguidores</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={followersData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#666" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#999" }} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: "8px", fontSize: "11px" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR"), "Seguidores"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {followersData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={entry.name === "Eduardo" ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitor cards */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Perfis Monitorados</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{COMPETITORS.length} concorrentes</span>
        </div>

        {COMPETITORS.map((comp) => (
          <div key={comp.id} className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-border/80">
            <button
              onClick={() => setExpandedCompetitor(expandedCompetitor === comp.id ? null : comp.id)}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: comp.color }}>
                {comp.name.split(" ")[1]?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{comp.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">{comp.party}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{comp.handle} — {comp.mainTheme}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-sm font-mono font-bold text-foreground">{comp.followers.toLocaleString("pt-BR")}</p>
                  <p className="text-[8px] text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-mono font-bold text-foreground">{comp.engagementRate}%</p>
                  <p className="text-[8px] text-muted-foreground">Engajamento</p>
                </div>
                <TrendIcon trend={comp.trend} percent={comp.trendPercent} />
              </div>
              {expandedCompetitor === comp.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
            </button>

            {expandedCompetitor === comp.id && (
              <div className="px-4 pb-4 pt-0 border-t border-border/50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 mb-3">
                  <div className="bg-muted/10 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Curtidas/Post</p>
                    <p className="text-lg font-mono font-bold text-foreground">{comp.avgLikes}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Coment./Post</p>
                    <p className="text-lg font-mono font-bold text-foreground">{comp.avgComments}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Posts/Semana</p>
                    <p className="text-lg font-mono font-bold text-foreground">{comp.postsPerWeek}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase">Tendência</p>
                    <TrendIcon trend={comp.trend} percent={comp.trendPercent} />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-[#2d6a4f] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"><Shield size={10} /> Pontos Fortes</p>
                    <ul className="space-y-1">
                      {comp.strengths.map((s, i) => (
                        <li key={i} className="text-[10px] text-foreground/70 flex items-start gap-1.5">
                          <span className="text-[#2d6a4f] mt-0.5">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1"><AlertTriangle size={10} /> Vulnerabilidades</p>
                    <ul className="space-y-1">
                      {comp.weaknesses.map((w, i) => (
                        <li key={i} className="text-[10px] text-foreground/70 flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">-</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Opportunities */}
      <div className="bg-card rounded-xl border border-primary/20 overflow-hidden">
        <button
          onClick={() => setShowOpportunities(!showOpportunities)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Oportunidades Identificadas</span>
            <span className="text-[10px] font-mono text-muted-foreground">{OPPORTUNITIES.length} oportunidades</span>
          </div>
          {showOpportunities ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {showOpportunities && (
          <div className="px-4 pb-4 space-y-3">
            {OPPORTUNITIES.map((opp, i) => {
              const impact = impactColors[opp.impact];
              return (
                <div key={i} className="bg-muted/5 rounded-lg border border-border/50 p-3">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: impact.bg, color: impact.text }}>
                      {opp.impact}
                    </span>
                    <h4 className="text-xs font-bold text-foreground">{opp.title}</h4>
                  </div>
                  <p className="text-[10px] text-foreground/60 mb-2">{opp.description}</p>
                  <div className="flex items-start gap-1.5 bg-primary/5 rounded-md p-2">
                    <Target size={10} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[10px] text-primary/80">{opp.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
