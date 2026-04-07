// DESIGN: Command Center Militar Verde
// Sidebar fixa à esquerda com navegação vertical reorganizada e intuitiva
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Users,
  DollarSign,
  ShieldAlert,
  CheckSquare,
  BarChart3,
  TreePine,
  Menu,
  X,
  CalendarClock,
  FolderOpen,
  ClipboardList,
  Palette,
  FileText,
  Bell,
  Activity,
  Presentation,
  Sparkles,
  Heart,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  TrendingUp,
  Shield,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import InfoTooltip from "./InfoTooltip";

interface NavGroup {
  label: string;
  description: string;
  items: Array<{
    id: string;
    label: string;
    tooltip: string;
    icon: any;
    route: string;
  }>;
}

// Mapeamento de IDs para rotas
const ROUTE_MAP: Record<string, string> = {
  dashboard: "/home",
  realtime: "/performance",
  publicacoes: "/publicacoes",
  performance: "/performance",
  nextweek: "/home",
  calendar: "/home",
  monthlycal: "/home",
  contentbank: "/home",
  content: "/home",
  briefing: "/home",
  tracker: "/home",
  growth: "/performance",
  report: "/home",
  pillars: "/home",
  donts: "/home",
  moodboard: "/home",
  team: "/home",
  budget: "/home",
  supporters: "/apoiadores",
  notifications: "/home",
  testimonials: "/home",
  competitors: "/home",
  checklist: "/home",
  admin: "/admin",
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "VISÃO GERAL",
    description: "Métricas e progresso da campanha",
    items: [
      {
        id: "dashboard",
        label: "Painel Principal",
        tooltip: "Métricas em tempo real, progresso da campanha e indicadores principais",
        icon: LayoutDashboard,
        route: "/home",
      },
      {
        id: "realtime",
        label: "Métricas Live",
        tooltip: "Dados atualizados do Instagram em tempo real",
        icon: Activity,
        route: "/performance",
      },
      {
        id: "publicacoes",
        label: "Gerenciador de Publicações",
        tooltip: "Fluxo colaborativo: Designer → Redator → Coordenador → Publicação",
        icon: Copy,
        route: "/publicacoes",
      },
      {
        id: "performance",
        label: "Performance de Posts",
        tooltip: "Métricas e análises dos posts publicados",
        icon: TrendingUp,
        route: "/performance",
      },
    ],
  },
  {
    label: "PLANEJAMENTO",
    description: "Organize posts e conteúdo",
    items: [
      {
        id: "nextweek",
        label: "Próxima Semana",
        tooltip: "Posts planejados para os próximos 7 dias",
        icon: CalendarClock,
        route: "/home",
      },
      {
        id: "calendar",
        label: "Calendário Semanal",
        tooltip: "Visualize posts por semana com detalhes",
        icon: CalendarDays,
        route: "/home",
      },
      {
        id: "monthlycal",
        label: "Calendário Mensal",
        tooltip: "Visão geral de todos os posts do mês",
        icon: CalendarDays,
        route: "/home",
      },
    ],
  },
  {
    label: "CONTEÚDO",
    description: "Crie e organize materiais",
    items: [
      {
        id: "contentbank",
        label: "Banco de Conteúdo",
        tooltip: "Modelos, legendas, hashtags e guias visuais prontos para usar",
        icon: FolderOpen,
        route: "/home",
      },
      {
        id: "content",
        label: "Pilares de Conteúdo",
        tooltip: "Temas principais e tipos de posts que funcionam melhor",
        icon: TreePine,
        route: "/home",
      },
      {
        id: "briefing",
        label: "Briefing Criativo",
        tooltip: "Instruções detalhadas para criar posts de impacto",
        icon: Sparkles,
        route: "/home",
      },
    ],
  },
  {
    label: "ANÁLISE",
    description: "Acompanhe desempenho",
    items: [
      {
        id: "tracker",
        label: "Status dos Posts",
        tooltip: "Acompanhe quais posts foram publicados e seu desempenho",
        icon: ClipboardList,
        route: "/home",
      },
      {
        id: "growth",
        label: "Crescimento",
        tooltip: "Gráficos de crescimento de seguidores e engajamento",
        icon: BarChart3,
        route: "/performance",
      },
      {
        id: "report",
        label: "Relatório Semanal",
        tooltip: "Resumo de desempenho e recomendações",
        icon: FileText,
        route: "/home",
      },
    ],
  },
  {
    label: "ESTRATÉGIA",
    description: "Defina direção e regras",
    items: [
      {
        id: "pillars",
        label: "Pilares da Campanha",
        tooltip: "Objetivos principais e temas que devem guiar todos os posts",
        icon: Target,
        route: "/home",
      },
      {
        id: "donts",
        label: "Alertas e Regras",
        tooltip: "O que fazer e o que evitar para manter a qualidade",
        icon: ShieldAlert,
        route: "/home",
      },
      {
        id: "moodboard",
        label: "Referências Visuais",
        tooltip: "Inspiração de cores, estilos e design",
        icon: Palette,
        route: "/home",
      },
    ],
  },
  {
    label: "RECURSOS",
    description: "Equipe e orçamento",
    items: [
      {
        id: "team",
        label: "Equipe",
        tooltip: "Papéis, responsabilidades e horas de trabalho necessárias",
        icon: Users,
        route: "/home",
      },
      {
        id: "budget",
        label: "Orçamento",
        tooltip: "Investimento mensal em publicidade e produção",
        icon: DollarSign,
        route: "/home",
      },
    ],
  },
  {
    label: "COMUNICAÇÃO",
    description: "Engaje com apoiadores",
    items: [
      {
        id: "supporters",
        label: "Guia do Apoiador",
        tooltip: "Protocolo de engajamento e missões para voluntários",
        icon: Heart,
        route: "/apoiadores",
      },
      {
        id: "notifications",
        label: "Notificações",
        tooltip: "Alertas sobre posts e lembretes de ações",
        icon: Bell,
        route: "/home",
      },
      {
        id: "testimonials",
        label: "Depoimentos",
        tooltip: "Histórias e feedback de apoiadores",
        icon: MessageCircle,
        route: "/home",
      },
    ],
  },
  {
    label: "EXTRAS",
    description: "Ferramentas adicionais",
    items: [
      {
        id: "competitors",
        label: "Concorrentes",
        tooltip: "Compare seu desempenho com outros perfis",
        icon: BarChart3,
        route: "/home",
      },
      {
        id: "checklist",
        label: "Checklist",
        tooltip: "Lista de verificação antes de publicar",
        icon: CheckSquare,
        route: "/home",
      },
    ],
  },
];

const ADMIN_NAV_GROUP: NavGroup = {
  label: "ADMINISTRAÇÃO",
  description: "Gerenciar plataforma",
  items: [
    {
      id: "admin",
      label: "Painel de Admin",
      tooltip: "Gerenciar usuários, permissões e configurações da plataforma",
      icon: Shield,
      route: "/admin",
    },
  ],
};

interface SidebarProps {
  activeSection?: string;
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/apoiadores` : "/apoiadores";

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Heart size={14} className="text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Link para Apoiadores</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Compartilhe nos grupos de WhatsApp dos voluntários
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-semibold transition-all ${
            copied
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Link Copiado!" : "Copiar Link"}
        </button>
        <a
          href="/apoiadores"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-2 py-1.5 rounded text-[10px] font-semibold bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10 transition-all"
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function NavGroupComponent({
  group,
  activeRoute,
  setMobileOpen,
}: {
  group: NavGroup;
  activeRoute: string;
  setMobileOpen: (open: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider hover:text-muted-foreground transition-colors"
      >
        <span>{group.label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`}
        />
      </button>

      {expanded && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <div key={item.id} className="flex items-center gap-2 group/item">
                <a
                  href={item.route}
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation(item.route);
                    setMobileOpen(false);
                  }}
                  className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary/15 text-sidebar-primary-foreground border-l-2 border-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-primary" : ""} />
                  <span className="font-medium text-left">{item.label}</span>
                </a>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <InfoTooltip text={item.tooltip} side="right" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ activeSection }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout?.();
  };

  // Determinar o nível de acesso
  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      visitor: "👁️ Visitante",
      team: "👥 Equipe",
      coordinator: "📋 Coordenador",
      superadmin: "🔑 SuperAdmin",
    };
    return labels[role || "visitor"] || "Usuário";
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-11 h-11 object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-none">
                BRASÍLIA
              </h1>
              <p className="text-[10px] font-medium text-primary tracking-[0.2em] uppercase">
                Cidade Parque
              </p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm border border-primary/30">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name || "Usuário"}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <NavGroupComponent
              key={group.label}
              group={group}
              activeRoute={location}
              setMobileOpen={setMobileOpen}
            />
          ))}
          {user?.role === "superadmin" && (
            <NavGroupComponent
              group={ADMIN_NAV_GROUP}
              activeRoute={location}
              setMobileOpen={setMobileOpen}
            />
          )}
        </nav>

        {/* Link Apoiadores */}
        <div className="px-3 pb-3">
          <CopyLinkButton />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-500/40"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
          <div className="flex flex-col items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-16 h-16 object-contain opacity-40"
            />
            <div className="text-[10px] text-muted-foreground text-center">
              <p>Painel Interno da Campanha</p>
              <p className="mt-0.5">Abr - Out 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
