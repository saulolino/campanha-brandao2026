import { ForbiddenError } from "@shared/_core/errors";
import { COOKIE_NAME } from "@shared/const";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  userId: number;
  email: string;
};

class AuthService {
  private readonly secret = new TextEncoder().encode(ENV.jwtSecret || "default-secret-key");

  async createSessionToken(userId: number, email: string): Promise<string> {
    const token = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("365d")
      .sign(this.secret);
    return token;
  }

  async verifySession(token?: string): Promise<SessionPayload | null> {
    if (!token) return null;

    try {
      const verified = await jwtVerify(token, this.secret);
      return verified.payload as SessionPayload;
    } catch (error) {
      return null;
    }
  }

  private parseCookies(cookieHeader?: string): Map<string, string> {
    const cookies = new Map<string, string>();
    if (!cookieHeader) return cookies;

    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies.set(name, decodeURIComponent(value));
      }
    });

    return cookies;
  }

  async authenticateRequest(req: Request): Promise<User | null> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      return null;
    }

    const user = await db.getUserById(session.userId);

    if (!user) {
      return null;
    }

    // Update last signed in
    try {
      await db.updateUserLastSignedIn(user.id);
    } catch (error) {
      console.error("[Auth] Failed to update last signed in:", error);
    }

    return user;
  }
}

export const sdk = new AuthService();
