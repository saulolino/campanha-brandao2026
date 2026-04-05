// ============================================================
// DESIGN: Command Center Militar Verde
// Seção de Briefing Criativo — Gerador de briefings detalhados
// ============================================================
import { useState } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Users,
  MessageSquare,
  Palette,
  CheckCircle2,
  XCircle,
  DollarSign,
  Copy,
  Download,
  Eye,
  Hash,
  Megaphone,
  Camera,
  Clapperboard,
  LayoutGrid,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { WEEKLY_BRIEFINGS, TONE_GUIDE } from "@/lib/creativeBriefing";
import type { PostBriefing } from "@/lib/creativeBriefing";

const PILLAR_COLORS: Record<string, string> = {
  causa: "#e63946",
  explicacao: "#457b9d",
  humano: "#f4a261",
  mobilizacao: "#2a9d8f",
};

const TYPE_ICONS: Record<string, any> = {
  carrossel: LayoutGrid,
  video: Clapperboard,
  reels: Camera,
};

export default function CreativeBriefingSection() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showToneGuide, setShowToneGuide] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const week = WEEKLY_BRIEFINGS[selectedWeek];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateBriefingText = (post: PostBriefing) => {
    return `BRIEFING CRIATIVO — ${post.title}
═══════════════════════════════════════
Data: ${post.date} às ${post.time} | ${post.day}
Tipo: ${post.type.toUpperCase()} | Pilar: ${post.pillarLabel}

OBJETIVO:
${post.objective}

PÚBLICO-ALVO:
${post.targetAudience}

MENSAGEM-CHAVE:
${post.keyMessage}

TOM DE VOZ:
${post.toneOfVoice}

HOOK (ABERTURA):
${post.hook}

ROTEIRO/ESTRUTURA:
${post.bodyScript}

CTA (CHAMADA PARA AÇÃO):
${post.cta}

HASHTAGS:
${post.hashtags.join(" ")}

DIREÇÃO VISUAL:
${post.visualDirection}

PALETA DE CORES:
${post.colorNotes}

REFERÊNCIAS VISUAIS:
${post.imageRefs.map((r, i) => `${i + 1}. ${r}`).join("\n")}

✅ FAZER:
${post.doList.map((d) => `• ${d}`).join("\n")}

❌ NÃO FAZER:
${post.dontList.map((d) => `• ${d}`).join("\n")}

ETAPAS DE PRODUÇÃO:
${post.productionSteps.map((s) => `[ ] ${s.step} — ${s.responsible} (até ${s.deadline})`).join("\n")}

KPIs:
${post.kpis.map((k) => `• ${k.metric}: ${k.target}`).join("\n")}

TEMPO ESTIMADO: ${post.estimatedProductionTime}
ORÇAMENTO ADS: ${post.adBudget}

OBSERVAÇÕES:
${post.notes}
═══════════════════════════════════════
Campanha Eduardo Brandão — Brasília Cidade Parque 2026`;
  };

  const handleDownload = (post: PostBriefing) => {
    const text = generateBriefingText(post);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `briefing-${post.date.replace(/\//g, "-")}-${post.type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#c9a84c] rounded-full" />
          <Sparkles size={18} className="text-[#c9a84c]" />
          <h2 className="text-lg font-bold text-foreground">BRIEFING CRIATIVO</h2>
          <span className="text-xs text-muted-foreground ml-2">Gerador de briefings para cada post</span>
        </div>
        <button
          onClick={() => setShowToneGuide(!showToneGuide)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a84c]/15 rounded-md border border-[#c9a84c]/30 hover:bg-[#c9a84c]/25 transition-colors text-xs text-[#c9a84c] font-medium"
        >
          <MessageSquare size={12} />
          Guia de Tom de Voz
          {showToneGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Tone Guide */}
      {showToneGuide && (
        <div className="bg-card rounded-lg border border-[#c9a84c]/20 p-5 mb-4 animate-in fade-in duration-300">
          <h3 className="text-sm font-bold text-[#c9a84c] mb-3 flex items-center gap-2">
            <MessageSquare size={14} />
            GUIA DE TOM DE VOZ
          </h3>
          <p className="text-xs text-muted-foreground mb-4 italic">"{TONE_GUIDE.general}"</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {Object.entries(TONE_GUIDE.pillars).map(([key, value]) => (
              <div key={key} className="bg-background/50 rounded-md p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PILLAR_COLORS[key] }} />
                  <span className="text-[11px] font-bold text-foreground uppercase">
                    {key === "causa" ? "Causa" : key === "explicacao" ? "Explicação" : key === "humano" ? "Humano" : "Mobilização"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <h4 className="text-[11px] font-bold text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> ENCORAJADO
              </h4>
              {TONE_GUIDE.encouraged.map((item, i) => (
                <p key={i} className="text-[11px] text-muted-foreground mb-1">• {item}</p>
              ))}
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-destructive mb-2 flex items-center gap-1">
                <XCircle size={12} /> PROIBIDO
              </h4>
              {TONE_GUIDE.forbidden.map((item, i) => (
                <p key={i} className="text-[11px] text-muted-foreground mb-1">• {item}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {WEEKLY_BRIEFINGS.map((w, i) => (
          <button
            key={w.weekId}
            onClick={() => { setSelectedWeek(i); setExpandedPost(null); }}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
              selectedWeek === i
                ? "bg-[#c9a84c]/20 border-[#c9a84c]/50 text-[#c9a84c]"
                : "bg-card border-border text-muted-foreground hover:border-[#c9a84c]/30"
            }`}
          >
            <div className="font-bold">Semana {i + 1}</div>
            <div className="text-[10px] opacity-70">{w.posts.length} briefings</div>
          </button>
        ))}
      </div>

      {/* Week Theme */}
      <div className="bg-card rounded-lg border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-[#c9a84c]" />
          <span className="text-[10px] text-[#c9a84c] font-bold uppercase tracking-wider">Tema da Semana</span>
        </div>
        <h3 className="text-base font-bold text-foreground">{week.theme}</h3>
        <p className="text-xs text-muted-foreground mt-1">{week.weekLabel}</p>
      </div>

      {/* Post Briefings */}
      <div className="space-y-3">
        {week.posts.map((post) => {
          const isExpanded = expandedPost === post.id;
          const TypeIcon = TYPE_ICONS[post.type] || FileText;
          const pillarColor = PILLAR_COLORS[post.pillar];

          return (
            <div key={post.id} className="bg-card rounded-lg border border-border overflow-hidden transition-all">
              {/* Post Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedPost(isExpanded ? null : post.id); }}
                className="w-full p-4 text-left hover:bg-card/80 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${pillarColor}20`, border: `1px solid ${pillarColor}40` }}
                    >
                      <TypeIcon size={18} style={{ color: pillarColor }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pillarColor}20`, color: pillarColor }}>
                          {post.pillarLabel}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{post.type.toUpperCase()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{post.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {post.day} · {post.date} às {post.time}
                        </span>
                        {post.adBudget !== "R$ 0" && post.adBudget !== "R$ 0 (orgânico)" && (
                          <span className="text-[10px] text-[#c9a84c] flex items-center gap-1">
                            <DollarSign size={10} /> {post.adBudget}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleCopy(generateBriefingText(post), `copy-${post.id}`); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleCopy(generateBriefingText(post), `copy-${post.id}`); } }}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
                      title="Copiar briefing"
                    >
                      {copiedId === `copy-${post.id}` ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-muted-foreground" />
                      )}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleDownload(post); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleDownload(post); } }}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer"
                      title="Baixar briefing"
                    >
                      <Download size={14} className="text-muted-foreground" />
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Objective & Audience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Target size={12} className="text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">Objetivo</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{post.objective}</p>
                    </div>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users size={12} className="text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">Público-Alvo</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{post.targetAudience}</p>
                    </div>
                  </div>

                  {/* Key Message & Tone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Megaphone size={12} className="text-[#c9a84c]" />
                        <span className="text-[10px] font-bold text-[#c9a84c] uppercase">Mensagem-Chave</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed italic">"{post.keyMessage}"</p>
                    </div>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageSquare size={12} className="text-[#c9a84c]" />
                        <span className="text-[10px] font-bold text-[#c9a84c] uppercase">Tom de Voz</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{post.toneOfVoice}</p>
                    </div>
                  </div>

                  {/* Hook */}
                  <div className="bg-[#c9a84c]/10 rounded-md p-3 border border-[#c9a84c]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#c9a84c] uppercase">Hook (Abertura)</span>
                      <button
                        onClick={() => handleCopy(post.hook, `hook-${post.id}`)}
                        className="p-1 rounded hover:bg-[#c9a84c]/20 transition-colors"
                      >
                        {copiedId === `hook-${post.id}` ? (
                          <CheckCircle2 size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} className="text-[#c9a84c]" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-foreground font-medium">{post.hook}</p>
                  </div>

                  {/* Script/Structure */}
                  <div className="bg-background/50 rounded-md p-3 border border-border/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText size={12} className="text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">Roteiro / Estrutura</span>
                    </div>
                    <pre className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap font-sans">{post.bodyScript}</pre>
                  </div>

                  {/* CTA */}
                  <div className="bg-primary/10 rounded-md p-3 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">CTA (Chamada para Ação)</span>
                      <button
                        onClick={() => handleCopy(post.cta, `cta-${post.id}`)}
                        className="p-1 rounded hover:bg-primary/20 transition-colors"
                      >
                        {copiedId === `cta-${post.id}` ? (
                          <CheckCircle2 size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} className="text-primary" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-foreground font-medium">{post.cta}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="bg-background/50 rounded-md p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Hash size={12} className="text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">Hashtags</span>
                      </div>
                      <button
                        onClick={() => handleCopy(post.hashtags.join(" "), `hash-${post.id}`)}
                        className="p-1 rounded hover:bg-accent transition-colors"
                      >
                        {copiedId === `hash-${post.id}` ? (
                          <CheckCircle2 size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Visual Direction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Palette size={12} className="text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400 uppercase">Direção Visual</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{post.visualDirection}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 font-mono">{post.colorNotes}</p>
                    </div>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Eye size={12} className="text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400 uppercase">Referências Visuais</span>
                      </div>
                      {post.imageRefs.map((ref, i) => (
                        <p key={i} className="text-[11px] text-foreground mb-1">
                          <span className="text-muted-foreground">{i + 1}.</span> {ref}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Do / Don't */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-green-500/5 rounded-md p-3 border border-green-500/20">
                      <h4 className="text-[10px] font-bold text-green-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> FAZER
                      </h4>
                      {post.doList.map((item, i) => (
                        <p key={i} className="text-[11px] text-foreground mb-1 flex items-start gap-1.5">
                          <span className="text-green-400 mt-0.5">•</span> {item}
                        </p>
                      ))}
                    </div>
                    <div className="bg-destructive/5 rounded-md p-3 border border-destructive/20">
                      <h4 className="text-[10px] font-bold text-destructive mb-2 flex items-center gap-1">
                        <XCircle size={12} /> NÃO FAZER
                      </h4>
                      {post.dontList.map((item, i) => (
                        <p key={i} className="text-[11px] text-foreground mb-1 flex items-start gap-1.5">
                          <span className="text-destructive mt-0.5">•</span> {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Production Steps */}
                  <div className="bg-background/50 rounded-md p-3 border border-border/50">
                    <h4 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-1.5">
                      <Clock size={12} /> ETAPAS DE PRODUÇÃO
                    </h4>
                    <div className="space-y-2">
                      {post.productionSteps.map((step, i) => (
                        <div key={i} className="flex items-center justify-between bg-card rounded-md px-3 py-2 border border-border/30">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              step.status === "concluido" ? "bg-green-500/20 text-green-400" :
                              step.status === "em_andamento" ? "bg-[#c9a84c]/20 text-[#c9a84c]" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-[11px] text-foreground font-medium">{step.step}</p>
                              <p className="text-[10px] text-muted-foreground">{step.responsible}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground">até {step.deadline}</span>
                            <div className={`text-[9px] font-bold uppercase mt-0.5 ${
                              step.status === "concluido" ? "text-green-400" :
                              step.status === "em_andamento" ? "text-[#c9a84c]" :
                              "text-muted-foreground"
                            }`}>
                              {step.status === "concluido" ? "Concluído" : step.status === "em_andamento" ? "Em andamento" : "Pendente"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KPIs & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <h4 className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                        <Target size={12} /> KPIs
                      </h4>
                      {post.kpis.map((kpi, i) => (
                        <div key={i} className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">{kpi.metric}</span>
                          <span className="text-foreground font-medium">{kpi.target}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <h4 className="text-[10px] font-bold text-[#c9a84c] uppercase mb-2 flex items-center gap-1">
                        <Clock size={12} /> Tempo Estimado
                      </h4>
                      <p className="text-lg font-bold text-foreground">{post.estimatedProductionTime}</p>
                      <p className="text-[10px] text-muted-foreground">de produção total</p>
                    </div>
                    <div className="bg-background/50 rounded-md p-3 border border-border/50">
                      <h4 className="text-[10px] font-bold text-[#c9a84c] uppercase mb-2 flex items-center gap-1">
                        <DollarSign size={12} /> Orçamento Ads
                      </h4>
                      <p className="text-lg font-bold text-foreground">{post.adBudget}</p>
                      <p className="text-[10px] text-muted-foreground">impulsionamento</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {post.notes && (
                    <div className="bg-[#c9a84c]/5 rounded-md p-3 border border-[#c9a84c]/15">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={12} className="text-[#c9a84c]" />
                        <span className="text-[10px] font-bold text-[#c9a84c] uppercase">Observações da Equipe</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">{post.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleCopy(generateBriefingText(post), `full-${post.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs font-medium border border-primary/20"
                    >
                      {copiedId === `full-${post.id}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      {copiedId === `full-${post.id}` ? "Copiado!" : "Copiar Briefing Completo"}
                    </button>
                    <button
                      onClick={() => handleDownload(post)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c]/10 text-[#c9a84c] rounded-md hover:bg-[#c9a84c]/20 transition-colors text-xs font-medium border border-[#c9a84c]/20"
                    >
                      <Download size={14} />
                      Baixar .TXT
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-4 bg-card rounded-lg border border-border/50 p-3">
        <p className="text-[11px] text-muted-foreground text-center">
          <Sparkles size={12} className="inline text-[#c9a84c] mr-1" />
          Briefings detalhados disponíveis para o mês vigente (Abril 2026). Meses seguintes serão gerados quando cada mês chegar.
          Cada briefing pode ser copiado ou baixado para compartilhar com a equipe de produção.
        </p>
      </div>
    </div>
  );
}
