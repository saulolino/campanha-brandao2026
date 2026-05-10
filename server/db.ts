import { eq, desc, gte, lte, and as drizzleAnd, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, instagramPosts, postStatusHistory, InsertInstagramPost, InsertPostStatusHistory, instagramPublishedPosts, InsertInstagramPublishedPost, savedReports, InsertSavedReport } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from "mysql2/promise";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;
let _pool: mysql.Pool | null = null;
let _lastConnectAttempt = 0;
const RECONNECT_COOLDOWN_MS = 10_000; // Aguardar 10s antes de tentar reconectar

// Lazily create the drizzle instance com pool mysql2 para reconexão automática.
export async function getDb() {
  if (_db) return _db;

  const now = Date.now();
  if (!process.env.DATABASE_URL) return null;
  // Evitar tentativas repetidas em rápida sucessão
  if (now - _lastConnectAttempt < RECONNECT_COOLDOWN_MS) return null;
  _lastConnectAttempt = now;

  try {
    // Usar pool mysql2 com reconexão automática e keep-alive
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 15000,
    });
    _db = drizzle(_pool);
    console.log("[Database] Pool MySQL criado com sucesso.");
  } catch (error) {
    console.warn("[Database] Failed to create pool:", error);
    _pool = null;
    _db = null;
  }
  return _db;
}

// Resetar a conexão em caso de erro grave (chamado pelos helpers)
export function resetDb() {
  if (_pool) {
    _pool.end().catch(() => {});
    _pool = null;
  }
  _db = null;
  _lastConnectAttempt = 0;
  console.warn("[Database] Conexão resetada — próxima query tentará reconectar.");
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

// ─── Instagram Published Posts Helpers ──────────────────────────────────────
// Funções CRUD para a tabela instagram_published_posts
// Usadas pelo instagramService como fonte primária de posts históricos

/**
 * Buscar posts publicados do Instagram ordenados por data (mais recentes primeiro)
 */
export async function getInstagramPublishedPosts(limit: number = 100): Promise<typeof instagramPublishedPosts.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(instagramPublishedPosts)
      .orderBy(desc(instagramPublishedPosts.postedAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get instagram published posts:", error);
    return [];
  }
}

/**
 * Buscar posts publicados por intervalo de datas
 */
export async function getInstagramPublishedPostsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<typeof instagramPublishedPosts.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select()
      .from(instagramPublishedPosts)
      .where(
        drizzleAnd(
          gte(instagramPublishedPosts.postedAt, startDate),
          lte(instagramPublishedPosts.postedAt, endDate)
        )
      )
      .orderBy(desc(instagramPublishedPosts.postedAt));
  } catch (error) {
    console.error("[Database] Failed to get instagram published posts by date range:", error);
    return [];
  }
}

/**
 * Inserir ou atualizar um post publicado (upsert por instagramId)
 */
export async function upsertInstagramPublishedPost(
  post: InsertInstagramPublishedPost
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(instagramPublishedPosts)
      .values(post)
      .onDuplicateKeyUpdate({
        set: {
          caption: post.caption,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saves: post.saves,
          reach: post.reach,
          views: post.views,
          thumbnailUrl: post.thumbnailUrl,
          mediaUrl: post.mediaUrl,
          syncSource: post.syncSource,
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Database] Failed to upsert instagram published post:", error);
    throw error;
  }
}

/**
 * Inserir múltiplos posts em lote (upsert)
 */
export async function bulkUpsertInstagramPublishedPosts(
  posts: InsertInstagramPublishedPost[]
): Promise<{ inserted: number; updated: number }> {
  if (posts.length === 0) return { inserted: 0, updated: 0 };
  const db = await getDb();
  if (!db) return { inserted: 0, updated: 0 };
  let inserted = 0;
  let updated = 0;
  for (const post of posts) {
    try {
      // Verificar se já existe para contar inseridos vs atualizados
      const existing = await db.select({ id: instagramPublishedPosts.id })
        .from(instagramPublishedPosts)
        .where(eq(instagramPublishedPosts.instagramId, post.instagramId))
        .limit(1);
      await upsertInstagramPublishedPost(post);
      if (existing.length > 0) updated++; else inserted++;
    } catch (error) {
      console.error(`[Database] Failed to upsert post ${post.instagramId}:`, error);
    }
  }
  return { inserted, updated };
}

/**
 * Contar total de posts publicados no banco
 */
export async function countInstagramPublishedPosts(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(instagramPublishedPosts);
    return Number(result[0]?.count ?? 0);
  } catch (error) {
    console.error("[Database] Failed to count instagram published posts:", error);
    return 0;
  }
}

// ─── Helpers: saved_reports ───────────────────────────────────────────────────

export async function saveReport(data: InsertSavedReport) {
  const db = await getDb();
  try {
    const [result] = await db.insert(savedReports).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to save report:", error);
    throw error;
  }
}

export async function listSavedReports(limit = 50) {
  const db = await getDb();
  try {
    const rows = await db
      .select({
        id: savedReports.id,
        title: savedReports.title,
        periodFrom: savedReports.periodFrom,
        periodTo: savedReports.periodTo,
        periodLabel: savedReports.periodLabel,
        dataSource: savedReports.dataSource,
        createdBy: savedReports.createdBy,
        createdAt: savedReports.createdAt,
        // Inclui métricas resumidas para exibição na lista
        currentMetrics: savedReports.currentMetrics,
        variations: savedReports.variations,
      })
      .from(savedReports)
      .orderBy(desc(savedReports.createdAt))
      .limit(limit);
    return rows;
  } catch (error) {
    console.error("[Database] Failed to list saved reports:", error);
    return [];
  }
}

export async function getSavedReportById(id: number) {
  const db = await getDb();
  try {
    const rows = await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get saved report:", error);
    return null;
  }
}

export async function deleteSavedReport(id: number) {
  const db = await getDb();
  try {
    await db.delete(savedReports).where(eq(savedReports.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete saved report:", error);
    return false;
  }
}
