import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["visitor", "team", "coordinator", "superadmin"]).default("visitor").notNull(),
  emailVerified: timestamp("emailVerified"),
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Posts em preparação com fluxo colaborativo
export const instagramPosts = mysqlTable("instagram_posts", {
  id: int("id").autoincrement().primaryKey(),
  // Identificação
  title: varchar("title", { length: 255 }).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  // Status do fluxo: draft → design → caption → review → scheduled → published
  status: mysqlEnum("status", ["draft", "design", "caption", "review", "scheduled", "published", "failed"]).default("draft").notNull(),
  // Conteúdo
  mediaUrls: text("mediaUrls"), // JSON array de URLs das imagens/vídeos
  caption: text("caption"),
  hashtags: text("hashtags"),
  // Responsáveis
  designerId: int("designerId"),
  captionWriterId: int("captionWriterId"),
  coordinatorId: int("coordinatorId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  // Instagram response
  instagramPostId: varchar("instagramPostId", { length: 255 }),
  instagramError: text("instagramError"),
});

export type InstagramPost = typeof instagramPosts.$inferSelect;
export type InsertInstagramPost = typeof instagramPosts.$inferInsert;

// Histórico de mudanças de status
export const postStatusHistory = mysqlTable("post_status_history", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  previousStatus: varchar("previousStatus", { length: 50 }).notNull(),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  changedBy: int("changedBy").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostStatusHistory = typeof postStatusHistory.$inferSelect;
export type InsertPostStatusHistory = typeof postStatusHistory.$inferInsert;