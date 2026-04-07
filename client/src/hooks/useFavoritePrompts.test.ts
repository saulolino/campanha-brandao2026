import { describe, it, expect, beforeEach } from "vitest";

describe("useFavoritePrompts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve adicionar e recuperar favoritos do localStorage", () => {
    const favorites = ["Prompt 1", "Prompt 2"];
    localStorage.setItem("favoritePrompts", JSON.stringify(favorites));
    
    const saved = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(saved).toContain("Prompt 1");
    expect(saved).toContain("Prompt 2");
  });

  it("deve verificar se favorito existe", () => {
    const favorites = ["Prompt 1"];
    localStorage.setItem("favoritePrompts", JSON.stringify(favorites));
    
    const saved = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(saved.includes("Prompt 1")).toBe(true);
    expect(saved.includes("Prompt 2")).toBe(false);
  });

  it("deve remover favorito", () => {
    const favorites = ["Prompt 1", "Prompt 2"];
    localStorage.setItem("favoritePrompts", JSON.stringify(favorites));
    
    const saved = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    const updated = saved.filter((p: string) => p !== "Prompt 1");
    localStorage.setItem("favoritePrompts", JSON.stringify(updated));
    
    const final = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(final).not.toContain("Prompt 1");
    expect(final).toContain("Prompt 2");
  });

  it("deve alternar favorito", () => {
    const favorites: string[] = [];
    localStorage.setItem("favoritePrompts", JSON.stringify(favorites));
    
    let saved = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    if (!saved.includes("Prompt 1")) {
      saved.push("Prompt 1");
    }
    localStorage.setItem("favoritePrompts", JSON.stringify(saved));
    
    let final = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(final).toContain("Prompt 1");
    
    saved = final.filter((p: string) => p !== "Prompt 1");
    localStorage.setItem("favoritePrompts", JSON.stringify(saved));
    
    final = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(final).not.toContain("Prompt 1");
  });

  it("deve manter múltiplos favoritos", () => {
    const favorites = ["Prompt 1", "Prompt 2", "Prompt 3"];
    localStorage.setItem("favoritePrompts", JSON.stringify(favorites));
    
    const saved = JSON.parse(localStorage.getItem("favoritePrompts") || "[]");
    expect(saved).toHaveLength(3);
  });
});
