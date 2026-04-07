import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

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

      // Gerar token de verificação de email
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");

      // Criar usuário
      const userRole = (role || "visitor") as 'visitor' | 'team' | 'coordinator' | 'superadmin';
      await db.createUser({
        name,
        email,
        whatsapp,
        passwordHash,
        role: userRole,
        emailVerificationToken,
      });

      // Buscar o usuário criado
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // TODO: Enviar email de verificação com link
      // Por enquanto, retornar o token para testes
      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        verificationToken: emailVerificationToken, // TODO: Remover em produção
      });
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

  // Rota para verificar email
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Token is required" });
        return;
      }

      // Buscar usuário com o token
      const user = await db.getUserByEmailVerificationToken(token);
      if (!user) {
        res.status(400).json({ error: "Invalid or expired token" });
        return;
      }

      // Marcar email como verificado
      await db.verifyUserEmail(user.id);

      res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      console.error("[Auth] Email verification failed", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  // Rota para solicitar reset de senha
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user) {
        // Não revelar se o email existe ou não
        res.json({ success: true, message: "If the email exists, a reset link has been sent" });
        return;
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      // Salvar token no banco
      await db.setPasswordResetToken(user.id, resetToken, resetExpires);

      // TODO: Enviar email com link de reset
      res.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
        resetToken, // TODO: Remover em produção
      });
    } catch (error) {
      console.error("[Auth] Forgot password failed", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Rota para resetar senha
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
      }

      // Buscar usuário com o token
      const user = await db.getUserByPasswordResetToken(token);
      if (!user) {
        res.status(400).json({ error: "Invalid or expired reset token" });
        return;
      }

      // Hash da nova senha
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Atualizar senha e limpar token
      await db.resetUserPassword(user.id, passwordHash);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("[Auth] Reset password failed", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // Rota para atualizar perfil
  app.post("/api/auth/update-profile", async (req: Request, res: Response) => {
    try {
      const { name, whatsapp } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!name || !whatsapp) {
        res.status(400).json({ error: "Name and whatsapp are required" });
        return;
      }

      await db.updateUserProfile(userId, { name, whatsapp });

      const user = await db.getUserById(userId);
      res.json({ success: true, user });
    } catch (error) {
      console.error("[Auth] Update profile failed", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Rota para alterar senha
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: "Current and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters" });
        return;
      }

      const user = await db.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Current password is incorrect" });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await db.updateUserPassword(userId, passwordHash);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("[Auth] Change password failed", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
}
