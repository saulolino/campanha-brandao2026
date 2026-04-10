// DESIGN: Command Center Militar Verde
// Seção de depoimentos dos voluntários/apoiadores
import { useState } from "react";
import {
  Quote,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Award,
  Flame,
} from "lucide-react";
import {
  TESTIMONIALS,
  TESTIMONIAL_CATEGORIES,
  TESTIMONIALS_STATS,
  type Testimonial,
} from "@/lib/testimonials";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card/50 border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {testimonial.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-foreground">{testimonial.name}</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                {testimonial.levelEmoji} {testimonial.level}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {testimonial.role} — {testimonial.location}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-primary font-mono font-bold">{testimonial.xp.toLocaleString()} XP</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Flame size={10} className="text-orange-400" />
                {testimonial.daysActive}d seguidos
              </span>
            </div>
          </div>

          {/* Date */}
          <span className="text-[10px] text-muted-foreground shrink-0">{testimonial.date}</span>
        </div>
      </div>

      {/* Highlight */}
      <div className="px-4 pb-3">
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-md p-2.5">
          <Star size={14} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-foreground">{testimonial.highlight}</p>
        </div>
      </div>

      {/* Quote */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Quote size={16} className="text-primary/20 absolute -top-1 -left-1" />
          <p className={`text-xs text-muted-foreground leading-relaxed pl-5 ${!expanded ? "line-clamp-3" : ""}`}>
            {testimonial.quote}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 mt-1.5 pl-5 font-medium transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Menos
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Ler mais
            </>
          )}
        </button>
      </div>

      {/* Impact */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-[10px] text-green-400/80 uppercase tracking-wider font-medium">
              {testimonial.impact.label}
            </span>
          </div>
          <span className="text-sm font-bold text-green-400 font-mono">{testimonial.impact.value}</span>
        </div>
      </div>

      {/* Category badge */}
      <div className="px-4 pb-3">
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
          testimonial.category === "engajamento" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
          testimonial.category === "recrutamento" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
          testimonial.category === "comunidade" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
          "bg-pink-500/10 text-pink-400 border border-pink-500/20"
        }`}>
          {TESTIMONIAL_CATEGORIES.find(c => c.id === testimonial.category)?.emoji}{" "}
          {TESTIMONIAL_CATEGORIES.find(c => c.id === testimonial.category)?.label}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState("todos");

  const filtered = activeCategory === "todos"
    ? TESTIMONIALS
    : TESTIMONIALS.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">DEPOIMENTOS DOS APOIADORES</h2>
            <p className="text-xs text-muted-foreground">Relatos reais do impacto das ações de engajamento</p>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <Users size={16} className="text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">{TESTIMONIALS_STATS.totalTestimonials}</p>
          <p className="text-[10px] text-muted-foreground">Depoimentos</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <TrendingUp size={16} className="text-green-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-green-400 font-mono">{TESTIMONIALS_STATS.totalImpact}</p>
          <p className="text-[10px] text-muted-foreground">Impacto Total</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <Flame size={16} className="text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">{TESTIMONIALS_STATS.avgDaysActive.toFixed(0)}d</p>
          <p className="text-[10px] text-muted-foreground">Média Ativa</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <Heart size={16} className="text-red-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground font-mono">{TESTIMONIALS_STATS.topCategory}</p>
          <p className="text-[10px] text-muted-foreground">Top Categoria</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <Award size={16} className="text-yellow-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-primary font-mono">{TESTIMONIALS_STATS.growthFromTestimonials}</p>
          <p className="text-[10px] text-muted-foreground">Crescimento</p>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
          <Star size={16} className="text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">{TESTIMONIALS_STATS.conversionRate}</p>
          <p className="text-[10px] text-muted-foreground">Conversão</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {TESTIMONIAL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      {/* CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center">
        <h3 className="text-sm font-bold text-foreground mb-1">Quer ver seu depoimento aqui?</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Participe ativamente da pré campanha e compartilhe sua experiência com a equipe.
          Os melhores relatos serão destacados no painel e na página de apoiadores.
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] text-primary font-medium">
          <Award size={14} />
          <span>Apoiadores com nível Muda ou superior podem enviar depoimentos</span>
        </div>
      </div>
    </div>
  );
}
