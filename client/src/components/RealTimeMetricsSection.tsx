// ============================================================
// DESIGN: Command Center Militar Verde
// Métricas em Tempo Real
// ============================================================
import { useState } from "react";
import {
  METRIC_HISTORY,
  WEEKLY_COMPARISON,
  RECENT_POSTS,
  LAST_UPDATE,
  NEXT_UPDATE,
} from "@/lib/realTimeMetrics";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronDown,
  ChevronUp,
  Wifi,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  above: { bg: "bg-[#2d6a4f]/15", text: "text-[#2d6a4f]", label: "ACIMA" },
  on_track: { bg: "bg-blue-400/15", text: "text-blue-400", label: "NA META" },
  below: { bg: "bg-red-400/15", text: "text-red-400", label: "ABAIXO" },
};

export default function RealTimeMetricsSection() {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const chartData = METRIC_HISTORY.map((m) => ({
    date: m.date.split("-").slice(1).join("/"),
    Seguidores: m.followers,
    Curtidas: m.likes,
    Alcance: m.reach,
    Engajamento: m.engagement,
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">MÉTRICAS EM TEMPO REAL</h2>
        <div className="flex items-center gap-1 ml-2">
          <Wifi size={10} className="text-[#2d6a4f] animate-pulse" />
          <span className="text-[9px] font-mono text-[#2d6a4f]">CONECTADO</span>
        </div>
      </div>

      {/* Update status bar */}
      <div className="bg-card rounded-xl border border-primary/20 p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <RefreshCw size={12} className="text-primary" />
            <span className="text-[10px] text-muted-foreground">Última atualização:</span>
            <span className="text-[10px] font-mono font-bold text-foreground">{LAST_UPDATE}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Próxima:</span>
            <span className="text-[10px] font-mono text-foreground">{NEXT_UPDATE}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#2d6a4f]/10 px-2 py-1 rounded-md">
          <Activity size={10} className="text-[#2d6a4f]" />
          <span className="text-[9px] font-bold text-[#2d6a4f]">SEMANAL</span>
        </div>
      </div>

      {/* Weekly comparison cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {WEEKLY_COMPARISON.map((metric) => {
          const isPositive = metric.change >= 0;
          const progressPercent = Math.min(100, (metric.current / metric.target) * 100);
          return (
            <div key={metric.metric} className="bg-card rounded-xl border border-border p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{metric.metric}</p>
              <div className="flex items-end gap-2 mb-1.5">
                <span className="text-xl font-mono font-bold text-foreground">
                  {typeof metric.current === "number" && metric.current % 1 !== 0
                    ? metric.current.toFixed(1)
                    : metric.current.toLocaleString("pt-BR")}
                  {metric.unit}
                </span>
                <span className={`text-[10px] font-mono flex items-center gap-0.5 mb-0.5 ${isPositive ? "text-[#2d6a4f]" : "text-red-400"}`}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isPositive ? "+" : ""}{metric.changePercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressPercent >= 80 ? "bg-[#2d6a4f]" : progressPercent >= 50 ? "bg-yellow-500" : "bg-red-400"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-muted-foreground shrink-0">
                  {progressPercent.toFixed(0)}% da meta
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] text-muted-foreground">
                  Anterior: {typeof metric.previous === "number" && metric.previous % 1 !== 0 ? metric.previous.toFixed(1) : metric.previous.toLocaleString("pt-BR")}{metric.unit}
                </span>
                <span className="text-[8px] text-primary/60">
                  Meta: {typeof metric.target === "number" && metric.target % 1 !== 0 ? metric.target.toFixed(1) : metric.target.toLocaleString("pt-BR")}{metric.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Followers trend */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Evolução de Seguidores</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#666" }} />
              <YAxis domain={["dataMin - 10", "dataMax + 10"]} tick={{ fontSize: 9, fill: "#666" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: "8px", fontSize: "11px" }} />
              <Area type="monotone" dataKey="Seguidores" stroke="#2d6a4f" fill="url(#gradFollowers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement trend */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Engajamento (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#666" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 9, fill: "#666" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: "8px", fontSize: "11px" }} />
              <Line type="monotone" dataKey="Engajamento" stroke="#c9a84c" strokeWidth={2} dot={{ fill: "#c9a84c", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent posts performance */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Performance dos Posts Recentes</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{RECENT_POSTS.length} posts</span>
        </div>

        <div className="space-y-2">
          {RECENT_POSTS.map((post) => {
            const status = statusColors[post.status];
            const isExpanded = expandedPost === post.id;
            return (
              <div key={post.id} className="bg-muted/5 rounded-lg border border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">{post.title}</p>
                    <p className="text-[9px] text-muted-foreground">{post.date} — {post.type}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Heart size={10} className="text-red-400" />
                      <span className="text-[10px] font-mono text-foreground">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={10} className="text-blue-400" />
                      <span className="text-[10px] font-mono text-foreground">{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={10} className="text-muted-foreground" />
                      <span className="text-[10px] font-mono text-foreground">{post.reach}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/30 pt-2">
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { icon: Heart, label: "Curtidas", value: post.likes, color: "text-red-400" },
                        { icon: MessageCircle, label: "Comentários", value: post.comments, color: "text-blue-400" },
                        { icon: Eye, label: "Alcance", value: post.reach, color: "text-[#2d6a4f]" },
                        { icon: Activity, label: "Impressões", value: post.impressions, color: "text-yellow-400" },
                        { icon: Bookmark, label: "Salvos", value: post.saves, color: "text-purple-400" },
                        { icon: Share2, label: "Compartilh.", value: post.shares, color: "text-orange-400" },
                      ].map((m) => (
                        <div key={m.label} className="bg-muted/10 rounded-md p-2 text-center">
                          <m.icon size={12} className={`${m.color} mx-auto mb-1`} />
                          <p className="text-sm font-mono font-bold text-foreground">{m.value}</p>
                          <p className="text-[8px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground">Taxa de engajamento:</span>
                      <span className={`text-[10px] font-mono font-bold ${post.engagementRate >= 3 ? "text-[#2d6a4f]" : post.engagementRate >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                        {post.engagementRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
