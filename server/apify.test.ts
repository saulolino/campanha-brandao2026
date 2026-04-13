import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ENV before importing apify module
vi.mock("./_core/env", () => ({
  ENV: {
    apifyToken: "test-token",
    instagramToken: "",
    instagramAccountId: "",
    apifyToken: "test-token",
  },
}));

describe("Apify helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validateApifyToken retorna false quando token está vazio", async () => {
    // Mock fetch para retornar 401
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    const { validateApifyToken } = await import("./apify");
    const result = await validateApifyToken("invalid-token");
    expect(result).toBe(false);
  });

  it("validateApifyToken retorna true quando token é válido", async () => {
    // Mock fetch para retornar 200
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "user123", username: "testuser" }),
    });

    const { validateApifyToken } = await import("./apify");
    const result = await validateApifyToken("valid-token");
    expect(result).toBe(true);
  });

  it("scrapeInstagramProfile retorna null quando actor não retorna dados", async () => {
    // Mock fetch para retornar array vazio
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { scrapeInstagramProfile } = await import("./apify");
    const result = await scrapeInstagramProfile("nonexistentuser");
    expect(result).toBeNull();
  });

  it("scrapeInstagramProfile retorna dados do perfil quando actor retorna resultados", async () => {
    const mockProfile = {
      id: "123456",
      username: "testuser",
      fullName: "Test User",
      followersCount: 5000,
      followsCount: 200,
      postsCount: 150,
      biography: "Test bio",
      verified: false,
      isBusinessAccount: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [mockProfile],
    });

    const { scrapeInstagramProfile } = await import("./apify");
    const result = await scrapeInstagramProfile("testuser");
    expect(result).not.toBeNull();
    expect(result?.username).toBe("testuser");
    expect(result?.followersCount).toBe(5000);
  });

  it("scrapeInstagramProfile remove @ do username antes de chamar a API", async () => {
    let capturedInput: unknown;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedInput = JSON.parse((options as RequestInit).body as string);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [],
      });
    });

    const { scrapeInstagramProfile } = await import("./apify");
    await scrapeInstagramProfile("@testuser");

    expect(capturedInput).toMatchObject({ usernames: ["testuser"] });
  });

  it("scrapeFacebookPage normaliza URL sem protocolo", async () => {
    let capturedInput: unknown;
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedInput = JSON.parse((options as RequestInit).body as string);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [],
      });
    });

    const { scrapeFacebookPage } = await import("./apify");
    await scrapeFacebookPage("mypagename");

    expect(capturedInput).toMatchObject({
      startUrls: [{ url: "https://www.facebook.com/mypagename" }],
    });
  });

  it("runActorSync lança erro quando API retorna status de erro", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const { scrapeInstagramProfile } = await import("./apify");
    await expect(scrapeInstagramProfile("testuser")).rejects.toThrow(
      "Apify API error 401"
    );
  });
});
