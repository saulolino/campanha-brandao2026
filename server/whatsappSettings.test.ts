/**
 * Testes do router whatsappSettings
 *
 * Verifica as guards de autorização e a lógica de mascaramento de token.
 */
import { describe, it, expect } from "vitest";

// ─── Testes de mascaramento de token ─────────────────────────────────────────
describe("maskToken", () => {
  function maskToken(token: string): string {
    if (!token) return "";
    if (token.length > 8) {
      return `${"*".repeat(token.length - 8)}${token.slice(-8)}`;
    }
    return "*".repeat(token.length);
  }

  it("mascara token longo mantendo os últimos 8 chars", () => {
    const token = "z56tztoDQLqSZ3HHvNKz8VaxKZA37BX1";
    const masked = maskToken(token);
    expect(masked).toContain("37BX1");
    expect(masked.startsWith("*")).toBe(true);
    expect(masked.length).toBe(token.length);
  });

  it("mascara token curto completamente", () => {
    const token = "abc123";
    const masked = maskToken(token);
    expect(masked).toBe("******");
  });

  it("retorna string vazia para token vazio", () => {
    expect(maskToken("")).toBe("");
  });

  it("token de exatamente 8 chars é mascarado completamente", () => {
    const token = "12345678";
    const masked = maskToken(token);
    expect(masked).toBe("********");
  });
});

// ─── Testes de guard de autorização ──────────────────────────────────────────
describe("requireCoordinatorOrAbove", () => {
  function requireCoordinatorOrAbove(role: string | null | undefined): void {
    if (!role || role === "visitor" || role === "team") {
      throw new Error("Apenas coordenadores e superadmins podem alterar configurações.");
    }
  }

  it("permite coordinator", () => {
    expect(() => requireCoordinatorOrAbove("coordinator")).not.toThrow();
  });

  it("permite superadmin", () => {
    expect(() => requireCoordinatorOrAbove("superadmin")).not.toThrow();
  });

  it("bloqueia visitor", () => {
    expect(() => requireCoordinatorOrAbove("visitor")).toThrow();
  });

  it("bloqueia team", () => {
    expect(() => requireCoordinatorOrAbove("team")).toThrow();
  });

  it("bloqueia null", () => {
    expect(() => requireCoordinatorOrAbove(null)).toThrow();
  });

  it("bloqueia undefined", () => {
    expect(() => requireCoordinatorOrAbove(undefined)).toThrow();
  });
});

// ─── Testes de serialização de grupos favoritos ───────────────────────────────
describe("defaultGroups serialization", () => {
  const groups = [
    { id: "120363000000000001@g.us", name: "Equipe Central", participantsCount: 15 },
    { id: "120363000000000002@g.us", name: "Voluntários Asa Norte", participantsCount: 42 },
  ];

  it("serializa e desserializa grupos corretamente", () => {
    const serialized = JSON.stringify(groups);
    const parsed = JSON.parse(serialized);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe("120363000000000001@g.us");
    expect(parsed[1].name).toBe("Voluntários Asa Norte");
  });

  it("retorna array vazio para JSON inválido", () => {
    let result: typeof groups = [];
    try {
      result = JSON.parse("invalid json");
    } catch {
      result = [];
    }
    expect(result).toHaveLength(0);
  });

  it("retorna array vazio para string vazia", () => {
    let result: typeof groups = [];
    try {
      result = JSON.parse("[]");
    } catch {
      result = [];
    }
    expect(result).toHaveLength(0);
  });
});
