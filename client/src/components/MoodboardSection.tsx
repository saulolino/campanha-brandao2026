// ============================================================
// DESIGN: Command Center Militar Verde
// Moodboard — Referências Visuais de Campanhas de Sucesso
// ============================================================
import { useState } from "react";
import { MOODBOARD_CATEGORIES, type MoodboardItem } from "@/lib/moodboard";
import {
  Palette,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BarChart3,
  Tag,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Flame,
  LayoutGrid,
  Smartphone,
  MessageSquare,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  viral: Flame,
  carrossel: LayoutGrid,
  stories: Smartphone,
  tom: MessageSquare,
};

function MoodboardCard({ item }: { item: MoodboardItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all group">
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: item.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: item.color + "20", color: item.color }}>
                {item.category}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{item.format}</span>
            </div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{item.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-foreground/70 leading-relaxed mb-4">{item.description}</p>

        {/* Metrics */}
        <div className="flex items-center gap-2 mb-3 bg-muted/15 rounded-lg p-2.5 border border-border/50">
          <BarChart3 size={12} className="text-primary shrink-0" />
          <span className="text-[10px] font-mono text-foreground/80">{item.metrics}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[9px] font-mono text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full border border-border/50">
              #{tag}
            </span>
          ))}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors text-[10px] text-muted-foreground"
        >
          {expanded ? <><ChevronUp size={12} />Recolher</> : <><ChevronDown size={12} />Por que funciona + Lição</>}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Why it works */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 size={12} className="text-primary" />
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Por que funciona</span>
            </div>
            <ul className="space-y-1.5">
              {item.whyItWorks.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Lesson */}
          <div className="p-4 bg-accent/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb size={12} className="text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Lição para a campanha</span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{item.lesson}</p>
          </div>

          {/* Source */}
          <div className="px-4 py-2 bg-muted/10 flex items-center gap-1.5">
            <ExternalLink size={10} className="text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">{item.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MoodboardSection() {
  const [selectedCategory, setSelectedCategory] = useState("viral");
  const category = MOODBOARD_CATEGORIES.find((c) => c.id === selectedCategory)!;
  const totalItems = MOODBOARD_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">REFERÊNCIAS VISUAIS</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Moodboard</span>
      </div>

      {/* Intro */}
      <div className="bg-accent/5 rounded-lg border border-accent/20 p-4 mb-6 flex items-start gap-3">
        <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Inspiração Estratégica</p>
          <p className="text-xs text-foreground/80">Referências de campanhas políticas e perfis de sucesso que atingiram alto engajamento. Cada exemplo inclui análise de por que funcionou e lições aplicáveis à campanha Brasília Cidade Parque. Use como guia para produção de conteúdo.</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MOODBOARD_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Palette;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              <Icon size={14} />
              <div className="text-left">
                <span className="block font-bold">{cat.icon} {cat.name}</span>
                <span className="block text-[9px] opacity-70">{cat.items.length} referências</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Category description */}
      <div className="bg-card rounded-lg border border-border p-4 mb-4 flex items-center gap-3">
        <BookOpen size={16} className="text-primary shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-foreground">{category.icon} {category.name}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{category.description}</p>
        </div>
        <span className="ml-auto text-lg font-mono font-bold text-primary">{category.items.length}</span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {category.items.map((item) => (
          <MoodboardCard key={item.id} item={item} />
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{totalItems}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Referências</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-primary">{MOODBOARD_CATEGORIES.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Categorias</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-[#c9a84c]">{totalItems}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Lições</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <p className="text-2xl font-mono font-bold text-[#40916c]">{totalItems * 4}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Insights</p>
        </div>
      </div>
    </div>
  );
}
