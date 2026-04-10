// ============================================================
// PÁGINA DE APOIADORES - BRASÍLIA CIDADE PARQUE
// Design: Command Center Verde — seção dedicada aos voluntários
// ============================================================
import { useState } from "react";
import InfoTooltip from "./InfoTooltip";
import {
  Heart, Clock, Share2, MessageCircle, Globe, Shield,
  ChevronDown, ChevronRight, Copy, CheckCircle2, Zap,
  Users, Target, Award, Star, BookOpen, HelpCircle,
  Bell, ArrowRight, Flame, Timer, Send, Smartphone,
  UserPlus, Camera, Search, Crown, TreePine, Sprout,
} from "lucide-react";
import {
  ENGAGEMENT_PROTOCOL,
  ENGAGEMENT_RULES,
  MISSIONS,
  SUPPORTER_LEVELS,
  QUICK_ACTIONS,
  POSTING_SCHEDULE,
  COMMENT_INSPIRATION,
  CAMPAIGN_HASHTAGS,
  SUPPORTER_FAQ,
} from "@/lib/supportersGuide";

const ruleIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  share: <Share2 className="w-5 h-5" />,
  message: <MessageCircle className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
};

const impactColors: Record<string, string> = {
  "baixo": "text-gray-400 bg-gray-400/10",
  "médio": "text-yellow-400 bg-yellow-400/10",
  "alto": "text-emerald-400 bg-emerald-400/10",
  "muito alto": "text-red-400 bg-red-400/10",
};

const categoryColors: Record<string, string> = {
  "diária": "border-emerald-500/30 bg-emerald-500/5",
  "semanal": "border-blue-500/30 bg-blue-500/5",
  "mensal": "border-purple-500/30 bg-purple-500/5",
  "especial": "border-amber-500/30 bg-amber-500/5",
};

const categoryLabels: Record<string, string> = {
  "diária": "DIÁRIA",
  "semanal": "SEMANAL",
  "mensal": "MENSAL",
  "especial": "ESPECIAL",
};

const categoryBadgeColors: Record<string, string> = {
  "diária": "bg-emerald-500/20 text-emerald-400",
  "semanal": "bg-blue-500/20 text-blue-400",
  "mensal": "bg-purple-500/20 text-purple-400",
  "especial": "bg-amber-500/20 text-amber-400",
};

const sectionTooltips = {
  protocolo: "Siga estes 7 passos em ordem para cada novo post. Cada ação multiplica o alcance!",
  regras: "O que fazer e o que evitar para manter a qualidade dos posts e da comunidade",
  missoes: "Tarefas especiais que valem pontos XP e aumentam seu nível de apoiador",
  acoes: "Ações rápidas que você pode fazer agora para engajar com o perfil",
  hashtags: "Hashtags aprovadas para usar em posts, histórias e comentários",
  faq: "Dúvidas frequentes e respostas sobre como engajar corretamente",
};

export default function SupportersPage() {
  const [activeTab, setActiveTab] = useState<"protocolo" | "regras" | "missoes" | "acoes" | "hashtags" | "faq">("protocolo");
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(null);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [missionFilter, setMissionFilter] = useState<string>("todas");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [expandedInspiration, setExpandedInspiration] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const tabs = [
    { id: "protocolo" as const, label: "Protocolo", icon: <Zap className="w-4 h-4" /> },
    { id: "regras" as const, label: "Regras", icon: <BookOpen className="w-4 h-4" /> },
    { id: "missoes" as const, label: "Missões", icon: <Target className="w-4 h-4" /> },
    { id: "acoes" as const, label: "Ações Rápidas", icon: <Timer className="w-4 h-4" /> },
    { id: "hashtags" as const, label: "Hashtags", icon: <Search className="w-4 h-4" /> },
    { id: "faq" as const, label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const filteredMissions = missionFilter === "todas"
    ? MISSIONS
    : MISSIONS.filter((m) => m.category === missionFilter);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-emerald-900/40 via-emerald-800/20 to-transparent border border-emerald-500/20 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-mono tracking-[0.3em] text-emerald-400/70 uppercase">
              Área Exclusiva
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
            GUIA DO APOIADOR
          </h2>
          <p className="text-emerald-300/60 mt-2 max-w-2xl text-sm lg:text-base">
            Estratégias e ações práticas para amplificar a pré campanha Brasília Cidade Parque.
            Cada interação sua faz diferença no alcance e no crescimento do movimento.
          </p>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10">
              <div className="text-xs text-emerald-400/60 font-mono uppercase">Protocolo</div>
              <div className="text-xl font-bold text-white font-mono">7 passos</div>
              <div className="text-xs text-emerald-300/40">por publicação</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10">
              <div className="text-xs text-emerald-400/60 font-mono uppercase">Missões</div>
              <div className="text-xl font-bold text-white font-mono">{MISSIONS.length} ativas</div>
              <div className="text-xs text-emerald-300/40">ganhe XP e badges</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10">
              <div className="text-xs text-emerald-400/60 font-mono uppercase">Publicações</div>
              <div className="text-xl font-bold text-white font-mono">TER QUI SAB</div>
              <div className="text-xs text-emerald-300/40">3x por semana</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/10">
              <div className="text-xs text-emerald-400/60 font-mono uppercase">Tempo Mínimo</div>
              <div className="text-xl font-bold text-white font-mono">2 min</div>
              <div className="text-xs text-emerald-300/40">já faz diferença</div>
            </div>
          </div>
        </div>
      </div>

      {/* HORÁRIOS DE ALERTA */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Ative as Notificações — Horários de Publicação
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {POSTING_SCHEDULE.days.map((day, i) => (
            <div key={i} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold font-mono text-amber-400">{day.time}</div>
              <div>
                <div className="text-sm font-semibold text-white">{day.day}</div>
                <div className="text-xs text-amber-300/50">{day.type}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-300/40 mt-3">
          Vá no perfil @eduardobrandaopv → clique no sino → ative "Publicações" e "Stories" para receber alertas
        </p>
      </div>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex items-center gap-1.5 group/tab">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-card/50 text-muted-foreground border border-border/50 hover:bg-card hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
            <div className="opacity-0 group-hover/tab:opacity-100 transition-opacity">
              <InfoTooltip text={sectionTooltips[tab.id]} side="top" />
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB: PROTOCOLO DE ENGAJAMENTO */}
      {/* ============================================================ */}
      {activeTab === "protocolo" && (
        <div className="space-y-4">
          <div className="bg-card/50 rounded-xl border border-border/50 p-5">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Protocolo de Engajamento — 7 Passos
              <InfoTooltip text="Cada passo multiplica o alcance do post. Execute em ordem!" side="right" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Siga estes passos toda vez que um novo post for publicado. Tempo total: ~10 minutos.
            </p>

            <div className="space-y-2">
              {ENGAGEMENT_PROTOCOL.map((step, i) => (
                <div
                  key={i}
                  className="border border-border/30 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedProtocol(expandedProtocol === i ? null : i)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono text-lg">
                      {step.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{step.action}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Timer className="w-3 h-3" /> {step.timeEstimate}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${impactColors[step.impact]}`}>
                      {step.impact.toUpperCase()}
                    </span>
                    {expandedProtocol === i ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedProtocol === i && (
                    <div className="px-4 pb-4 pl-18 border-t border-border/20">
                      <p className="text-sm text-emerald-300/70 mt-3 ml-14">{step.detail}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inspiração para Comentários */}
          <div className="bg-card/50 rounded-xl border border-border/50 p-5">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <InfoTooltip text="Copie e adapte estes comentários para engajar com o post" side="right" className="w-4 h-4" />
              Inspiração para Comentários
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use como inspiração — adapte com suas próprias palavras. Nunca copie e cole.
            </p>

            <div className="space-y-3">
              {COMMENT_INSPIRATION.map((cat, i) => (
                <div key={i} className="border border-border/30 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedInspiration(expandedInspiration === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="font-semibold text-white text-sm">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{cat.examples.length} exemplos</span>
                      {expandedInspiration === i ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {expandedInspiration === i && (
                    <div className="px-4 pb-4 border-t border-border/20 space-y-2 mt-3">
                      {cat.examples.map((ex, j) => (
                        <div key={j} className="flex items-start gap-3 bg-black/20 rounded-lg p-3">
                          <span className="text-emerald-400 mt-0.5 text-lg">"</span>
                          <p className="text-sm text-emerald-300/70 italic flex-1">{ex}</p>
                          <button
                            onClick={() => copyToClipboard(ex, `comment-${i}-${j}`)}
                            className="flex-shrink-0 p-1.5 rounded hover:bg-white/10 transition-colors"
                            title="Copiar como inspiração"
                          >
                            {copiedText === `comment-${i}-${j}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: REGRAS DE ENGAJAMENTO */}
      {/* ============================================================ */}
      {activeTab === "regras" && (
        <div className="space-y-3">
          {ENGAGEMENT_RULES.map((rule, i) => (
            <div key={i} className="bg-card/50 rounded-xl border border-border/50 overflow-hidden">
              <button
                onClick={() => setExpandedRule(expandedRule === i ? null : i)}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  {ruleIcons[rule.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">{rule.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{rule.description}</div>
                </div>
                {expandedRule === i ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {expandedRule === i && (
                <div className="px-5 pb-5 border-t border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> FAÇA
                      </h4>
                      <ul className="space-y-2">
                        {rule.doList.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-emerald-300/70">
                            <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> NÃO FAÇA
                      </h4>
                      <ul className="space-y-2">
                        {rule.dontList.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-red-300/70">
                            <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-red-500" />
                            {item}
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
      )}

      {/* ============================================================ */}
      {/* TAB: MISSÕES */}
      {/* ============================================================ */}
      {activeTab === "missoes" && (
        <div className="space-y-4">
          {/* Níveis de Apoiador */}
          <div className="bg-card/50 rounded-xl border border-border/50 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Níveis de Apoiador
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {SUPPORTER_LEVELS.map((level) => (
                <div
                  key={level.level}
                  className="bg-black/30 rounded-lg p-3 border border-border/20 text-center"
                >
                  <div className="text-3xl mb-1">{level.badge}</div>
                  <div className="text-sm font-bold text-white">{level.name}</div>
                  <div className="text-xs font-mono mt-1" style={{ color: level.color }}>
                    {level.minXP}+ XP
                  </div>
                  <div className="mt-2 space-y-1">
                    {level.perks.map((perk, j) => (
                      <div key={j} className="text-[10px] text-muted-foreground">{perk}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtro de Missões */}
          <div className="flex flex-wrap gap-2">
            {["todas", "diária", "semanal", "mensal", "especial"].map((filter) => (
              <button
                key={filter}
                onClick={() => setMissionFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  missionFilter === filter
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-card/50 text-muted-foreground border border-border/50 hover:bg-card"
                }`}
              >
                {filter === "todas" ? "Todas" : categoryLabels[filter]} ({filter === "todas" ? MISSIONS.length : MISSIONS.filter((m) => m.category === filter).length})
              </button>
            ))}
          </div>

          {/* Cards de Missões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                className={`rounded-xl border overflow-hidden ${categoryColors[mission.category]}`}
              >
                <button
                  onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mission.badge}</span>
                      <div>
                        <div className="font-bold text-white text-sm">{mission.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${categoryBadgeColors[mission.category]}`}>
                            {categoryLabels[mission.category]}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${impactColors[mission.impactLevel]}`}>
                            {mission.impactLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-amber-400 font-mono">+{mission.xpPoints} XP</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Timer className="w-3 h-3" /> {mission.timeRequired}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{mission.description}</p>
                </button>
                {expandedMission === mission.id && (
                  <div className="px-4 pb-4 border-t border-border/20">
                    <h4 className="text-xs font-bold text-emerald-400 mt-3 mb-2 uppercase tracking-wider">Passos:</h4>
                    <ol className="space-y-2">
                      {mission.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-emerald-300/70">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs">
                            {j + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: AÇÕES RÁPIDAS */}
      {/* ============================================================ */}
      {activeTab === "acoes" && (
        <div className="space-y-4">
          {QUICK_ACTIONS.map((action, i) => {
            const icons = [<Zap key="zap" className="w-5 h-5" />, <Smartphone key="phone" className="w-5 h-5" />, <UserPlus key="user" className="w-5 h-5" />];
            return (
              <div key={i} className="bg-card/50 rounded-xl border border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedAction(expandedAction === i ? null : i)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    {icons[i] || <Zap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-emerald-400 font-mono">{action.totalTime}</div>
                    <div className="text-[10px] text-muted-foreground">{action.expectedImpact}</div>
                  </div>
                  {expandedAction === i ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedAction === i && (
                  <div className="px-5 pb-5 border-t border-border/20">
                    <div className="space-y-3 mt-4">
                      {action.steps.map((step) => (
                        <div key={step.order} className="flex items-start gap-4 bg-black/20 rounded-lg p-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                            {step.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">{step.action}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{step.detail}</div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-xs font-mono text-emerald-400">{step.timeEstimate}</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${impactColors[step.impact]}`}>
                              {step.impact.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: HASHTAGS */}
      {/* ============================================================ */}
      {activeTab === "hashtags" && (
        <div className="space-y-4">
          {/* Obrigatórias */}
          <div className="bg-card/50 rounded-xl border border-emerald-500/30 p-5">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Hashtags Obrigatórias (use sempre)
            </h3>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_HASHTAGS.obrigatorias.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(tag, `hash-o-${i}`)}
                  className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 hover:bg-emerald-500/20 transition-colors"
                >
                  <span className="text-sm font-mono text-emerald-400">{tag}</span>
                  {copiedText === `hash-o-${i}` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-emerald-400/50" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(CAMPAIGN_HASHTAGS.obrigatorias.join(" "), "hash-all-o")}
              className="mt-3 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              {copiedText === "hash-all-o" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copiar todas
            </button>
          </div>

          {/* Recomendadas */}
          <div className="bg-card/50 rounded-xl border border-blue-500/30 p-5">
            <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Star className="w-4 h-4" /> Hashtags Recomendadas (use quando relevante)
            </h3>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_HASHTAGS.recomendadas.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(tag, `hash-r-${i}`)}
                  className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 hover:bg-blue-500/20 transition-colors"
                >
                  <span className="text-sm font-mono text-blue-400">{tag}</span>
                  {copiedText === `hash-r-${i}` ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-blue-400/50" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(CAMPAIGN_HASHTAGS.recomendadas.join(" "), "hash-all-r")}
              className="mt-3 text-xs text-blue-400/60 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {copiedText === "hash-all-r" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copiar todas
            </button>
          </div>

          {/* Proibidas */}
          <div className="bg-card/50 rounded-xl border border-red-500/30 p-5">
            <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Hashtags Proibidas (nunca use)
            </h3>
            <ul className="space-y-2">
              {CAMPAIGN_HASHTAGS.proibidas.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-red-300/70">
                  <span className="text-red-500">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Combo para copiar */}
          <div className="bg-card/50 rounded-xl border border-border/50 p-5">
            <h3 className="text-sm font-bold text-white mb-3">Combo Pronto para Copiar</h3>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-emerald-300/70">
              {[...CAMPAIGN_HASHTAGS.obrigatorias, ...CAMPAIGN_HASHTAGS.recomendadas].join(" ")}
            </div>
            <button
              onClick={() => copyToClipboard(
                [...CAMPAIGN_HASHTAGS.obrigatorias, ...CAMPAIGN_HASHTAGS.recomendadas].join(" "),
                "hash-combo"
              )}
              className="mt-3 flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {copiedText === "hash-combo" ? (
                <><CheckCircle2 className="w-4 h-4" /> Copiado!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copiar combo completo</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: FAQ */}
      {/* ============================================================ */}
      {activeTab === "faq" && (
        <div className="space-y-2">
          {SUPPORTER_FAQ.map((faq, i) => (
            <div key={i} className="bg-card/50 rounded-xl border border-border/50 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white text-sm flex-1">{faq.question}</span>
                {expandedFaq === i ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 border-t border-border/20">
                  <p className="text-sm text-emerald-300/70 mt-3 ml-12">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER DA PÁGINA */}
      <div className="bg-card/30 rounded-xl border border-border/30 p-5 text-center">
        <TreePine className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Cada ação sua planta uma semente de mudança.
        </p>
        <p className="text-xs text-emerald-400/40 mt-1 font-mono">
          Brasília Cidade Parque — Juntos pelo futuro verde de Brasília
        </p>
      </div>
    </div>
  );
}
