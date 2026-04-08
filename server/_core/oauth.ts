import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Personas de login local (mesmas do frontend)
const LOCAL_PERSONAS = [
  { email: "visitante@teste.com", senha: "senha123", nome: "Visitante Teste", role: "visitor" as const },
  { email: "equipe@teste.com", senha: "senha123", nome: "Equipe Teste", role: "team" as const },
  { email: "coordenador@teste.com", senha: "senha123", nome: "Coordenador Teste", role: "coordinator" as const },
  { email: "superadmin@teste.com", senha: "senha123", nome: "Superadmin Teste", role: "superadmin" as const },
];

export function registerOAuthRoutes(app: Express) {
  // Login local — cria sessão JWT real no cookie
  app.post("/api/auth/local-login", async (req: Request, res: Response) => {
    const { email, senha } = req.body as { email?: string; senha?: string };
    if (!email || !senha) {
      res.status(400).json({ error: "email e senha são obrigatórios" });
      return;
    }
    const persona = LOCAL_PERSONAS.find(p => p.email === email && p.senha === senha);
    if (!persona) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }
    try {
      const openId = `local:${persona.email}`;
      // Garantir que o usuário existe no banco
      await db.upsertUser({
        openId,
        name: persona.nome,
        email: persona.email,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });
      // Garantir que o role está correto no banco
      const { getDb } = await import("../db");
      const drizzle = await getDb();
      if (drizzle) {
        const { users } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await drizzle.update(users).set({ role: persona.role }).where(eq(users.email, persona.email));
      }
      // Criar cookie de sessão JWT real
      const sessionToken = await sdk.createSessionToken(openId, {
        name: persona.nome,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, role: persona.role });
    } catch (error) {
      console.error("[LocalLogin] Failed", error);
      res.status(500).json({ error: "Erro interno no login" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
