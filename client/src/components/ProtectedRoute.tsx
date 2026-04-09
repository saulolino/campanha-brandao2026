import { useEffect } from "react";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@shared/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles que têm acesso. Se omitido, qualquer role autenticado (não visitor) tem acesso. */
  requiredRole?: UserRole[];
  /** Permissão específica necessária */
  requiredPermission?: keyof ReturnType<typeof usePermissions>["permissions"];
  /** Onde redirecionar se não tiver acesso. Padrão: /home */
  redirectTo?: string;
}

/**
 * Guard de rota baseado no sistema de auth local (useLocalAuth + usePermissions).
 * - Visitante → redireciona para /home
 * - Role insuficiente → redireciona para /home
 * - Permissão insuficiente → redireciona para /home
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = "/home",
}: ProtectedRouteProps) {
  const { role, hasPermission, isVisitor } = usePermissions();
  const [, navigate] = useLocation();

  const isAllowed = (() => {
    // Visitante não tem acesso a nenhuma rota protegida
    if (isVisitor) return false;
    // Verificar role obrigatório
    if (requiredRole && !requiredRole.includes(role)) return false;
    // Verificar permissão específica
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  })();

  useEffect(() => {
    if (!isAllowed) {
      navigate(redirectTo);
    }
  }, [isAllowed, navigate, redirectTo]);

  if (!isAllowed) return null;

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
