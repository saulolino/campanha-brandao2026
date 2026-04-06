import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { type UserRole } from "@shared/permissions";
import NotFound from "@/pages/NotFound";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente para proteger rotas por role ou permissão
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { role, hasPermission } = usePermissions();

  // Enquanto carrega, não renderizar nada
  if (loading) {
    return null;
  }

  // Visitante não tem acesso a nada
  if (role === "visitor") {
    return fallback || <NotFound />;
  }

  // Verificar role obrigatório
  if (requiredRole && !requiredRole.includes(role)) {
    return fallback || <NotFound />;
  }

  // Verificar permissão específica
  if (requiredPermission) {
    const permissionKey = requiredPermission as keyof ReturnType<typeof usePermissions>["permissions"];
    if (!hasPermission(permissionKey)) {
      return fallback || <NotFound />;
    }
  }

  return <>{children}</>;
}

/**
 * Componente para renderizar condicional baseado em permissão
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
