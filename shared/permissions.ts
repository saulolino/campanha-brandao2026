/**
 * Sistema de permissões com 4 níveis de hierarquia
 */

export type UserRole = "visitor" | "team" | "coordinator" | "superadmin";

export interface Permission {
  canViewDashboard: boolean;
  canViewMetrics: boolean;
  canViewPublicationManager: boolean;
  canViewPerformance: boolean;
  canViewSupporters: boolean;
  canViewAgendas: boolean;
  canEditPost: boolean;
  canPublishPost: boolean;
  canDeletePost: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessSettings: boolean;
}

/**
 * Mapa de permissões por role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  visitor: {
    canViewDashboard: false,
    canViewMetrics: false,
    canViewPublicationManager: false,
    canViewPerformance: false,
    canViewSupporters: false,
    canViewAgendas: true, // Visitante pode ver as agendas (somente leitura)
    canEditPost: false,
    canPublishPost: false,
    canDeletePost: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessSettings: false,
  },
  team: {
    canViewDashboard: true,
    canViewMetrics: true,
    canViewPublicationManager: true,
    canViewPerformance: true,
    canViewSupporters: true,
    canViewAgendas: true,
    canEditPost: true,
    canPublishPost: false, // Team não pode publicar
    canDeletePost: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessSettings: false,
  },
  coordinator: {
    canViewDashboard: true,
    canViewMetrics: true,
    canViewPublicationManager: true,
    canViewPerformance: true,
    canViewSupporters: true,
    canViewAgendas: true,
    canEditPost: true,
    canPublishPost: true, // Coordenador pode publicar
    canDeletePost: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessSettings: false,
  },
  superadmin: {
    canViewDashboard: true,
    canViewMetrics: true,
    canViewPublicationManager: true,
    canViewPerformance: true,
    canViewSupporters: true,
    canViewAgendas: true,
    canEditPost: true,
    canPublishPost: true,
    canDeletePost: true,
    canManageUsers: true, // SuperAdmin gerencia usuários
    canViewAnalytics: true,
    canAccessSettings: true,
  },
};

/**
 * Obter permissões de um role
 */
export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

/**
 * Verificar se um role tem uma permissão específica
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Descrições dos roles para UI
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string }> = {
  visitor: {
    label: "Visitante",
    description: "Pode visualizar as agendas de conteúdo e de rua",
  },
  team: {
    label: "Equipe",
    description: "Acesso total, mas não pode publicar",
  },
  coordinator: {
    label: "Coordenador",
    description: "Acesso total e pode publicar",
  },
  superadmin: {
    label: "SuperAdmin",
    description: "Super poderes - gerencia tudo",
  },
};
