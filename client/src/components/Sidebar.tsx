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
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import InfoTooltip from "./InfoTooltip";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

interface NavGroup {
  label: string;
  description: string;
  items: Array<{
    id: string;
    label: string;
    tooltip: string;
    icon: any;
  }>;
}

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
      },
      {
        id: "realtime",
        label: "Métricas Live",
        tooltip: "Dados atualizados do Instagram em tempo real",
        icon: Activity,
      },
      {
        id: "publicacoes",
        label: "Gerenciador de Publicações",
        tooltip: "Fluxo colaborativo: Designer → Redator → Coordenador → Publicação",
        icon: Copy,
      },
      {
        id: "performance",
        label: "Performance de Posts",
        tooltip: "Métricas e análises dos posts publicados",
        icon: TrendingUp,
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
      },
      {
        id: "calendar",
        label: "Calendário Semanal",
        tooltip: "Visualize posts por semana com detalhes",
        icon: CalendarDays,
      },
      {
        id: "monthlycal",
        label: "Calendário Mensal",
        tooltip: "Visão geral de todos os posts do mês",
        icon: CalendarDays,
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
      },
      {
        id: "content",
        label: "Pilares de Conteúdo",
        tooltip: "Temas principais e tipos de posts que funcionam melhor",
        icon: TreePine,
      },
      {
        id: "briefing",
        label: "Briefing Criativo",
        tooltip: "Instruções detalhadas para criar posts de impacto",
        icon: Sparkles,
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
      },
      {
        id: "growth",
        label: "Crescimento",
        tooltip: "Gráficos de crescimento de seguidores e engajamento",
        icon: BarChart3,
      },
      {
        id: "report",
        label: "Relatório Semanal",
        tooltip: "Resumo de desempenho e recomendações",
        icon: FileText,
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
      },
      {
        id: "donts",
        label: "Alertas e Regras",
        tooltip: "O que fazer e o que evitar para manter a qualidade",
        icon: ShieldAlert,
      },
      {
        id: "moodboard",
        label: "Referências Visuais",
        tooltip: "Inspiração de cores, estilos e design",
        icon: Palette,
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
      },
      {
        id: "budget",
        label: "Orçamento",
        tooltip: "Investimento mensal em publicidade e produção",
        icon: DollarSign,
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
      },
      {
        id: "notifications",
        label: "Notificações",
        tooltip: "Alertas sobre posts e lembretes de ações",
        icon: Bell,
      },
      {
        id: "testimonials",
        label: "Depoimentos",
        tooltip: "Histórias e feedback de apoiadores",
        icon: MessageCircle,
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
      },
      {
        id: "checklist",
        label: "Checklist",
        tooltip: "Lista de verificação antes de publicar",
        icon: CheckSquare,
      },
      {
        id: "configuracoes",
        label: "Configurações",
        tooltip: "Credenciais do Instagram, sincronização e relatórios",
        icon: Settings,
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
    },
  ],
};

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

function LogoutButton() {
  const [, navigate] = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const handleLogout = async () => {
    // Limpar localStorage
    localStorage.removeItem("user");
    setShowConfirm(false);
    // Limpar cookie de sessão JWT no servidor
    try {
      await fetch("/api/trpc/auth.logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "0": { json: null } }),
      });
    } catch {
      // Ignorar erros de rede — o localStorage já foi limpo
    }
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors text-red-400 hover:text-red-300 text-sm font-medium"
      >
        <LogOut size={16} />
        Sair
      </button>
      <LogoutConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleLogout}
      />
    </>
  );
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
  activeSection,
  onNavigate,
  setMobileOpen,
}: {
  group: NavGroup;
  activeSection: string;
  onNavigate: (section: string) => void;
  setMobileOpen: (open: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);

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
            const isActive = activeSection === item.id;
            return (
              <div key={item.id} className="flex items-center gap-2 group/item">
                <a
                  href={getRouteForItem(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
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


const getRouteForItem = (itemId: string): string => {
  const routes: Record<string, string> = {
  "dashboard": "/dashboard",
  "realtime": "/dashboard",
  "publicacoes": "/publicacoes",
  "performance": "/performance",
  "nextweek": "/planejamento",
  "calendar": "/planejamento",
  "monthlycal": "/planejamento",
  "contentbank": "/conteudo",
  "content": "/conteudo",
  "briefing": "/conteudo",
  "tracker": "/analise",
  "growth": "/analise",
  "report": "/analise",
  "competitors": "/analise",
  "pillars": "/conteudo",
  "donts": "/conteudo",
  "moodboard": "/conteudo",
  "team": "/conteudo",
  "budget": "/conteudo",
  "supporters": "/apoiadores",
  "notifications": "/home",
  "testimonials": "/home",
  "checklist": "/home",
  "admin": "/admin"
};
  return routes[itemId] || "/home";
};

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSuperAdmin, isCoordinator, isTeam, isVisitor } = usePermissions();
  const { user } = useLocalAuth();

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
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
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
              {(user?.nome || user?.name)?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.nome || user?.name || "Usuário"}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
              <p className="text-[10px] text-primary/70 truncate">
                {isSuperAdmin ? "🔑 SuperAdmin" : isCoordinator ? "📋 Coordenador" : isTeam ? "👥 Equipe" : "👁️ Visitante"}
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
              activeSection={activeSection}
              onNavigate={onNavigate}
              setMobileOpen={setMobileOpen}
            />
          ))}
          {isSuperAdmin && (
            <NavGroupComponent
              group={ADMIN_NAV_GROUP}
              activeSection={activeSection}
              onNavigate={onNavigate}
              setMobileOpen={setMobileOpen}
            />
          )}
        </nav>

        {/* Link Apoiadores */}
        <div className="px-3 pb-3">
          <CopyLinkButton />
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-sidebar-border space-y-4">
          <LogoutButton />
          <div className="flex flex-col items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
              alt="Brasília Cidade Parque"
              className="w-16 h-16 object-contain opacity-70"
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
