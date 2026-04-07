import { describe, it, expect } from "vitest";
import { validatePostPermission, type UserRole, type PostStatus } from "./usePostPermissions";

describe("usePostPermissions - role-based access control", () => {
  describe("Visitor role", () => {
    const role: UserRole = "visitor";

    it("should not allow editing", () => {
      const result = validatePostPermission(role, "edit");
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("Visitante");
    });

    it("should not allow deleting", () => {
      const result = validatePostPermission(role, "delete");
      expect(result.allowed).toBe(false);
    });

    it("should not allow publishing", () => {
      const result = validatePostPermission(role, "publish");
      expect(result.allowed).toBe(false);
    });

    it("should not allow transitions", () => {
      const result = validatePostPermission(role, "transition", "design");
      expect(result.allowed).toBe(false);
    });
  });

  describe("Team role", () => {
    const role: UserRole = "team";

    it("should allow editing", () => {
      const result = validatePostPermission(role, "edit");
      expect(result.allowed).toBe(true);
      expect(result.message).toBe("");
    });

    it("should not allow deleting", () => {
      const result = validatePostPermission(role, "delete");
      expect(result.allowed).toBe(false);
    });

    it("should not allow publishing", () => {
      const result = validatePostPermission(role, "publish");
      expect(result.allowed).toBe(false);
    });

    it("should allow transition to design", () => {
      const result = validatePostPermission(role, "transition", "design");
      expect(result.allowed).toBe(true);
    });

    it("should allow transition to caption", () => {
      const result = validatePostPermission(role, "transition", "caption");
      expect(result.allowed).toBe(true);
    });

    it("should not allow transition to review", () => {
      const result = validatePostPermission(role, "transition", "review");
      expect(result.allowed).toBe(false);
    });

    it("should not allow transition to published", () => {
      const result = validatePostPermission(role, "transition", "published");
      expect(result.allowed).toBe(false);
    });
  });

  describe("Coordinator role", () => {
    const role: UserRole = "coordinator";

    it("should allow editing", () => {
      const result = validatePostPermission(role, "edit");
      expect(result.allowed).toBe(true);
    });

    it("should allow deleting", () => {
      const result = validatePostPermission(role, "delete");
      expect(result.allowed).toBe(true);
    });

    it("should allow publishing", () => {
      const result = validatePostPermission(role, "publish");
      expect(result.allowed).toBe(true);
    });

    it("should allow transition to review", () => {
      const result = validatePostPermission(role, "transition", "review");
      expect(result.allowed).toBe(true);
    });

    it("should allow transition to scheduled", () => {
      const result = validatePostPermission(role, "transition", "scheduled");
      expect(result.allowed).toBe(true);
    });

    it("should allow transition to published", () => {
      const result = validatePostPermission(role, "transition", "published");
      expect(result.allowed).toBe(true);
    });

    it("should not allow transition to design", () => {
      const result = validatePostPermission(role, "transition", "design");
      expect(result.allowed).toBe(false);
    });
  });

  describe("Superadmin role", () => {
    const role: UserRole = "superadmin";

    it("should allow editing", () => {
      const result = validatePostPermission(role, "edit");
      expect(result.allowed).toBe(true);
    });

    it("should allow deleting", () => {
      const result = validatePostPermission(role, "delete");
      expect(result.allowed).toBe(true);
    });

    it("should allow publishing", () => {
      const result = validatePostPermission(role, "publish");
      expect(result.allowed).toBe(true);
    });

    it("should allow all transitions", () => {
      const statuses: PostStatus[] = ["draft", "design", "caption", "review", "scheduled", "published"];
      statuses.forEach((status) => {
        const result = validatePostPermission(role, "transition", status);
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle missing target status for transition", () => {
      const result = validatePostPermission("team", "transition");
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("não especificado");
    });

    it("should handle unknown action", () => {
      const result = validatePostPermission("team", "unknown_action");
      expect(result.allowed).toBe(false);
      expect(result.message).toContain("desconhecida");
    });
  });

  describe("Permission matrix", () => {
    const roles: UserRole[] = ["visitor", "team", "coordinator", "superadmin"];
    const actions = ["edit", "delete", "publish"];

    it("should have consistent permission hierarchy", () => {
      const permissions: Record<UserRole, Record<string, boolean>> = {
        visitor: { edit: false, delete: false, publish: false },
        team: { edit: true, delete: false, publish: false },
        coordinator: { edit: true, delete: true, publish: true },
        superadmin: { edit: true, delete: true, publish: true },
      };

      roles.forEach((role) => {
        actions.forEach((action) => {
          const result = validatePostPermission(role, action);
          expect(result.allowed).toBe(permissions[role][action]);
        });
      });
    });
  });

  describe("Message formatting", () => {
    it("should include role name in error message", () => {
      const result = validatePostPermission("visitor", "edit");
      expect(result.message).toContain("Visitante");
    });

    it("should include action in error message for transitions", () => {
      const result = validatePostPermission("team", "transition", "review");
      expect(result.message).toContain("Revisão");
    });

    it("should return empty message for allowed actions", () => {
      const result = validatePostPermission("coordinator", "publish");
      expect(result.message).toBe("");
    });
  });
});
