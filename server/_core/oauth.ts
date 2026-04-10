import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import crypto from "crypto";

async function logAccess({
  userId, userEmail, userName, userRole, req, loginMethod
}: {
  userId: number;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string;
  req: Request;
  loginMethod?: string;
}) {
  try {
    const { getDb } = await import("../db");
    const { accessLogs } = await import("../../drizzle/schema");
    const drizzle = await getDb();
    if (!drizzle) return;
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    await drizzle.insert(accessLogs).values({
      userId,
      userEmail: userEmail || null,
      userName: userName || null,
      userRole: (userRole as any) || "visitor",
      ipAddress: ip.substring(0, 64),
      userAgent: userAgent.substring(0, 500),
      loginMethod: loginMethod || "local",
    });
  } catch (e) {
    // Log silencioso — não deve quebrar o login
    console.warn("[AccessLog] Failed to log access:", e);
  }
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(`pré campanha2026:${password}`).digest("hex");
}

// Personas de login local padrão (fallback quando não há passwordHash no banco)
const LOCAL_PERSONAS = [
  { email: "visitante@teste.com", senha: "senha123", nome: "Visitante Teste", role: "visitor" as const },
  { email: "equipe@teste.com", senha: "senha123", nome: "Equipe Teste", role: "team" as const },
  { email: "coordenador@teste.com", senha: "senha123", nome: "Coordenador Teste", role: "coordinator" as const },
  { email: "superadmin@teste.com", senha: "senha123", nome: "Superadmin Teste", role: "superadmin" as const },
];

export function registerOAuthRoutes(app: Express) {
  // Login local — verifica senha no banco (passwordHash) ou nas personas padrão
  app.post("/api/auth/local-login", async (req: Request, res: Response) => {
    const { email, senha } = req.body as { email?: string; senha?: string };
    if (!email || !senha) {
      res.status(400).json({ error: "email e senha são obrigatórios" });
      return;
    }

    try {
      const { getDb } = await import("../db");
      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const drizzle = await getDb();

      let userRecord: typeof users.$inferSelect | null = null;
      let authenticatedRole: "visitor" | "team" | "coordinator" | "superadmin" = "visitor";

      // 1. Tentar autenticar via banco de dados (usuários criados pelo CRUD)
      if (drizzle) {
        const dbUsers = await drizzle.select().from(users).where(eq(users.email, email)).limit(1);
        if (dbUsers.length > 0) {
          const dbUser = dbUsers[0];
          if (dbUser.passwordHash) {
            // Usuário tem senha no banco — verificar hash
            const inputHash = hashPassword(senha);
            if (inputHash !== dbUser.passwordHash) {
              res.status(401).json({ error: "Email ou senha inválidos" });
              return;
            }
            userRecord = dbUser;
            authenticatedRole = dbUser.role || "visitor";
          }
        }
      }

      // 2. Fallback: verificar nas personas padrão (usuários de teste)
      if (!userRecord) {
        const persona = LOCAL_PERSONAS.find(p => p.email === email && p.senha === senha);
        if (!persona) {
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }

        const openId = `local:${persona.email}`;
        // Garantir que o usuário existe no banco com o role correto
        await db.upsertUser({
          openId,
          name: persona.nome,
          email: persona.email,
          loginMethod: "local",
          lastSignedIn: new Date(),
        });
        if (drizzle) {
          await drizzle.update(users).set({ role: persona.role }).where(eq(users.email, persona.email));
        }

        const sessionToken = await sdk.createSessionToken(openId, {
          name: persona.nome,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        // Registrar log de acesso (persona)
        if (drizzle) {
          const personaUser = await drizzle.select({ id: users.id }).from(users).where(eq(users.email, persona.email)).limit(1);
          if (personaUser.length > 0) {
            await logAccess({ userId: personaUser[0].id, userEmail: persona.email, userName: persona.nome, userRole: persona.role, req, loginMethod: "local" });
          }
        }
        res.json({ success: true, role: persona.role, name: persona.nome, email: persona.email });
        return;
      }

      // Usuário autenticado via banco — atualizar lastSignedIn e criar sessão
      if (drizzle) {
        await drizzle.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userRecord.id));
      }

      const sessionToken = await sdk.createSessionToken(userRecord.openId, {
        name: userRecord.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      // Registrar log de acesso (banco)
      await logAccess({ userId: userRecord.id, userEmail: userRecord.email, userName: userRecord.name, userRole: authenticatedRole, req, loginMethod: "local" });
      res.json({ success: true, role: authenticatedRole, name: userRecord.name || "", email: userRecord.email || "" });

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
