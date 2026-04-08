import { LayoutDashboard, Calendar, Lightbulb, BarChart3, TrendingUp, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { FileText } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: LayoutDashboard, route: "/home" },
  { id: "conteudo", label: "Conteúdo", icon: Calendar, route: "/conteudo" },
  { id: "estrategia", label: "Estratégia", icon: Lightbulb, route: "/estrategia" },
  { id: "metricas", label: "Métricas", icon: BarChart3, route: "/metricas" },
  { id: "projecoes", label: "Projeções", icon: TrendingUp, route: "/projecoes" },
  { id: "relatorios", label: "Relatórios", icon: FileText, route: "/relatorios" },
  { id: "configuracoes", label: "Configurações", icon: Settings, route: "/configuracoes" },
];

interface SidebarNavProps {
  activeSection: string;
}

export default function SidebarNav({ activeSection }: SidebarNavProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (route: string) => {
    navigate(route);
    setIsOpen(false);
  };

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
        className={`fixed md:relative w-64 h-screen bg-slate-900 text-slate-50 border-r border-slate-800 overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-green-400 mb-1">Brasília</h1>
          <p className="text-xs text-slate-400">Cidade Parque</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 rounded-lg transition-colors text-red-400 hover:text-red-300 text-sm font-medium">
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
