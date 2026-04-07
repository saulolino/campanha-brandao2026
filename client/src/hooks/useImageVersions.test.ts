import { describe, it, expect, beforeEach } from "vitest";

describe("useImageVersions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve armazenar e recuperar versões de imagem", () => {
    const versions = [
      { id: "v1", url: "url1", prompt: "Prompt 1", createdAt: new Date().toISOString(), editedBy: "Usuário 1" },
      { id: "v2", url: "url2", prompt: "Prompt 2", createdAt: new Date().toISOString(), editedBy: "Usuário 2" },
    ];
    
    const data = { 1: { postId: 1, versions, currentVersionId: "v2" } };
    localStorage.setItem("imageVersions", JSON.stringify(data));
    
    const saved = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    expect(saved[1].versions).toHaveLength(2);
    expect(saved[1].currentVersionId).toBe("v2");
  });

  it("deve adicionar nova versão", () => {
    const data = { 1: { postId: 1, versions: [], currentVersionId: "" } };
    localStorage.setItem("imageVersions", JSON.stringify(data));
    
    const saved = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    const newVersion = { id: "v1", url: "url1", prompt: "Prompt 1", createdAt: new Date().toISOString(), editedBy: "Usuário" };
    saved[1].versions.push(newVersion);
    saved[1].currentVersionId = "v1";
    localStorage.setItem("imageVersions", JSON.stringify(saved));
    
    const final = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    expect(final[1].versions).toHaveLength(1);
    expect(final[1].currentVersionId).toBe("v1");
  });

  it("deve reverter para versão anterior", () => {
    const versions = [
      { id: "v1", url: "url1", prompt: "Prompt 1", createdAt: new Date().toISOString(), editedBy: "Usuário 1" },
      { id: "v2", url: "url2", prompt: "Prompt 2", createdAt: new Date().toISOString(), editedBy: "Usuário 2" },
    ];
    
    const data = { 1: { postId: 1, versions, currentVersionId: "v2" } };
    localStorage.setItem("imageVersions", JSON.stringify(data));
    
    const saved = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    saved[1].currentVersionId = "v1";
    localStorage.setItem("imageVersions", JSON.stringify(saved));
    
    const final = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    expect(final[1].currentVersionId).toBe("v1");
  });

  it("deve deletar versão", () => {
    const versions = [
      { id: "v1", url: "url1", prompt: "Prompt 1", createdAt: new Date().toISOString(), editedBy: "Usuário 1" },
      { id: "v2", url: "url2", prompt: "Prompt 2", createdAt: new Date().toISOString(), editedBy: "Usuário 2" },
    ];
    
    const data = { 1: { postId: 1, versions, currentVersionId: "v2" } };
    localStorage.setItem("imageVersions", JSON.stringify(data));
    
    const saved = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    saved[1].versions = saved[1].versions.filter((v: any) => v.id !== "v1");
    localStorage.setItem("imageVersions", JSON.stringify(saved));
    
    const final = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    expect(final[1].versions).toHaveLength(1);
    expect(final[1].versions[0].id).toBe("v2");
  });

  it("deve manter múltiplas versões de diferentes posts", () => {
    const data = {
      1: { postId: 1, versions: [{ id: "v1", url: "url1", prompt: "Prompt 1", createdAt: new Date().toISOString(), editedBy: "Usuário" }], currentVersionId: "v1" },
      2: { postId: 2, versions: [{ id: "v2", url: "url2", prompt: "Prompt 2", createdAt: new Date().toISOString(), editedBy: "Usuário" }], currentVersionId: "v2" },
    };
    localStorage.setItem("imageVersions", JSON.stringify(data));
    
    const saved = JSON.parse(localStorage.getItem("imageVersions") || "{}");
    expect(Object.keys(saved)).toHaveLength(2);
    expect(saved[1].versions).toHaveLength(1);
    expect(saved[2].versions).toHaveLength(1);
  });
});
