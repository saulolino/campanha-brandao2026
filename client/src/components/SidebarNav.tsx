import { LayoutDashboard, Calendar, Lightbulb, BarChart3, TrendingUp, Settings, LogOut, Menu, X, FileText, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@shared/permissions";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { trpc } from "@/lib/trpc";

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
  showPendingBadge?: boolean;
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
    id: "agenda-rua",
    label: "Agenda de Rua",
    icon: MapPin,
    route: "/agenda-rua",
    allowedRoles: ["team", "coordinator", "superadmin"],
  },
  {
    id: "planejamento-semanal",
    label: "Planejamento IA",
    icon: Sparkles,
    route: "/planejamento-semanal",
    allowedRoles: ["coordinator", "superadmin"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    route: "/configuracoes",
    allowedRoles: ["superadmin"], // Exclusivo do Superadmin
    showPendingBadge: true, // Exibir badge de usuários pendentes
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

  // Buscar contagem de usuários pendentes (apenas para superadmin e coordinator)
  const canSeePending = isSuperAdmin || isCoordinator;
  const { data: pendingData } = trpc.users.countPending.useQuery(undefined, {
    enabled: canSeePending,
    refetchInterval: 60_000, // Atualizar a cada 60 segundos
    staleTime: 30_000,
  });
  const pendingCount = pendingData?.count ?? 0;

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
            const showBadge = item.showPendingBadge && canSeePending && pendingCount > 0;
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
                <span className="flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
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

        {/* Logout + Logos */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 rounded-lg transition-colors text-red-400 hover:text-red-300 text-sm font-medium"
          >
            <LogOut size={16} />
            Sair
          </button>
          <div className="flex items-center justify-center gap-3 pt-1">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
              alt="Brasília Cidade Parque"
              className="w-10 h-10 object-contain opacity-60"
            />
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/Ativo1_7906de7f.png"
              alt="Eduardo Brandão"
              className="h-8 object-contain opacity-60"
            />
          </div>
          <p className="text-[10px] text-slate-500 text-center">Pré campanha Eduardo Brandão · DF 2026</p>
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
