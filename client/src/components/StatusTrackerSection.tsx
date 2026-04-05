// ============================================================
// DESIGN: Command Center Militar Verde
// Painel de Acompanhamento de Status — Tracker de Posts
// ============================================================
import { useState } from "react";
import {
  TRACKED_POSTS,
  WEEKLY_GOALS,
  STATUS_CONFIG,
  type PostStatus,
  type TrackedPost,
} from "@/lib/statusTracker";
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  ArrowRight,
  BarChart3,
  Zap,
} from "lucide-react";

// ============================================================
// Status selector
// ============================================================
function StatusBadge({ status, onStatusChange }: { status: PostStatus; onStatusChange?: (s: PostStatus) => void }) {
  const [open, setOpen] = useState(false);
  const config = STATUS_CONFIG[status];
  const allStatuses: PostStatus[] = ["planejado", "em_producao", "aprovado", "publicado", "cancelado"];

  return (
    <div className="relative">
      <button
        onClick={() => onStatusChange && setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all hover:brightness-110"
        style={{ backgroundColor: config.bgColor, color: config.color, borderColor: config.color + "40" }}
      >
        <span>{config.icon}</span>
        {config.label}
        {onStatusChange && <ChevronDown size={10} />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden min-w-[160px]">
            {allStatuses.map((s) => {
              const c = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => { onStatusChange?.(s); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-muted/30 ${status === s ? "bg-muted/20" : ""}`}
                >
                  <span>{c.icon}</span>
                  <span style={{ color: c.color }} className="font-medium">{c.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Metric comparison
// ============================================================
function MetricComparison({ label, meta, real, icon: Icon }: { label: string; meta: number; real?: number; icon: React.ElementType }) {
  const hasReal = real !== undefined && real !== null;
  const diff = hasReal ? ((real - meta) / meta) * 100 : 0;
  const isPositive = diff >= 0;

  return (
    <div className="bg-muted/15 rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className="text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Meta</p>
          <p className="text-sm font-mono font-bold text-foreground">{meta.toLocaleString("pt-BR")}</p>
        </div>
        {hasReal ? (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Real</p>
            <p className="text-sm font-mono font-bold text-foreground">{real.toLocaleString("pt-BR")}</p>
            <div className={`flex items-center gap-0.5 justify-end ${isPositive ? "text-primary" : "text-destructive"}`}>
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span className="text-[9px] font-mono font-bold">{isPositive ? "+" : ""}{diff.toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Real</p>
            <p className="text-xs font-mono text-muted-foreground/50">Pendente</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Post card
// ============================================================
function PostCard({ post, onStatusChange }: { post: TrackedPost; onStatusChange: (id: string, s: PostStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const priorityColors = { alta: "#e76f51", media: "#c9a84c", baixa: "#6c757d" };
  const priorityLabels = { alta: "ALTA", media: "MÉDIA", baixa: "BAIXA" };
  const pColor = priorityColors[post.priority];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all">
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: pColor + "20", color: pColor }}>
                {priorityLabels[post.priority]}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{post.pillar}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{post.format}</span>
            </div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{post.title}</h3>
          </div>
          <StatusBadge status={post.status} onStatusChange={(s) => onStatusChange(post.id, s)} />
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Clock size={10} />{post.dayOfWeek} {post.date} - {post.time}</span>
          <span className="flex items-center gap-1"><User size={10} />{post.assignedTo}</span>
          {post.adBudget > 0 && <span className="flex items-center gap-1 text-accent"><DollarSign size={10} />R$ {post.adBudget}</span>}
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricComparison label="Alcance" meta={post.metaAlcance} real={post.realAlcance} icon={Eye} />
          <MetricComparison label="Curtidas" meta={post.metaCurtidas} real={post.realCurtidas} icon={Heart} />
          <MetricComparison label="Comentários" meta={post.metaComentarios} real={post.realComentarios} icon={MessageCircle} />
        </div>

        {/* Expand */}
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors text-[10px] text-muted-foreground">
          {expanded ? <><ChevronUp size={12} />Recolher</> : <><ChevronDown size={12} />Observações</>}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-accent" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Observações</span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">{post.notes}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Weekly summary card
// ============================================================
function WeeklySummary({ goals, posts }: { goals: typeof WEEKLY_GOALS[0]; posts: TrackedPost[] }) {
  const statusCounts = {
    planejado: posts.filter((p) => p.status === "planejado").length,
    em_producao: posts.filter((p) => p.status === "em_producao").length,
    aprovado: posts.filter((p) => p.status === "aprovado").length,
    publicado: posts.filter((p) => p.status === "publicado").length,
    cancelado: posts.filter((p) => p.status === "cancelado").length,
  };
  const completionRate = posts.length > 0 ? ((statusCounts.publicado / posts.length) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{goals.weekLabel}: {goals.dateRange}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{goals.totalPosts} posts planejados | Ads: R$ {goals.adBudgetTotal}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-primary">{completionRate.toFixed(0)}%</p>
          <p className="text-[9px] text-muted-foreground">Conclusão</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary/80 to-primary" style={{ width: `${completionRate}%` }} />
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.entries(statusCounts) as [PostStatus, number][]).filter(([, count]) => count > 0).map(([status, count]) => {
          const config = STATUS_CONFIG[status];
          return (
            <span key={status} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md" style={{ backgroundColor: config.bgColor, color: config.color }}>
              {config.icon} {count} {config.label}
            </span>
          );
        })}
      </div>

      {/* Weekly metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <MetricComparison label="Meta Seguidores" meta={goals.metaSeguidores} real={goals.realSeguidores} icon={Target} />
        <MetricComparison label="Alcance Total" meta={goals.metaAlcanceTotal} real={goals.realAlcanceTotal} icon={Eye} />
        <MetricComparison label="Curtidas Total" meta={goals.metaCurtidasTotal} real={goals.realCurtidasTotal} icon={Heart} />
        <MetricComparison label="Comentários Total" meta={goals.metaComentariosTotal} real={goals.realComentariosTotal} icon={MessageCircle} />
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function StatusTrackerSection() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [posts, setPosts] = useState(TRACKED_POSTS);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "todos">("todos");

  const weekGoals = WEEKLY_GOALS.find((w) => w.weekId === selectedWeek)!;
  const weekPosts = posts.filter((p) => p.weekId === selectedWeek);
  const filteredPosts = filterStatus === "todos" ? weekPosts : weekPosts.filter((p) => p.status === filterStatus);

  const handleStatusChange = (postId: string, newStatus: PostStatus) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));
  };

  // Overall stats
  const allPosts = posts;
  const totalPublicado = allPosts.filter((p) => p.status === "publicado").length;
  const totalEmProducao = allPosts.filter((p) => p.status === "em_producao").length;
  const totalAprovado = allPosts.filter((p) => p.status === "aprovado").length;
  const totalPlanejado = allPosts.filter((p) => p.status === "planejado").length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">ACOMPANHAMENTO DE STATUS</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Tracker de Posts</span>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{allPosts.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total de Posts</p>
          <div className="h-1 bg-muted/30 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(totalPublicado / allPosts.length) * 100}%` }} />
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-primary">{totalPublicado}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Publicados</p>
          <p className="text-[9px] font-mono text-primary mt-1">{((totalPublicado / allPosts.length) * 100).toFixed(0)}% do total</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-[#c9a84c]">{totalEmProducao + totalAprovado}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Em Andamento</p>
          <p className="text-[9px] font-mono text-[#c9a84c] mt-1">{totalEmProducao} produção + {totalAprovado} aprovado</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-muted-foreground">{totalPlanejado}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Planejados</p>
          <p className="text-[9px] font-mono text-muted-foreground mt-1">Aguardando início</p>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {WEEKLY_GOALS.map((w) => (
          <button
            key={w.weekId}
            onClick={() => setSelectedWeek(w.weekId)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              selectedWeek === w.weekId
                ? "bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20"
                : "bg-card border-border text-muted-foreground hover:border-primary/20"
            }`}
          >
            <span className="font-bold">{w.weekLabel}</span>
            <span className="ml-1.5 text-[10px] opacity-70">{w.dateRange}</span>
          </button>
        ))}
      </div>

      {/* Weekly summary */}
      <WeeklySummary goals={weekGoals} posts={weekPosts} />

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterStatus("todos")}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
            filterStatus === "todos" ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
          }`}
        >
          Todos ({weekPosts.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [PostStatus, typeof STATUS_CONFIG[PostStatus]][]).map(([key, config]) => {
          const count = weekPosts.filter((p) => p.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key as PostStatus)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
                filterStatus === key ? "border" : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
              }`}
              style={filterStatus === key ? { backgroundColor: config.bgColor, color: config.color, borderColor: config.color + "40" } : {}}
            >
              {config.icon} {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Post cards */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} onStatusChange={handleStatusChange} />
        ))}
        {filteredPosts.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Zap size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum post com este status nesta semana.</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="mt-4 bg-accent/5 rounded-lg border border-accent/20 p-4 flex items-start gap-3">
        <Zap size={16} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Dica de Uso</p>
          <p className="text-xs text-foreground/80">Clique no badge de status de cada post para atualizar entre "Planejado", "Em Produção", "Aprovado", "Publicado" ou "Cancelado". Quando o post for publicado, preencha os resultados reais para comparar com as metas.</p>
        </div>
      </div>
    </div>
  );
}
