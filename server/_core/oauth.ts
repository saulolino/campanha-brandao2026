import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as bcrypt from "bcryptjs";

export function registerAuthRoutes(app: Express) {
  // Rota de registro
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, whatsapp, password, role } = req.body;

      if (!name || !email || !whatsapp || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Verificar se o usuário já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário
      const userRole = (role || "visitor") as 'visitor' | 'team' | 'coordinator' | 'superadmin';
      await db.createUser({
        name,
        email,
        whatsapp,
        passwordHash,
        role: userRole,
      });

      // Buscar o usuário criado
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Criar token de sessão
      const sessionToken = await sdk.createSessionToken(user.id, user.email);

      // Setar cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[Auth] Register failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Rota de login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Criar token de sessão
      const sessionToken = await sdk.createSessionToken(user.id, user.email);

      // Setar cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });
}
