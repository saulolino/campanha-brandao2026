// ============================================================
// DESIGN: Command Center Militar Verde
// Modo de Apresentação — Tela cheia para reuniões
// ============================================================
import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  TreePine,
  Users,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDES = [
  { id: 0, title: "Capa", icon: TreePine },
  { id: 1, title: "KPIs Principais", icon: BarChart3 },
  { id: 2, title: "Progresso da Meta", icon: Target },
  { id: 3, title: "Crescimento Semanal", icon: TrendingUp },
  { id: 4, title: "Próximos Posts", icon: Calendar },
  { id: 5, title: "Pilares de Conteúdo", icon: Zap },
  { id: 6, title: "Alertas e Ações", icon: AlertTriangle },
];

const growthData = [
  { month: "Abr", value: 2092 },
  { month: "Mai", value: 5028 },
  { month: "Jun", value: 7964 },
  { month: "Jul", value: 10997 },
  { month: "Ago", value: 14031 },
  { month: "Set", value: 16966 },
  { month: "Out", value: 20000 },
];

const pillarData = [
  { name: "Causa", value: 40, color: "#2d6a4f" },
  { name: "Explicação", value: 25, color: "#40916c" },
  { name: "Humano", value: 20, color: "#c9a84c" },
  { name: "Mobilização", value: 15, color: "#52b788" },
];

export default function PresentationMode({ isOpen, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") setCurrentSlide((p) => Math.min(p + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft") setCurrentSlide((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#2d6a4f]/20 flex items-center justify-center mb-8">
              <TreePine size={48} className="text-[#2d6a4f]" />
            </div>
            <p className="text-[#c9a84c] text-sm uppercase tracking-[0.3em] mb-3 font-medium">PRÉ CAMPANHA 2026</p>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
              Brasília<br />Cidade Parque
            </h1>
            <p className="text-xl text-white/60 mb-2">Eduardo Brandão — Deputado Distrital</p>
            <p className="text-sm text-white/30 mt-8">Reunião de Equipe — Abril 2026</p>
            <div className="absolute bottom-8 flex items-center gap-2 text-white/20 text-xs">
              <span>Use as setas ← → para navegar</span>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-8">KPIs Principais</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
              {[
                { label: "Seguidores", value: "1.518", change: "+10", changeColor: "text-[#2d6a4f]", sub: "Meta: 20.000" },
                { label: "Engajamento", value: "3.1%", change: "+0.2%", changeColor: "text-[#2d6a4f]", sub: "1o lugar entre concorrentes" },
                { label: "Curtidas/Post", value: "47.5", change: "+20%", changeColor: "text-[#2d6a4f]", sub: "Meta: 80+" },
                { label: "Dias Restantes", value: "209", change: "", changeColor: "", sub: "Até outubro 2026" },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-center">
                  <p className="text-sm text-white/40 uppercase tracking-wider mb-2">{kpi.label}</p>
                  <p className="text-4xl lg:text-5xl font-mono font-bold text-white mb-2">{kpi.value}</p>
                  <div className="flex items-center gap-2">
                    {kpi.change && <span className={`text-sm font-mono ${kpi.changeColor}`}>{kpi.change}</span>}
                    <span className="text-xs text-white/30">{kpi.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-6">Progresso da Meta: 20.000</h2>
            <div className="flex-1 flex flex-col justify-center">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-white/60 text-sm">1.518 seguidores</span>
                  <span className="text-[#c9a84c] text-sm font-bold">20.000 seguidores</span>
                </div>
                <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-[#2d6a4f] to-[#52b788] rounded-full transition-all" style={{ width: "7.6%" }}>
                    <div className="h-full flex items-center justify-end pr-2">
                      <span className="text-[10px] font-bold text-white">7.6%</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Chart */}
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="presGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 14, fill: "#999" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                  <Area type="monotone" dataKey="value" stroke="#2d6a4f" fill="url(#presGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {growthData.map((d) => (
                  <div key={d.month} className="text-center">
                    <p className="text-xs text-white/40">{d.month}</p>
                    <p className="text-sm font-mono font-bold text-white">{d.value.toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-6">Crescimento Semanal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <p className="text-sm text-white/40 uppercase tracking-wider mb-4">Esta Semana vs. Anterior</p>
                <div className="space-y-4">
                  {[
                    { label: "Seguidores", current: "+10", previous: "+8", pct: "+25%" },
                    { label: "Curtidas", current: "330", previous: "275", pct: "+20%" },
                    { label: "Comentários", current: "48", previous: "38", pct: "+26%" },
                    { label: "Alcance", current: "2.650", previous: "2.100", pct: "+26%" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-white/60 text-sm">{m.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white/30 text-sm">{m.previous}</span>
                        <span className="text-white font-mono font-bold text-lg">{m.current}</span>
                        <span className="text-[#2d6a4f] text-sm font-mono">{m.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <p className="text-sm text-white/40 uppercase tracking-wider mb-4">Necessário para a Meta</p>
                <div className="space-y-4">
                  {[
                    { label: "Seguidores/semana", need: "685", current: "10", gap: "675" },
                    { label: "Curtidas/post", need: "80+", current: "47.5", gap: "32.5" },
                    { label: "Comentários/post", need: "15+", current: "6.7", gap: "8.3" },
                    { label: "Posts/semana", need: "3", current: "2.3", gap: "0.7" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-white/60 text-sm">{m.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white/30 text-sm">Atual: {m.current}</span>
                        <span className="text-[#c9a84c] font-mono font-bold text-lg">{m.need}</span>
                        <span className="text-red-400 text-xs font-mono">-{m.gap}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-6">Próximos Posts</h2>
            <div className="flex-1 space-y-4">
              {[
                { day: "TER 07/04", title: "Brasília tem 42% menos áreas verdes", type: "Carrossel", time: "18:00", status: "Em produção", statusColor: "text-yellow-400 bg-yellow-400/10" },
                { day: "QUI 09/04", title: "O que é o projeto Brasília Cidade Parque?", type: "Vídeo", time: "10:00", status: "Planejado", statusColor: "text-blue-400 bg-blue-400/10" },
                { day: "SAB 11/04", title: "Um sábado no Parque da Cidade", type: "Reels", time: "12:00", status: "Planejado", statusColor: "text-blue-400 bg-blue-400/10" },
              ].map((post, i) => (
                <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex items-center gap-6">
                  <div className="shrink-0 w-20 text-center">
                    <p className="text-lg font-bold text-[#c9a84c]">{post.day.split(" ")[0]}</p>
                    <p className="text-2xl font-mono font-bold text-white">{post.day.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/40">{post.type}</span>
                      <span className="text-sm text-white/40">{post.time}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${post.statusColor}`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-6">Pilares de Conteúdo</h2>
            <div className="flex-1 flex items-center gap-8">
              <div className="w-1/3">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pillarData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value" stroke="none">
                      {pillarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4">
                {pillarData.map((p) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: p.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg text-white font-semibold">{p.name}</span>
                        <span className="text-lg font-mono font-bold text-white">{p.value}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-white mb-6">Alertas e Ações da Semana</h2>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-red-400 uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} /> Atenção Imediata
                </p>
                <div className="space-y-3">
                  {[
                    "Crescimento atual (10/sem) está 98% abaixo da meta (685/sem)",
                    "Investimento em ads ainda não iniciado (R$ 0 de R$ 2.500)",
                    "Nenhuma parceria estratégica ativa no momento",
                  ].map((alert, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-400 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-white/80">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-[#2d6a4f] uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                  <Zap size={16} /> Ações Prioritárias
                </p>
                <div className="space-y-3">
                  {[
                    "Iniciar pré campanha de ads com R$ 2.500/mês focando em Brasília",
                    "Fechar 3 parcerias com influenciadores locais esta semana",
                    "Publicar 3 posts esta semana conforme calendário",
                    "Configurar TikTok e YouTube Shorts para multi-plataforma",
                  ].map((action, i) => (
                    <div key={i} className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/20 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2d6a4f]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[#2d6a4f] text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-white/80">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0f1a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <TreePine size={18} className="text-[#2d6a4f]" />
          <span className="text-xs text-white/40 uppercase tracking-wider">Modo Apresentação</span>
        </div>
        <div className="flex items-center gap-2">
          {SLIDES.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(s.id)}
              className={`w-2 h-2 rounded-full transition-all ${currentSlide === s.id ? "bg-[#2d6a4f] w-6" : "bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-white/5 transition-colors">
          <X size={18} className="text-white/40" />
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-6xl h-full">
          {renderSlide()}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
        <button
          onClick={() => setCurrentSlide((p) => Math.max(p - 1, 0))}
          disabled={currentSlide === 0}
          className="flex items-center gap-1 text-sm text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={16} /> Anterior
        </button>
        <span className="text-xs text-white/20 font-mono">
          {currentSlide + 1} / {SLIDES.length} — {SLIDES[currentSlide].title}
        </span>
        <button
          onClick={() => setCurrentSlide((p) => Math.min(p + 1, SLIDES.length - 1))}
          disabled={currentSlide === SLIDES.length - 1}
          className="flex items-center gap-1 text-sm text-white/40 hover:text-white/80 disabled:opacity-20 transition-colors"
        >
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
