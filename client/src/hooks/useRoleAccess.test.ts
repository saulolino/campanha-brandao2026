import { describe, it, expect } from 'vitest';
import {
  useRoleAccess,
  hasPermission,
  getRoleLabel,
  getRoleBadgeColor,
} from './useRoleAccess';

describe('useRoleAccess', () => {
  describe('useRoleAccess hook', () => {
    it('deve retornar permissões para visitante', () => {
      const permissions = useRoleAccess('visitor');

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canPublish).toBe(false);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canViewBudget).toBe(false);
      expect(permissions.canViewStrategy).toBe(false);
    });

    it('deve retornar permissões para equipe', () => {
      const permissions = useRoleAccess('team');

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canPublish).toBe(false);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canViewBudget).toBe(true);
      expect(permissions.canViewStrategy).toBe(true);
    });

    it('deve retornar permissões para coordenador', () => {
      const permissions = useRoleAccess('coordinator');

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canPublish).toBe(true);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canViewBudget).toBe(true);
      expect(permissions.canViewStrategy).toBe(true);
    });

    it('deve retornar permissões para superadmin', () => {
      const permissions = useRoleAccess('superadmin');

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(true);
      expect(permissions.canPublish).toBe(true);
      expect(permissions.canManageUsers).toBe(true);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canViewBudget).toBe(true);
      expect(permissions.canViewStrategy).toBe(true);
    });

    it('deve retornar permissões mínimas para role inválido', () => {
      const permissions = useRoleAccess(null);

      expect(permissions.canView).toBe(true);
      expect(permissions.canEdit).toBe(false);
      expect(permissions.canPublish).toBe(false);
    });
  });

  describe('hasPermission function', () => {
    it('deve retornar true se usuário tem permissão', () => {
      expect(hasPermission('superadmin', 'canPublish')).toBe(true);
      expect(hasPermission('coordinator', 'canPublish')).toBe(true);
      expect(hasPermission('team', 'canEdit')).toBe(true);
    });

    it('deve retornar false se usuário não tem permissão', () => {
      expect(hasPermission('visitor', 'canPublish')).toBe(false);
      expect(hasPermission('team', 'canPublish')).toBe(false);
      expect(hasPermission('visitor', 'canManageUsers')).toBe(false);
    });

    it('deve retornar false se role é null', () => {
      expect(hasPermission(null, 'canPublish')).toBe(false);
    });
  });

  describe('getRoleLabel function', () => {
    it('deve retornar label correto para cada role', () => {
      expect(getRoleLabel('visitor')).toBe('Visitante');
      expect(getRoleLabel('team')).toBe('Equipe');
      expect(getRoleLabel('coordinator')).toBe('Coordenador');
      expect(getRoleLabel('superadmin')).toBe('Superadmin');
    });

    it('deve retornar "Desconhecido" para role inválido', () => {
      expect(getRoleLabel(null)).toBe('Desconhecido');
      expect(getRoleLabel(undefined)).toBe('Desconhecido');
    });
  });

  describe('getRoleBadgeColor function', () => {
    it('deve retornar cor correta para cada role', () => {
      expect(getRoleBadgeColor('visitor')).toBe('bg-gray-100 text-gray-800');
      expect(getRoleBadgeColor('team')).toBe('bg-blue-100 text-blue-800');
      expect(getRoleBadgeColor('coordinator')).toBe('bg-green-100 text-green-800');
      expect(getRoleBadgeColor('superadmin')).toBe('bg-red-100 text-red-800');
    });

    it('deve retornar cor padrão para role inválido', () => {
      expect(getRoleBadgeColor(null)).toBe('bg-gray-100 text-gray-800');
      expect(getRoleBadgeColor(undefined)).toBe('bg-gray-100 text-gray-800');
    });
  });
});
