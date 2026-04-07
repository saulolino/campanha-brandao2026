import { useAuth } from "@/_core/hooks/useAuth";

export type UserRole = "visitor" | "team" | "coordinator" | "superadmin";
export type PostStatus = "draft" | "design" | "caption" | "review" | "scheduled" | "published" | "failed";

interface PermissionRule {
  role: UserRole;
  allowedTransitions: PostStatus[];
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

const PERMISSION_RULES: Record<UserRole, PermissionRule> = {
  visitor: {
    role: "visitor",
    allowedTransitions: [],
    canEdit: false,
    canDelete: false,
    canPublish: false,
  },
  team: {
    role: "team",
    allowedTransitions: ["design", "caption"],
    canEdit: true,
    canDelete: false,
    canPublish: false,
  },
  coordinator: {
    role: "coordinator",
    allowedTransitions: ["review", "scheduled", "published"],
    canEdit: true,
    canDelete: true,
    canPublish: true,
  },
  superadmin: {
    role: "superadmin",
    allowedTransitions: ["draft", "design", "caption", "review", "scheduled", "published"],
    canEdit: true,
    canDelete: true,
    canPublish: true,
  },
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  visitor: "Visitante",
  team: "Equipe",
  coordinator: "Coordenador",
  superadmin: "Superadmin",
};

const TRANSITION_DESCRIPTIONS: Record<PostStatus, string> = {
  draft: "Rascunho",
  design: "Design",
  caption: "Legenda",
  review: "Revisão",
  scheduled: "Agendado",
  published: "Publicado",
  failed: "Falhou",
};

export interface PostPermissionCheck {
  canTransitionTo: (newStatus: PostStatus) => boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  getErrorMessage: (action: string) => string;
  getTransitionMessage: (currentStatus: PostStatus, newStatus: PostStatus) => string;
}

export function usePostPermissions(): PostPermissionCheck {
  const { user } = useAuth();
  const userRole = (user?.role as UserRole) || "visitor";
  const permissions = PERMISSION_RULES[userRole];

  const canTransitionTo = (newStatus: PostStatus): boolean => {
    return permissions.allowedTransitions.includes(newStatus);
  };

  const getErrorMessage = (action: string): string => {
    const roleDesc = ROLE_DESCRIPTIONS[userRole];
    
    switch (action) {
      case "edit":
        return permissions.canEdit
          ? ""
          : `${roleDesc} não tem permissão para editar posts.`;
      case "delete":
        return permissions.canDelete
          ? ""
          : `${roleDesc} não tem permissão para deletar posts.`;
      case "publish":
        return permissions.canPublish
          ? ""
          : `${roleDesc} não tem permissão para publicar posts.`;
      case "transition":
        return `${roleDesc} não tem permissão para mover posts entre etapas.`;
      default:
        return `${roleDesc} não tem permissão para realizar esta ação.`;
    }
  };

  const getTransitionMessage = (currentStatus: PostStatus, newStatus: PostStatus): string => {
    const roleDesc = ROLE_DESCRIPTIONS[userRole];
    const fromDesc = TRANSITION_DESCRIPTIONS[currentStatus];
    const toDesc = TRANSITION_DESCRIPTIONS[newStatus];

    if (!canTransitionTo(newStatus)) {
      return `❌ ${roleDesc} não pode mover posts de ${fromDesc} para ${toDesc}. Permissão negada.`;
    }

    return `✅ Post movido de ${fromDesc} para ${toDesc} por ${roleDesc}.`;
  };

  return {
    canTransitionTo,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
    canPublish: permissions.canPublish,
    getErrorMessage,
    getTransitionMessage,
  };
}

/**
 * Validar se um usuário pode realizar uma ação específica
 * @param userRole - Role do usuário
 * @param action - Ação a ser validada (edit, delete, publish, transition)
 * @param targetStatus - Status alvo (para transições)
 * @returns Objeto com validação e mensagem de erro
 */
export function validatePostPermission(
  userRole: UserRole,
  action: string,
  targetStatus?: PostStatus
): { allowed: boolean; message: string } {
  const permissions = PERMISSION_RULES[userRole];
  const roleDesc = ROLE_DESCRIPTIONS[userRole];

  switch (action) {
    case "edit":
      return {
        allowed: permissions.canEdit,
        message: permissions.canEdit
          ? ""
          : `${roleDesc} não tem permissão para editar posts.`,
      };

    case "delete":
      return {
        allowed: permissions.canDelete,
        message: permissions.canDelete
          ? ""
          : `${roleDesc} não tem permissão para deletar posts.`,
      };

    case "publish":
      return {
        allowed: permissions.canPublish,
        message: permissions.canPublish
          ? ""
          : `${roleDesc} não tem permissão para publicar posts.`,
      };

    case "transition":
      if (!targetStatus) {
        return {
          allowed: false,
          message: "Status alvo não especificado.",
        };
      }
      const canTransition = permissions.allowedTransitions.includes(targetStatus);
      return {
        allowed: canTransition,
        message: canTransition
          ? ""
          : `${roleDesc} não pode mover posts para ${TRANSITION_DESCRIPTIONS[targetStatus]}.`,
      };

    default:
      return {
        allowed: false,
        message: `Ação desconhecida: ${action}`,
      };
  }
}
