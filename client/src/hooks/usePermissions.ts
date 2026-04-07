import { useLocalAuth } from "./useLocalAuth";
import { getPermissions, hasPermission, type UserRole } from "@shared/permissions";

/**
 * Hook para verificar permissões do usuário atual
 */
export function usePermissions() {
  const { user } = useLocalAuth();
  const role = (user?.role as UserRole) || "visitor";

  return {
    role,
    user,
    permissions: getPermissions(role),
    hasPermission: (permission: keyof ReturnType<typeof getPermissions>) =>
      hasPermission(role, permission),
    isVisitor: role === "visitor",
    isTeam: role === "team",
    isCoordinator: role === "coordinator",
    isSuperAdmin: role === "superadmin",
  };
}
