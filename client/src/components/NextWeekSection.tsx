// ============================================================
// DESIGN: Command Center Militar Verde
// Seção "Próxima Semana" com propostas visuais e textuais
// ============================================================
import { useState } from "react";
import { APRIL_WEEKS, type WeekPlan, type PostProposal } from "@/lib/weeklyContent";
import {
  CalendarClock,
  Video,
  Image,
  Film,
  Target,
  Hash,
  MessageSquare,
  Eye,
  Heart,
  Megaphone,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Users,
  AlertCircle,
  Camera,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Flame,
} from "lucide-react";

const PILLAR_CONFIG = {
  causa: { label: "Causa", color: "#2d6a4f", bg: "bg-[#2d6a4f]/15", text: "text-[#2d6a4f]", border: "border-[#2d6a4f]/30" },
  explicacao: { label: "Explicação", color: "#40916c", bg: "bg-[#40916c]/15", text: "text-[#40916c]", border: "border-[#40916c]/30" },
  humano: { label: "Humano", color: "#c9a84c", bg: "bg-[#c9a84c]/15", text: "text-[#c9a84c]", border: "border-[#c9a84c]/30" },
  mobilizacao: { label: "Mobilização", color: "#e76f51", bg: "bg-[#e76f51]/15", text: "text-[#e76f51]", border: "border-[#e76f51]/30" },
};

const FORMAT_ICON = {
  VIDEO: Video,
  CAROUSEL: Image,
  REEL: Film,
};

function PostCard({ post, index }: { post: PostProposal; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const pillar = PILLAR_CONFIG[post.pillar];
  const FormatIcon = FORMAT_ICON[post.format];

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/20"
      style={{ borderLeftWidth: "4px", borderLeftColor: pillar.color }}
    >
      {/* Header */}
      <div className="p-5">
        {/* Top row: date + badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <CalendarClock size={12} className="text-primary" />
              <span className="text-xs font-mono font-bold text-foreground">{post.dayOfWeek}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-xs font-mono text-muted-foreground">{post.date}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
              <Clock size={12} className="text-accent" />
              <span className="text-xs font-mono text-foreground">{post.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.boost && (
              <div className="flex items-center gap-1 bg-accent/15 px-2 py-1 rounded-md border border-accent/20">
                <DollarSign size={11} className="text-accent" />
                <span className="text-[10px] font-mono font-bold text-accent">R$ {post.boostBudget}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pillar + Format badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ backgroundColor: pillar.color + "20", color: pillar.color }}
          >
            {post.pillarLabel}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">
            <FormatIcon size={10} />
            {post.formatLabel}
          </span>
          {post.targetLikes >= 90 && (
            <span className="flex items-center gap-1 text-[10px] font-mono bg-destructive/15 px-2 py-0.5 rounded text-destructive">
              <Flame size={10} />
              VIRAL
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-2 leading-snug">{post.title}</h3>

        {/* Objective */}
        <div className="flex items-start gap-2 mb-3">
          <Target size={13} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">{post.objective}</p>
        </div>

        {/* Metrics targets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/30 rounded-md p-2 text-center">
            <Eye size={13} className="text-primary mx-auto mb-1" />
            <p className="text-sm font-mono font-bold text-foreground">{post.targetReach.toLocaleString("pt-BR")}</p>
            <p className="text-[9px] text-muted-foreground">Alcance</p>
          </div>
          <div className="bg-muted/30 rounded-md p-2 text-center">
            <Heart size={13} className="text-destructive mx-auto mb-1" />
            <p className="text-sm font-mono font-bold text-foreground">{post.targetLikes}</p>
            <p className="text-[9px] text-muted-foreground">Curtidas</p>
          </div>
          <div className="bg-muted/30 rounded-md p-2 text-center">
            <MessageSquare size={13} className="text-accent mx-auto mb-1" />
            <p className="text-sm font-mono font-bold text-foreground">{post.targetComments}</p>
            <p className="text-[9px] text-muted-foreground">Comentários</p>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-xs text-muted-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} />
              Recolher detalhes
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Ver proposta completa
            </>
          )}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Caption */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Legenda Sugerida</h4>
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{post.caption}</p>
            </div>
            {/* Hashtags */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <Hash size={12} className="text-primary shrink-0" />
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Visual description */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Camera size={14} className="text-accent" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Direção Visual</h4>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{post.visualDescription}</p>
          </div>

          {/* CTA */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone size={14} className="text-destructive" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Call to Action</h4>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-sm font-medium text-primary">{post.cta}</p>
            </div>
          </div>

          {/* Stories companion */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={14} className="text-[#c9a84c]" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Stories Complementares</h4>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{post.storyCompanion}</p>
          </div>

          {/* Notes */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-accent" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Observações da Equipe</h4>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
              <p className="text-xs text-accent leading-relaxed">{post.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NextWeekSection() {
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const selectedWeek = APRIL_WEEKS[selectedWeekIdx];

  const totalBoost = selectedWeek.posts.reduce((sum, p) => sum + (p.boostBudget || 0), 0);
  const totalReach = selectedWeek.posts.reduce((sum, p) => sum + p.targetReach, 0);
  const totalLikes = selectedWeek.posts.reduce((sum, p) => sum + p.targetLikes, 0);
  const totalComments = selectedWeek.posts.reduce((sum, p) => sum + p.targetComments, 0);
  const viralPosts = selectedWeek.posts.filter((p) => p.targetLikes >= 90).length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">PRÓXIMA SEMANA</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Abril 2026</span>
      </div>

      {/* Week selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        {APRIL_WEEKS.map((week, idx) => (
          <button
            key={week.id}
            onClick={() => setSelectedWeekIdx(idx)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 ${
              idx === selectedWeekIdx
                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                : "bg-card border-border hover:border-primary/20 hover:bg-card/80"
            }`}
          >
            <p className={`text-xs font-bold ${idx === selectedWeekIdx ? "text-primary" : "text-foreground"}`}>
              {week.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{week.dateRange}</p>
          </button>
        ))}
      </div>

      {/* Week theme banner */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
              Tema da Semana {selectedWeek.weekNumber}
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{selectedWeek.theme}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{selectedWeek.themeDescription}</p>

          {/* Week goal */}
          <div className="mt-4 flex items-start gap-2 bg-primary/10 rounded-lg p-3 border border-primary/20">
            <Target size={14} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Objetivo da Semana</p>
              <p className="text-xs text-foreground/80">{selectedWeek.weeklyGoal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-card rounded-lg p-3 border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Posts</p>
          <p className="text-xl font-mono font-bold text-foreground">{selectedWeek.posts.length}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Alcance Projetado</p>
          <p className="text-xl font-mono font-bold text-primary">{totalReach.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Curtidas Projetadas</p>
          <p className="text-xl font-mono font-bold text-foreground">{totalLikes}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Investimento Ads</p>
          <p className="text-xl font-mono font-bold text-accent">R$ {totalBoost}</p>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Meta Seguidores</p>
          <p className="text-xl font-mono font-bold text-primary">{selectedWeek.followersTarget.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Timeline visual */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Linha do Tempo da Semana</h4>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-0">
            {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((day) => {
              const post = selectedWeek.posts.find((p) => {
                const dayMap: Record<string, string> = {
                  "Segunda-feira": "SEG", "Terça-feira": "TER", "Quarta-feira": "QUA",
                  "Quinta-feira": "QUI", "Sexta-feira": "SEX", "Sábado": "SAB", "Domingo": "DOM",
                };
                return dayMap[p.dayOfWeek] === day;
              });
              const isPostDay = !!post;

              return (
                <div key={day} className="flex items-center gap-4 py-2">
                  {/* Dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isPostDay ? "bg-primary/20 border-2 border-primary" : "bg-muted/30 border border-border"
                  }`}>
                    <span className={`text-[9px] font-mono font-bold ${isPostDay ? "text-primary" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                  </div>

                  {/* Content */}
                  {isPostDay && post ? (
                    <div className="flex-1 flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2">
                      <div
                        className="w-1 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: PILLAR_CONFIG[post.pillar].color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{post.title}</p>
                        <p className="text-[10px] text-muted-foreground">{post.time} · {post.formatLabel}</p>
                      </div>
                      {post.boost && (
                        <span className="text-[9px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                          ADS
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground/50 italic">
                        {day === "SEG" ? "Planejamento e análise" :
                         day === "QUA" ? "Behind-the-scenes + Stories" :
                         day === "SEX" ? "Engajamento e parcerias" :
                         "Análise e planejamento"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ArrowRight size={12} className="text-primary" />
          Propostas Detalhadas ({selectedWeek.posts.length} posts)
        </h4>
        {selectedWeek.posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Month note */}
      <div className="mt-6 bg-muted/20 rounded-lg p-4 border border-border">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Planejamento mensal</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              As propostas de conteúdo são geradas para o mês vigente (Abril 2026). Os meses seguintes (Maio a Outubro) serão
              planejados quando cada mês chegar, garantindo que o conteúdo esteja sempre atualizado e relevante ao contexto atual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
