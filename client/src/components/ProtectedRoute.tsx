import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@shared/permissions";
import AcessoNegado from "@/pages/AcessoNegado";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles que têm acesso. Se omitido, qualquer role autenticado (não visitor) tem acesso. */
  requiredRole?: UserRole[];
  /** Permissão específica necessária */
  requiredPermission?: keyof ReturnType<typeof usePermissions>["permissions"];
  /** Onde redirecionar se não tiver acesso. Padrão: /home (para visitantes não autenticados) */
  redirectTo?: string;
  /** Rota tentada — exibida na página de acesso negado */
  rotaTentada?: string;
  /**
   * Se true, exibe a página AcessoNegado em vez de redirecionar silenciosamente.
   * Use false apenas para rotas que devem redirecionar visitantes não autenticados para login.
   * Padrão: true
   */
  showDeniedPage?: boolean;
}

/**
 * Guard de rota baseado no sistema de auth local (useLocalAuth + usePermissions).
 *
 * IMPORTANTE: aguarda o loading do localStorage antes de tomar qualquer decisão.
 * Sem isso, ocorre condição de corrida: user=null enquanto carrega → role="visitor" → redirect indevido.
 *
 * - Loading → renderiza null (aguarda)
 * - Visitante → redireciona para /home
 * - Role insuficiente → redireciona para /home
 * - Permissão insuficiente → redireciona para /home
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = "/login",
  rotaTentada,
  showDeniedPage = true,
}: ProtectedRouteProps) {
  const { loading, user } = useLocalAuth();
  const { role, hasPermission, isVisitor } = usePermissions();
  const [, navigate] = useLocation();

  const isAllowed = (() => {
    // Ainda carregando — não decidir ainda
    if (loading) return null;
    // Visitante: só tem acesso se o role "visitor" estiver explicitamente na lista requiredRole
    if (isVisitor) {
      if (requiredRole && requiredRole.includes("visitor")) return true;
      return false;
    }
    // Verificar role obrigatório
    if (requiredRole && !requiredRole.includes(role)) return false;
    // Verificar permissão específica
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  })();

  // Usuário não está logado (visitor sem user no localStorage) → redirecionar para login
  const isUnauthenticated = isAllowed === false && !user;

  useEffect(() => {
    // Só redireciona se não estiver logado (sem user no localStorage)
    if (isUnauthenticated) {
      navigate(redirectTo);
    }
  }, [isUnauthenticated, navigate, redirectTo]);

  // Aguardando localStorage
  if (isAllowed === null) return null;

  // Não autenticado — aguardando redirect
  if (isUnauthenticated) return null;

  // Autenticado mas sem permissão → exibir página de acesso negado
  if (isAllowed === false) {
    if (showDeniedPage) {
      return <AcessoNegado rotaTentada={rotaTentada} />;
    }
    return null;
  }

  return <>{children}</>;
}

/**
 * Componente para renderizar condicional baseado em permissão.
 * Não redireciona — apenas oculta o conteúdo.
 */
export function ConditionalRender({
  children,
  requiredPermission,
  fallback = null,
}: {
  children: React.ReactNode;
  requiredPermission: keyof ReturnType<typeof usePermissions>["permissions"];
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
