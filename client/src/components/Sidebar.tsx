// DESIGN: Command Center Militar Verde
// Sidebar fixa à esquerda com navegação vertical
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
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "nextweek", label: "Próxima Semana", icon: CalendarClock },
  { id: "growth", label: "Crescimento", icon: BarChart3 },
  { id: "pillars", label: "Pilares", icon: Target },
  { id: "calendar", label: "Calendário", icon: CalendarDays },
  { id: "monthlycal", label: "Calendário Mensal", icon: CalendarDays },
  { id: "content", label: "Conteúdo", icon: TreePine },
  { id: "contentbank", label: "Banco de Conteúdo", icon: FolderOpen },
  { id: "tracker", label: "Status dos Posts", icon: ClipboardList },
  { id: "moodboard", label: "Referências", icon: Palette },
  { id: "report", label: "Relatório Semanal", icon: FileText },
  { id: "team", label: "Equipe", icon: Users },
  { id: "budget", label: "Orçamento", icon: DollarSign },
  { id: "donts", label: "Alertas", icon: ShieldAlert },
  { id: "competitors", label: "Concorrentes", icon: BarChart3 },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "realtime", label: "Métricas Live", icon: Activity },
  { id: "briefing", label: "Briefing Criativo", icon: Sparkles },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_34177559.svg"
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
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/avatar-eduardo-nQH7xhoaazLatTe6eFBT2H.webp"
              alt="Eduardo Brandão"
              className="w-9 h-9 rounded-full object-cover border border-primary/30"
            />
            <div>
              <p className="text-xs font-semibold text-sidebar-foreground">Eduardo Brandão</p>
              <p className="text-[10px] text-muted-foreground">@eduardobrandaopv</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={16} className={isActive ? "text-primary" : ""} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex flex-col items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_34177559.svg"
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
