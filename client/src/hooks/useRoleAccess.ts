/**
 * Hook para controlar acesso baseado em role
 * Define permissões para cada role do sistema
 */

export type UserRole = 'visitor' | 'team' | 'coordinator' | 'superadmin';

export interface RolePermissions {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canViewBudget: boolean;
  canViewStrategy: boolean;
}

/**
 * Matriz de permissões por role
 */
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  visitor: {
    canView: true,
    canEdit: false,
    canPublish: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewBudget: false,
    canViewStrategy: false,
  },
  team: {
    canView: true,
    canEdit: true,
    canPublish: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewBudget: true,
    canViewStrategy: true,
  },
  coordinator: {
    canView: true,
    canEdit: true,
    canPublish: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewBudget: true,
    canViewStrategy: true,
  },
  superadmin: {
    canView: true,
    canEdit: true,
    canPublish: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canViewBudget: true,
    canViewStrategy: true,
  },
};

/**
 * Hook para obter permissões do usuário
 */
export function useRoleAccess(userRole?: UserRole | null): RolePermissions {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    // Retornar permissões mínimas se role não for fornecido
    return ROLE_PERMISSIONS.visitor;
  }

  return ROLE_PERMISSIONS[userRole];
}

/**
 * Verificar se usuário tem permissão específica
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: keyof RolePermissions
): boolean {
  if (!userRole) return false;
  const permissions = useRoleAccess(userRole);
  return permissions[permission] === true;
}

/**
 * Obter descrição legível do role
 */
export function getRoleLabel(role: UserRole | null | undefined): string {
  const labels: Record<UserRole, string> = {
    visitor: 'Visitante',
    team: 'Equipe',
    coordinator: 'Coordenador',
    superadmin: 'Superadmin',
  };

  return role ? labels[role] : 'Desconhecido';
}

/**
 * Obter cor do badge do role
 */
export function getRoleBadgeColor(role: UserRole | null | undefined): string {
  const colors: Record<UserRole, string> = {
    visitor: 'bg-gray-100 text-gray-800',
    team: 'bg-blue-100 text-blue-800',
    coordinator: 'bg-green-100 text-green-800',
    superadmin: 'bg-red-100 text-red-800',
  };

  return role ? colors[role] : 'bg-gray-100 text-gray-800';
}
