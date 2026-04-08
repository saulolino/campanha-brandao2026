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
    // Map roles to database enum values: 'visitor' | 'team' | 'coordinator' | 'superadmin'
    type DbRole = 'visitor' | 'team' | 'coordinator' | 'superadmin';
    const roleMap: Record<string, DbRole> = {
      'visitor': 'visitor',
      'team': 'team',
      'coordinator': 'coordinator',
      'superadmin': 'superadmin',
      'user': 'visitor',
      'admin': 'superadmin',
    };

    let dbRole: DbRole = 'visitor';
    if (user.role !== undefined && user.role !== null) {
      dbRole = roleMap[user.role] || 'visitor';
    } else if (user.openId === ENV.ownerOpenId) {
      dbRole = 'superadmin';
    }

    const now = new Date();

    // Use SELECT → INSERT/UPDATE to avoid relying on UNIQUE constraint
    const existing = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);

    if (existing.length > 0) {
      // UPDATE existing user
      const updateSet: Record<string, unknown> = {
        lastSignedIn: user.lastSignedIn ?? now,
      };
      if (user.name !== undefined) updateSet.name = user.name ?? null;
      if (user.email !== undefined) updateSet.email = user.email ?? null;
      if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod ?? null;
      // Only update role if explicitly provided
      if (user.role !== undefined && user.role !== null) {
        updateSet.role = dbRole;
      }
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      // INSERT new user
      const values: InsertUser = {
        openId: user.openId,
        role: dbRole as any,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      if (user.name !== undefined) values.name = user.name ?? null;
      if (user.email !== undefined) values.email = user.email ?? null;
      if (user.loginMethod !== undefined) values.loginMethod = user.loginMethod ?? null;
      await db.insert(users).values(values);
    }
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
    // newRole is already a valid DB enum value
    await db.update(users).set({ role: newRole as any }).where(eq(users.id, userId));
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
