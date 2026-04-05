// ============================================================
// PÁGINA STANDALONE DE APOIADORES - BRASÍLIA CIDADE PARQUE
// Design: Command Center Verde - versão pública simplificada
// Sem acesso ao painel interno, compartilhável via WhatsApp
// ============================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Shield, Clock, Share2, MessageCircle, Globe,
  ChevronDown, ChevronUp, Copy, Check, Users, TrendingUp,
  Award, Star, Zap, Target, Trophy, Crown, Flame,
  Instagram, Send, BookOpen, AlertTriangle, Sparkles,
  ArrowRight, Timer, Eye, Bookmark, MessageSquare,
  Hash, HelpCircle, ExternalLink
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

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png";
const AVATAR_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/avatar-eduardo-v2_fed5f8de.png";
const BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/header-brasilia-sketch-NcazQTSj2yHumWs7WBRG7t.webp";

// ============================================================
// DADOS DO RANKING / PLACAR COLETIVO
// ============================================================
const COLLECTIVE_IMPACT = {
  totalSupporters: 47,
  activeSupporters: 32,
  totalActions: 1_284,
  totalLikes: 856,
  totalComments: 423,
  totalShares: 312,
  totalDMs: 198,
  totalWhatsApp: 267,
  totalNewFollowers: 89,
  weeklyGrowth: 12.4,
  currentWeek: "Semana 1 — Abril 2026",
  goalWeekly: 685,
  achievedWeekly: 142,
};

const TOP_SUPPORTERS = [
  { rank: 1, name: "Ana C.", badge: "🏞️", level: "Floresta", xp: 2_450, actions: 187, streak: 14 },
  { rank: 2, name: "Carlos M.", badge: "🌳", level: "Árvore", xp: 1_820, actions: 156, streak: 12 },
  { rank: 3, name: "Juliana R.", badge: "🌳", level: "Árvore", xp: 1_650, actions: 142, streak: 10 },
  { rank: 4, name: "Pedro S.", badge: "🌿", level: "Muda", xp: 890, actions: 98, streak: 8 },
  { rank: 5, name: "Mariana L.", badge: "🌿", level: "Muda", xp: 780, actions: 87, streak: 7 },
  { rank: 6, name: "Roberto F.", badge: "🌿", level: "Muda", xp: 720, actions: 76, streak: 6 },
  { rank: 7, name: "Fernanda A.", badge: "🌱", level: "Broto", xp: 450, actions: 54, streak: 5 },
  { rank: 8, name: "Lucas T.", badge: "🌱", level: "Broto", xp: 380, actions: 45, streak: 4 },
  { rank: 9, name: "Beatriz N.", badge: "🌱", level: "Broto", xp: 320, actions: 38, streak: 3 },
  { rank: 10, name: "Thiago V.", badge: "🌰", level: "Semente", xp: 180, actions: 22, streak: 2 },
];

const WEEKLY_CHALLENGES = [
  { title: "Meta de Curtidas", target: 300, current: 214, icon: Heart, color: "text-red-400" },
  { title: "Meta de Comentários", target: 150, current: 98, icon: MessageCircle, color: "text-blue-400" },
  { title: "Meta de Compartilhamentos", target: 100, current: 67, icon: Share2, color: "text-green-400" },
  { title: "Novos Seguidores", target: 100, current: 42, icon: Users, color: "text-yellow-400" },
];

// ============================================================
// COMPONENTES AUXILIARES
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
      className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

function ImpactBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    "baixo": "bg-gray-500/20 text-gray-400",
    "médio": "bg-yellow-500/20 text-yellow-400",
    "alto": "bg-orange-500/20 text-orange-400",
    "muito alto": "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[level] || colors["médio"]}`}>
      {level}
    </span>
  );
}

function ProgressBar({ current, target, color = "bg-primary" }: { current: number; target: number; color?: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

// ============================================================
// SEÇÕES DA PÁGINA
// ============================================================

function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10">
      <img src={BG_URL} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      <div className="relative p-6 sm:p-10 md:p-14">
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_URL} alt="BCP" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-primary/80 font-semibold uppercase">Brasília Cidade Parque</p>
            <p className="text-[10px] text-muted-foreground">Campanha 2026</p>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
          Guia do Apoiador
        </h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-xl mb-6 leading-relaxed">
          Cada interação sua faz diferença. Este guia contém tudo que você precisa para amplificar 
          a campanha <strong className="text-primary">Brasília Cidade Parque</strong> e ajudar Eduardo Brandão 
          a alcançar 20.000 seguidores até outubro.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://instagram.com/eduardobrandaopv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Seguir @eduardobrandaopv
          </a>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
            <img src={AVATAR_URL} alt="Eduardo" className="w-6 h-6 rounded-full object-cover" />
            Eduardo Brandão — Deputado Distrital
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactDashboard() {
  const d = COLLECTIVE_IMPACT;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Placar Coletivo</h2>
        <span className="ml-auto text-xs text-muted-foreground">{d.currentWeek}</span>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Apoiadores Ativos", value: d.activeSupporters, total: d.totalSupporters, icon: Users, color: "text-green-400" },
          { label: "Ações Realizadas", value: d.totalActions, icon: Zap, color: "text-yellow-400" },
          { label: "Novos Seguidores", value: d.totalNewFollowers, icon: TrendingUp, color: "text-blue-400" },
          { label: "Crescimento Semanal", value: `+${d.weeklyGrowth}%`, icon: Flame, color: "text-orange-400" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
          >
            <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
            <p className="text-xl sm:text-2xl font-black text-white font-mono">{typeof m.value === "number" ? m.value.toLocaleString() : m.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
            {"total" in m && m.total && (
              <p className="text-[10px] text-muted-foreground">de {m.total} cadastrados</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Engajamento gerado */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Engajamento Gerado pelos Apoiadores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Curtidas", value: d.totalLikes, icon: Heart, color: "text-red-400" },
            { label: "Comentários", value: d.totalComments, icon: MessageCircle, color: "text-blue-400" },
            { label: "Compartilhamentos", value: d.totalShares, icon: Share2, color: "text-green-400" },
            { label: "DMs Enviadas", value: d.totalDMs, icon: Send, color: "text-purple-400" },
            { label: "WhatsApp", value: d.totalWhatsApp, icon: MessageSquare, color: "text-emerald-400" },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-1`} />
              <p className="text-lg font-black text-white font-mono">{m.value.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desafios semanais */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Desafios da Semana</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WEEKLY_CHALLENGES.map((ch, i) => {
            const pct = Math.round((ch.current / ch.target) * 100);
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ch.icon className={`w-4 h-4 ${ch.color}`} />
                    <span className="text-xs text-gray-300">{ch.title}</span>
                  </div>
                  <span className="text-xs font-mono text-white">{ch.current}/{ch.target}</span>
                </div>
                <ProgressBar current={ch.current} target={ch.target} color={pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-primary" : "bg-yellow-500"} />
                <p className="text-[10px] text-muted-foreground text-right">{pct}% concluído</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RankingSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Ranking dos Apoiadores</h2>
      </div>

      {/* Top 3 destaque */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {TOP_SUPPORTERS.slice(0, 3).map((s, i) => {
          const sizes = ["order-2 scale-105", "order-1", "order-3"];
          const medals = ["bg-yellow-500/20 border-yellow-500/40", "bg-gray-400/20 border-gray-400/40", "bg-orange-600/20 border-orange-600/40"];
          const medalIcons = ["🥇", "🥈", "🥉"];
          return (
            <motion.div
              key={s.rank}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className={`${sizes[i]} ${medals[i]} border rounded-xl p-4 text-center`}
            >
              <p className="text-2xl mb-1">{medalIcons[i]}</p>
              <p className="text-lg font-black text-white">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.badge} {s.level}</p>
              <p className="text-lg font-mono font-bold text-primary mt-2">{s.xp.toLocaleString()} XP</p>
              <div className="flex justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span>{s.actions} ações</span>
                <span>{s.streak}d seguidos</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Apoiador</th>
              <th className="p-3 text-center">Nível</th>
              <th className="p-3 text-right">XP</th>
              <th className="p-3 text-right hidden sm:table-cell">Ações</th>
              <th className="p-3 text-right hidden sm:table-cell">Sequência</th>
            </tr>
          </thead>
          <tbody>
            {TOP_SUPPORTERS.map((s) => (
              <tr key={s.rank} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-3 font-mono font-bold text-muted-foreground">{s.rank}</td>
                <td className="p-3 font-semibold text-white">{s.name}</td>
                <td className="p-3 text-center">
                  <span className="text-xs">{s.badge} {s.level}</span>
                </td>
                <td className="p-3 text-right font-mono font-bold text-primary">{s.xp.toLocaleString()}</td>
                <td className="p-3 text-right font-mono text-muted-foreground hidden sm:table-cell">{s.actions}</td>
                <td className="p-3 text-right hidden sm:table-cell">
                  <span className="text-xs text-orange-400">{s.streak} dias 🔥</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Níveis */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Níveis de Apoiador</h3>
        <div className="flex flex-wrap gap-3">
          {SUPPORTER_LEVELS.map((lvl) => (
            <div key={lvl.level} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02]">
              <span className="text-lg">{lvl.badge}</span>
              <div>
                <p className="text-xs font-bold text-white">{lvl.name}</p>
                <p className="text-[10px] text-muted-foreground">{lvl.minXP}+ XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtocolSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Protocolo de Engajamento</h2>
      </div>
      <p className="text-sm text-muted-foreground">Siga estes 7 passos toda vez que um post for publicado. Tempo total: ~10 minutos.</p>

      <div className="space-y-3">
        {ENGAGEMENT_PROTOCOL.map((step) => (
          <motion.div
            key={step.order}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.order * 0.08 }}
            className="flex gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-sm font-black text-primary">{step.order}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-white">{step.action}</h4>
                <ImpactBadge level={step.impact} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                <Timer className="w-3 h-3" />
                {step.timeEstimate}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScheduleSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Horários de Publicação</h2>
      </div>
      <p className="text-sm text-muted-foreground">Ative as notificações e fique atento a estes horários:</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {POSTING_SCHEDULE.days.map((d, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{d.day}</p>
            <p className="text-3xl font-black text-primary font-mono">{d.time}</p>
            <p className="text-xs text-gray-400 mt-2">{d.type}</p>
          </div>
        ))}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-400">Lembrete Importante</p>
            <p className="text-xs text-gray-300 mt-1">
              Os primeiros 30 minutos após a publicação são cruciais. O algoritmo do Instagram avalia o engajamento 
              inicial para decidir o alcance do post. Sua interação rápida pode multiplicar o alcance em até 5x.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Ações Rápidas</h2>
      </div>

      <div className="space-y-3">
        {QUICK_ACTIONS.map((qa, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{qa.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{qa.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary font-mono">{qa.totalTime}</span>
                {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4 space-y-2">
                    {qa.steps.map((step) => (
                      <div key={step.order} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {step.order}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white">{step.action}</p>
                          <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ImpactBadge level={step.impact} />
                          <span className="text-[10px] text-muted-foreground">{step.timeEstimate}</span>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-green-400 mt-3 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Impacto esperado: {qa.expectedImpact}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesSection() {
  const iconMap: Record<string, React.ElementType> = {
    heart: Heart,
    clock: Clock,
    share: Share2,
    message: MessageCircle,
    globe: Globe,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Regras de Ouro</h2>
      </div>

      <div className="space-y-3">
        {ENGAGEMENT_RULES.map((rule, i) => {
          const Icon = iconMap[rule.icon] || Heart;
          return (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-white">{rule.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{rule.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">Faça</p>
                  <ul className="space-y-1">
                    {rule.doList.map((item, j) => (
                      <li key={j} className="text-xs text-gray-300 flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Não Faça</p>
                  <ul className="space-y-1">
                    {rule.dontList.map((item, j) => (
                      <li key={j} className="text-xs text-gray-300 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionsSection() {
  const [filter, setFilter] = useState<string>("todas");
  const categories = ["todas", "diária", "semanal", "mensal", "especial"];
  const filtered = filter === "todas" ? MISSIONS : MISSIONS.filter((m) => m.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Missões</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.badge}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <span className="text-[10px] text-muted-foreground uppercase">{m.category}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-primary">+{m.xpPoints} XP</p>
                <ImpactBadge level={m.impactLevel} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{m.description}</p>
            <div className="space-y-1">
              {m.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-primary font-bold">{j + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
              <Timer className="w-3 h-3" />
              {m.timeRequired}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HashtagsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Hashtags Oficiais</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-3">Obrigatórias</p>
          <div className="space-y-2">
            {CAMPAIGN_HASHTAGS.obrigatorias.map((h, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-mono text-white">{h}</span>
                <CopyButton text={h} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <CopyButton text={CAMPAIGN_HASHTAGS.obrigatorias.join(" ")} />
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-3">Recomendadas</p>
          <div className="space-y-2">
            {CAMPAIGN_HASHTAGS.recomendadas.map((h, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-mono text-white">{h}</span>
                <CopyButton text={h} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-3">Proibidas</p>
          <ul className="space-y-2">
            {CAMPAIGN_HASHTAGS.proibidas.map((h, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CommentsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Inspiração para Comentários</h2>
      </div>
      <p className="text-xs text-muted-foreground">Use como inspiração, nunca copie literalmente. Adapte com suas palavras.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COMMENT_INSPIRATION.map((cat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{cat.category}</h4>
            <div className="space-y-2">
              {cat.examples.map((ex, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs mt-0.5">"</span>
                  <p className="text-xs text-gray-300 italic leading-relaxed">{ex}</p>
                  <CopyButton text={ex} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">Perguntas Frequentes</h2>
      </div>

      <div className="space-y-2">
        {SUPPORTER_FAQ.map((faq, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-semibold text-white">{faq.question}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <p className="p-4 text-xs text-gray-300 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function Apoiadores() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header fixo mobile */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="BCP" className="w-7 h-7 object-contain" />
            <div>
              <p className="text-xs font-bold text-white">Brasília Cidade Parque</p>
              <p className="text-[10px] text-muted-foreground">Guia do Apoiador</p>
            </div>
          </div>
          <a
            href="https://instagram.com/eduardobrandaopv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />
            Seguir
          </a>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-10">
        <HeroSection />
        <ImpactDashboard />
        <RankingSection />
        <ScheduleSection />
        <ProtocolSection />
        <QuickActionsSection />
        <RulesSection />
        <MissionsSection />
        <HashtagsSection />
        <CommentsSection />
        <FAQSection />

        {/* CTA Final */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 sm:p-8 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-black text-white mb-2">Cada Ação Conta</h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto mb-4">
            Juntos, vamos transformar Brasília em uma verdadeira Cidade Parque. 
            Sua participação é fundamental para alcançarmos 20.000 seguidores até outubro.
          </p>
          <a
            href="https://instagram.com/eduardobrandaopv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Seguir @eduardobrandaopv
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-3">
          <img src={LOGO_URL} alt="BCP" className="w-16 h-16 object-contain opacity-50" />
          <p className="text-xs text-muted-foreground text-center">
            Brasília Cidade Parque — Campanha Eduardo Brandão 2026
          </p>
          <p className="text-[10px] text-muted-foreground">
            Painel exclusivo para apoiadores e voluntários
          </p>
        </div>
      </footer>
    </div>
  );
}
