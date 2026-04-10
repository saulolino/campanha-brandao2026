import {
  LayoutDashboard,
  Target,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Copy,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

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
    label: "PRINCIPAL",
    description: "Navegação central",
    items: [
      {
        id: "dashboard",
        label: "Painel Principal",
        tooltip: "KPIs e progresso da pré campanha",
        icon: LayoutDashboard,
      },
      {
        id: "conteudo",
        label: "Conteúdo",
        tooltip: "Calendário semanal e timeline de posts",
        icon: CalendarDays,
      },
      {
        id: "estrategia",
        label: "Estratégia",
        tooltip: "Tema, narrativa e objetivos estratégicos",
        icon: Target,
      },
      {
        id: "metricas",
        label: "Métricas",
        tooltip: "Engajamento, curtidas e performance",
        icon: BarChart3,
      },
      {
        id: "projecoes",
        label: "Projeções",
        tooltip: "Crescimento, metas e investimento",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "RECURSOS",
    description: "Ferramentas adicionais",
    items: [
      {
        id: "publicacoes",
        label: "Gerenciador de Publicações",
        tooltip: "Fluxo colaborativo de posts",
        icon: Copy,
      },
      {
        id: "supporters",
        label: "Apoiadores",
        tooltip: "Guia e engajamento com voluntários",
        icon: Heart,
      },
      {
        id: "configuracoes",
        label: "Configurações",
        tooltip: "Credenciais e preferências",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function SidebarNew({ activeSection, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-primary-foreground p-2 rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-sidebar-primary mb-1">Brasília</h1>
          <p className="text-xs text-sidebar-foreground/60">Cidade Parque</p>
        </div>

        <nav className="space-y-8 px-4 pb-20">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsOpen(false);
                      }}
                      title={item.tooltip}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors text-red-400 hover:text-red-300 text-sm font-medium">
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
