import { LayoutDashboard, Calendar, Lightbulb, BarChart3, TrendingUp, Settings, LogOut, Menu, X, FileText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@shared/permissions";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

/**
 * Itens de navegação com controle de acesso por role.
 *
 * Hierarquia:
 * - visitor     → apenas /home
 * - team        → home + conteúdo + estratégia + métricas + projeções + relatórios
 * - coordinator → tudo da equipe (pode publicar — controlado dentro das páginas)
 * - superadmin  → tudo + configurações
 */
const NAV_ITEMS: Array<{
  id: string;
  label: string;
  icon: React.ElementType;
  route: string;
  allowedRoles: UserRole[];
}> = [
  {
    id: "home",
    label: "Home",
    icon: LayoutDashboard,
    route: "/home",
    allowedRoles: ["visitor", "team", "coordinator", "superadmin"],
  },
  {
    id: "conteudo",
    label: "Conteúdo",
    icon: Calendar,
    route: "/conteudo",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "estrategia",
    label: "Estratégia",
    icon: Lightbulb,
    route: "/estrategia",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "metricas",
    label: "Métricas",
    icon: BarChart3,
    route: "/metricas",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "projecoes",
    label: "Projeções",
    icon: TrendingUp,
    route: "/projecoes",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: FileText,
    route: "/relatorios",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    route: "/configuracoes",
    allowedRoles: ["superadmin"], // Exclusivo do Superadmin
  },
];

interface SidebarNavProps {
  activeSection: string;
}

export default function SidebarNav({ activeSection }: SidebarNavProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user } = useLocalAuth();
  const { role, isSuperAdmin, isCoordinator, isTeam, isVisitor } = usePermissions();

  // Filtrar itens de navegação com base no role atual
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(role as UserRole)
  );

  const handleNavigate = (route: string) => {
    navigate(route);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("user");
    setShowLogoutConfirm(false);
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

  const roleLabel = isSuperAdmin
    ? "🔑 SuperAdmin"
    : isCoordinator
    ? "📋 Coordenador"
    : isTeam
    ? "👥 Equipe"
    : "👁️ Visitante";

  const roleBadgeColor = isSuperAdmin
    ? "text-yellow-400"
    : isCoordinator
    ? "text-blue-400"
    : isTeam
    ? "text-green-400"
    : "text-slate-400";

  const displayName = user?.nome || user?.name || "Usuário";
  const initials = displayName.charAt(0).toUpperCase();

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
        className={`fixed md:relative w-64 h-screen bg-slate-900 text-slate-50 border-r border-slate-800 overflow-y-auto transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-green-400 mb-1">Brasília</h1>
          <p className="text-xs text-slate-400">Cidade Parque</p>
        </div>

        {/* User Profile */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
              {user?.email && (
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              )}
              <p className={`text-[10px] font-medium ${roleBadgeColor}`}>{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Navigation — apenas itens permitidos para o role */}
        <nav className="p-4 space-y-1 flex-1">
          {visibleNavItems.map((item) => {
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

          {/* Mensagem para visitante */}
          {isVisitor && (
            <p className="text-[11px] text-slate-500 text-center mt-4 px-2">
              Acesso limitado. Solicite ao administrador para elevar seu nível de acesso.
            </p>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 rounded-lg transition-colors text-red-400 hover:text-red-300 text-sm font-medium"
          >
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

      {/* Logout Confirm Dialog */}
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
      />
    </>
  );
}
