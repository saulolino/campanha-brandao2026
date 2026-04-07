import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, instagramPosts, postStatusHistory, InsertInstagramPost, InsertPostStatusHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Map new roles to database roles (database only has 'user' and 'admin')
    const roleMap: Record<string, 'user' | 'admin'> = {
      'visitor': 'user',
      'team': 'user',
      'coordinator': 'user',
      'superadmin': 'admin',
      'user': 'user',
      'admin': 'admin',
    };

    let dbRole: 'user' | 'admin' = 'user';
    if (user.role !== undefined && user.role !== null) {
      dbRole = roleMap[user.role] || 'user';
    } else if (user.openId === ENV.ownerOpenId) {
      dbRole = 'admin';
    }

    values.role = dbRole as any;
    updateSet.role = dbRole;

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Post queries
export async function createPost(post: InsertInstagramPost): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create post: database not available");
    return null;
  }

  try {
    const result = await db.insert(instagramPosts).values(post);
    return (result as any).insertId as number || null;
  } catch (error) {
    console.error("[Database] Failed to create post:", error);
    throw error;
  }
}

export async function getPostById(postId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get post: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(instagramPosts).where(eq(instagramPosts.id, postId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get post:", error);
    throw error;
  }
}

export async function getAllPosts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get posts: database not available");
    return [];
  }

  try {
    const result = await db.select().from(instagramPosts).orderBy(desc(instagramPosts.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get posts:", error);
    throw error;
  }
}

export async function updatePost(postId: number, updates: Partial<InsertInstagramPost>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update post: database not available");
    return;
  }

  try {
    await db.update(instagramPosts).set(updates).where(eq(instagramPosts.id, postId));
  } catch (error) {
    console.error("[Database] Failed to update post:", error);
    throw error;
  }
}

export async function deletePost(postId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete post: database not available");
    return;
  }

  try {
    await db.delete(instagramPosts).where(eq(instagramPosts.id, postId));
  } catch (error) {
    console.error("[Database] Failed to delete post:", error);
    throw error;
  }
}

export async function addStatusHistory(history: InsertPostStatusHistory): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add status history: database not available");
    return;
  }

  try {
    await db.insert(postStatusHistory).values(history);
  } catch (error) {
    console.error("[Database] Failed to add status history:", error);
    throw error;
  }
}

export async function getPostHistory(postId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get post history: database not available");
    return [];
  }

  try {
    const result = await db.select().from(postStatusHistory).where(eq(postStatusHistory.postId, postId)).orderBy(desc(postStatusHistory.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get post history:", error);
    throw error;
  }
}

export async function updateUserRole(userId: number, newRole: "visitor" | "team" | "coordinator" | "superadmin"): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user role: database not available");
    return;
  }

  try {
    const roleMap: Record<string, 'user' | 'admin'> = {
      'visitor': 'user',
      'team': 'user',
      'coordinator': 'user',
      'superadmin': 'admin',
    };

    const dbRole = roleMap[newRole] || 'user';

    await db.update(users).set({ role: dbRole as any }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    throw error;
  }
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}
