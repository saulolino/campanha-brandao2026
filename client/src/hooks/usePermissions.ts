import { useAuth } from "@/_core/hooks/useAuth";
import { getPermissions, hasPermission, type UserRole } from "@shared/permissions";

/**
 * Hook para verificar permissões do usuário atual
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role as UserRole) || "visitor";

  return {
    role,
    permissions: getPermissions(role),
    hasPermission: (permission: keyof ReturnType<typeof getPermissions>) =>
      hasPermission(role, permission),
    isVisitor: role === "visitor",
    isTeam: role === "team",
    isCoordinator: role === "coordinator",
    isSuperAdmin: role === "superadmin",
  };
}
