import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUser(data: {
  name: string;
  email: string;
  whatsapp: string;
  passwordHash: string;
  role: 'visitor' | 'team' | 'coordinator' | 'superadmin';
  emailVerificationToken?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(users).values({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      passwordHash: data.passwordHash,
      role: data.role,
      emailVerificationToken: data.emailVerificationToken,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return undefined;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    return undefined;
  }
}

export async function getUserByEmailVerificationToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by email verification token:", error);
    return undefined;
  }
}

export async function getUserByPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
    if (result.length === 0) return undefined;

    const user = result[0];
    // Verificar se o token ainda é válido
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return undefined; // Token expirado
    }

    return user;
  } catch (error) {
    console.error("[Database] Failed to get user by password reset token:", error);
    return undefined;
  }
}

export async function verifyUserEmail(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({
      emailVerified: new Date(),
      emailVerificationToken: null,
    }).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to verify user email:", error);
    throw error;
  }
}

export async function setPasswordResetToken(id: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    }).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to set password reset token:", error);
    throw error;
  }
}

export async function resetUserPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    }).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to reset user password:", error);
    throw error;
  }
}

export async function updateUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to update last signed in:", error);
    throw error;
  }
}

export async function updateUserProfile(id: number, data: {
  name?: string;
  whatsapp?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.whatsapp) updateData.whatsapp = data.whatsapp;

    await db.update(users).set(updateData).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    throw error;
  }
}

export async function updateUserPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  } catch (error) {
    console.error("[Database] Failed to update user password:", error);
    throw error;
  }
}
