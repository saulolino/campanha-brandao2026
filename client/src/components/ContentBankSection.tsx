// ============================================================
// DESIGN: Command Center Militar Verde
// Seção "Banco de Conteúdo" — Repositório de materiais
// ============================================================
import { useState } from "react";
import {
  CONTENT_TEMPLATES,
  HASHTAG_SETS,
  VISUAL_GUIDES,
  STORY_TEMPLATES,
  CTA_BANK,
  CAPTION_BANK,
  CATEGORY_LABELS,
  PILLAR_LABELS,
  STATUS_LABELS,
  type ContentTemplate,
  type HashtagSet,
  type VisualGuide,
  type StoryTemplate,
  type CTABank,
  type ContentItem,
} from "@/lib/contentBank";
import {
  FileText,
  Hash,
  Palette,
  Smartphone,
  Megaphone,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Film,
  Image,
  Video,
  Sparkles,
  Lightbulb,
  Eye,
  Layers,
  Clock,
  Star,
  ArrowRight,
  Zap,
} from "lucide-react";

// ============================================================
// Tab config
// ============================================================
const TABS = [
  { id: "templates", label: "Templates", icon: Layers, count: CONTENT_TEMPLATES.length },
  { id: "legendas", label: "Legendas", icon: BookOpen, count: CAPTION_BANK.length },
  { id: "hashtags", label: "Hashtags", icon: Hash, count: HASHTAG_SETS.length },
  { id: "visual", label: "Guias Visuais", icon: Palette, count: VISUAL_GUIDES.length },
  { id: "stories", label: "Stories", icon: Smartphone, count: STORY_TEMPLATES.length },
  { id: "ctas", label: "CTAs", icon: Megaphone, count: CTA_BANK.length },
];

// ============================================================
// Copy helper
// ============================================================
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
    >
      {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

// ============================================================
// Template Card
// ============================================================
function TemplateCard({ template }: { template: ContentTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const pillar = PILLAR_LABELS[template.pillar];
  const FormatIcon = template.format === "reel" ? Film : template.format === "carrossel" ? Image : Video;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all" style={{ borderLeftWidth: "4px", borderLeftColor: pillar.color }}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: pillar.color + "20", color: pillar.color }}>{pillar.label}</span>
          <span className="flex items-center gap-1 text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground"><FormatIcon size={10} />{template.format}</span>
        </div>
        <h3 className="text-sm font-bold text-foreground mb-2">{template.name}</h3>

        {/* Structure preview */}
        <div className="space-y-1.5 mb-4">
          {template.structure.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-xs text-foreground/80">{step}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
          {expanded ? <><ChevronUp size={14} />Recolher</> : <><ChevronDown size={14} />Ver template completo</>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {/* Caption template */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Template de Legenda</h4>
              </div>
              <CopyButton text={template.captionTemplate} />
            </div>
            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed font-mono">{template.captionTemplate}</p>
            </div>
          </div>

          {/* Visual guide */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={14} className="text-accent" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Direção Visual</h4>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{template.visualGuide}</p>
          </div>

          {/* Best practices */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-[#c9a84c]" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Boas Práticas</h4>
            </div>
            <ul className="space-y-1.5">
              {template.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" />
                  {bp}
                </li>
              ))}
            </ul>
          </div>

          {/* Example */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Exemplo de Legenda</h4>
              </div>
              <CopyButton text={template.exampleCaption} />
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">{template.exampleCaption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Caption Card
// ============================================================
function CaptionCard({ caption }: { caption: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const pillar = PILLAR_LABELS[caption.pillar];
  const status = STATUS_LABELS[caption.status];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all" style={{ borderLeftWidth: "4px", borderLeftColor: pillar.color }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: pillar.color + "20", color: pillar.color }}>{pillar.label}</span>
            <span className="text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">{caption.format}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: status.color + "20", color: status.color }}>{status.label}</span>
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">{caption.title}</h3>
        <p className="text-[11px] text-muted-foreground mb-3">{caption.description}</p>
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {caption.tags.map((tag) => (
            <span key={tag} className="text-[9px] font-mono text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
          {expanded ? <><ChevronUp size={14} />Recolher</> : <><ChevronDown size={14} />Ver legenda</>}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Texto da Legenda</h4>
            <CopyButton text={caption.content} />
          </div>
          <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">{caption.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Hashtag Card
// ============================================================
function HashtagCard({ set }: { set: HashtagSet }) {
  const pillar = PILLAR_LABELS[set.pillar];
  const allTags = set.hashtags.join(" ");

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-all" style={{ borderLeftWidth: "4px", borderLeftColor: pillar.color }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">{set.name}</h3>
        </div>
        <CopyButton text={allTags} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3 inline-block" style={{ backgroundColor: pillar.color + "20", color: pillar.color }}>{pillar.label}</span>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {set.hashtags.map((tag) => (
          <span key={tag} className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">{tag}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-muted/20 rounded-md p-2">
          <p className="text-[9px] text-muted-foreground uppercase">Alcance</p>
          <p className="text-[11px] text-foreground font-medium">{set.reach}</p>
        </div>
        <div className="bg-muted/20 rounded-md p-2">
          <p className="text-[9px] text-muted-foreground uppercase">Uso</p>
          <p className="text-[11px] text-foreground font-medium">{set.usage}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Visual Guide Card
// ============================================================
function VisualGuideCard({ guide }: { guide: VisualGuide }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/20 transition-all">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={14} className="text-accent" />
          <h3 className="text-sm font-bold text-foreground">{guide.name}</h3>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {guide.specs.map((spec) => (
            <div key={spec.label} className="bg-muted/20 rounded-md p-2">
              <p className="text-[9px] text-muted-foreground uppercase">{spec.label}</p>
              <p className="text-[11px] text-foreground font-mono font-medium">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Color palette */}
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Paleta de Cores</p>
          <div className="flex gap-2">
            {guide.colorPalette.map((color) => (
              <div key={color.hex} className="text-center">
                <div className="w-10 h-10 rounded-lg border border-border mb-1" style={{ backgroundColor: color.hex }} />
                <p className="text-[8px] text-muted-foreground">{color.name}</p>
                <p className="text-[8px] font-mono text-muted-foreground/70">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
          {expanded ? <><ChevronUp size={14} />Recolher</> : <><ChevronDown size={14} />Ver dicas</>}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-[#c9a84c]" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Dicas de Produção</h4>
          </div>
          <ul className="space-y-1.5">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Story Template Card
// ============================================================
function StoryCard({ story }: { story: StoryTemplate }) {
  const typeColors: Record<string, string> = {
    enquete: "#2d6a4f",
    quiz: "#40916c",
    countdown: "#e76f51",
    bastidores: "#c9a84c",
    depoimento: "#52b788",
    repost: "#74c69d",
  };
  const color = typeColors[story.type] || "#74c69d";

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-all" style={{ borderLeftWidth: "4px", borderLeftColor: color }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: color + "20", color }}>{story.type}</span>
        <span className="flex items-center gap-1 text-[10px] font-mono bg-muted/50 px-2 py-0.5 rounded text-muted-foreground">
          <Clock size={10} />{story.frequency}
        </span>
      </div>
      <h3 className="text-sm font-bold text-foreground mb-2">{story.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{story.description}</p>

      <div className="bg-muted/20 rounded-lg p-3 border border-border/50 mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Estrutura</p>
        <p className="text-xs text-foreground/80">{story.structure}</p>
      </div>

      <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={11} className="text-accent" />
          <p className="text-[10px] text-accent font-bold uppercase tracking-wider">Dica de Engajamento</p>
        </div>
        <p className="text-xs text-foreground/80">{story.engagementTip}</p>
      </div>
    </div>
  );
}

// ============================================================
// CTA Section
// ============================================================
function CTASection() {
  const [filterType, setFilterType] = useState<string>("todos");
  const types = ["todos", "engajamento", "compartilhamento", "salvamento", "seguir", "acao"];
  const typeLabels: Record<string, string> = {
    todos: "Todos",
    engajamento: "Engajamento",
    compartilhamento: "Compartilhamento",
    salvamento: "Salvamento",
    seguir: "Seguir",
    acao: "Ação",
  };
  const effectColors = { alto: "#2d6a4f", medio: "#c9a84c", baixo: "#6c757d" };

  const filtered = filterType === "todos" ? CTA_BANK : CTA_BANK.filter((c) => c.type === filterType);

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all ${
              filterType === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50"
            }`}
          >
            {typeLabels[t]}
          </button>
        ))}
      </div>

      {/* CTA list */}
      <div className="space-y-2">
        {filtered.map((cta) => {
          const pillar = PILLAR_LABELS[cta.pillar];
          const effColor = effectColors[cta.effectiveness];
          return (
            <div key={cta.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between gap-3 hover:border-primary/20 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: pillar.color + "20", color: pillar.color }}>{pillar.label}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: effColor + "20", color: effColor }}>{cta.effectiveness}</span>
                </div>
                <p className="text-sm text-foreground">{cta.text}</p>
              </div>
              <CopyButton text={cta.text} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function ContentBankSection() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">BANCO DE CONTEÚDO</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Repositório da Campanha</span>
      </div>

      {/* Description */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Repositório Centralizado</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Todos os materiais, templates, legendas prontas, hashtags, guias visuais, modelos de stories e CTAs organizados em um só lugar.
            Use os botões de copiar para agilizar a produção de conteúdo. Cada material está alinhado com os pilares da campanha Brasília Cidade Parque.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                  : "bg-card border-border hover:border-primary/20 hover:bg-card/80"
              }`}
            >
              <Icon size={16} className={`mx-auto mb-1.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{tab.label}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{tab.count} itens</p>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "templates" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              Templates de Conteúdo ({CONTENT_TEMPLATES.length})
            </h4>
            {CONTENT_TEMPLATES.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} />
            ))}
          </div>
        )}

        {activeTab === "legendas" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              Legendas Prontas ({CAPTION_BANK.length})
            </h4>
            {CAPTION_BANK.map((cap) => (
              <CaptionCard key={cap.id} caption={cap} />
            ))}
          </div>
        )}

        {activeTab === "hashtags" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              Conjuntos de Hashtags ({HASHTAG_SETS.length})
            </h4>
            {HASHTAG_SETS.map((set) => (
              <HashtagCard key={set.id} set={set} />
            ))}
          </div>
        )}

        {activeTab === "visual" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              Guias Visuais por Formato ({VISUAL_GUIDES.length})
            </h4>
            {VISUAL_GUIDES.map((guide) => (
              <VisualGuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}

        {activeTab === "stories" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight size={12} className="text-primary" />
              Templates de Stories ({STORY_TEMPLATES.length})
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {STORY_TEMPLATES.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "ctas" && (
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <ArrowRight size={12} className="text-primary" />
              Banco de CTAs ({CTA_BANK.length})
            </h4>
            <CTASection />
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="bg-card rounded-lg p-3 border border-border text-center">
              <Icon size={14} className="text-primary mx-auto mb-1" />
              <p className="text-lg font-mono font-bold text-foreground">{tab.count}</p>
              <p className="text-[9px] text-muted-foreground">{tab.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
