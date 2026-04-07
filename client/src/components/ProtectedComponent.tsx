import React from 'react';
import { hasPermission, UserRole, RolePermissions } from '@/hooks/useRoleAccess';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredPermission: keyof RolePermissions;
  userRole: UserRole | null | undefined;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza conteúdo apenas se o usuário tiver a permissão necessária
 */
export function ProtectedComponent({
  children,
  requiredPermission,
  userRole,
  fallback = null,
}: ProtectedComponentProps) {
  if (!hasPermission(userRole, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RestrictedSectionProps {
  children: React.ReactNode;
  requiredPermission: keyof RolePermissions;
  userRole: UserRole | null | undefined;
  title?: string;
}

/**
 * Componente que renderiza uma seção com restrição de acesso
 * Mostra mensagem se o usuário não tiver permissão
 */
export function RestrictedSection({
  children,
  requiredPermission,
  userRole,
  title = 'Acesso Restrito',
}: RestrictedSectionProps) {
  if (!hasPermission(userRole, requiredPermission)) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">{title}</p>
        <p className="text-yellow-700 text-sm mt-1">
          Você não tem permissão para acessar esta seção.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

interface DisabledButtonProps {
  children: React.ReactNode;
  requiredPermission: keyof RolePermissions;
  userRole: UserRole | null | undefined;
  onClick?: () => void;
  className?: string;
}

/**
 * Botão que é desabilitado se o usuário não tiver a permissão necessária
 */
export function ProtectedButton({
  children,
  requiredPermission,
  userRole,
  onClick,
  className = '',
}: DisabledButtonProps) {
  const hasAccess = hasPermission(userRole, requiredPermission);

  return (
    <button
      onClick={onClick}
      disabled={!hasAccess}
      className={`
        ${className}
        ${hasAccess ? '' : 'opacity-50 cursor-not-allowed'}
      `}
      title={!hasAccess ? 'Você não tem permissão para esta ação' : ''}
    >
      {children}
    </button>
  );
}
