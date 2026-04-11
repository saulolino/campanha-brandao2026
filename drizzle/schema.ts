import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint, double, boolean } from "drizzle-orm/mysql-core";

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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["visitor", "team", "coordinator", "superadmin"]).default("visitor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  /** true = aguardando revisão do admin; false = já revisado (mesmo que role continue visitor) */
  pendingReview: tinyint("pendingReview").default(1).notNull(),
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
  // Tipo de conteúdo
  type: mysqlEnum("type", ["reels", "carrossel", "video", "story", "imagem"]).default("imagem").notNull(),
  // Objetivo
  objective: varchar("objective", { length: 255 }),
  // Hora do post (HH:mm)
  scheduledTime: varchar("scheduledTime", { length: 5 }).default("12:00"),
  // Conteúdo
  description: text("description"),
  mediaUrls: text("mediaUrls"), // JSON array de URLs das imagens/vídeos
  caption: text("caption"),
  hashtags: text("hashtags"),
  slideCount: int("slideCount").default(1), // Número de slides (para carrossel)
  // Métricas projetadas
  expectedReach: int("expectedReach").default(0),
  expectedLikes: int("expectedLikes").default(0),
  expectedComments: int("expectedComments").default(0),
  // Orçamento
  budget: decimal("budget", { precision: 10, scale: 2 }),
  // Observações
  notes: text("notes"),
  // Responsáveis
  designerId: int("designerId"),
  captionWriterId: int("captionWriterId"),
  coordinatorId: int("coordinatorId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  // Agendamento automático de publicação
  scheduledPublishAt: timestamp("scheduledPublishAt"),
  publishedBy: varchar("publishedBy", { length: 255 }), // nome do usuário que publicou
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

// Métricas do perfil do Instagram sincronizadas em tempo real
export const instagramMetrics = mysqlTable("instagram_metrics", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  followers: int("followers").default(0).notNull(),
  following: int("following").default(0).notNull(),
  postsCount: int("postsCount").default(0).notNull(),
  biography: text("biography"),
  profilePictureUrl: text("profilePictureUrl"),
  engagementRate: int("engagementRate").default(0).notNull(),
  averageLikes: int("averageLikes").default(0).notNull(),
  averageComments: int("averageComments").default(0).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstagramMetrics = typeof instagramMetrics.$inferSelect;
export type InsertInstagramMetrics = typeof instagramMetrics.$inferInsert;

// Configurações da campanha
export const campaignSettings = mysqlTable("campaign_settings", {
  id: int("id").autoincrement().primaryKey(),
  // Credenciais do Instagram
  instagramAccessToken: text("instagramAccessToken"),
  instagramBusinessAccountId: varchar("instagramBusinessAccountId", { length: 255 }),
  instagramUsername: varchar("instagramUsername", { length: 255 }),
  instagramTokenExpiresAt: timestamp("instagramTokenExpiresAt"), // data de expiração do token de longa duração
  // Horários de sincronização (em formato HH:mm, ex: "08:00", "14:00", "20:00")
  syncSchedule: varchar("syncSchedule", { length: 255 }).default("08:00,14:00,20:00").notNull(),
  // Preferências de relatório
  reportFormat: mysqlEnum("reportFormat", ["pdf", "csv", "both"]).default("pdf").notNull(),
  reportFrequency: mysqlEnum("reportFrequency", ["daily", "weekly", "monthly"]).default("weekly").notNull(),
  reportRecipients: text("reportRecipients"), // JSON array de emails
  // Controle
  isActive: tinyint("isActive").default(1).notNull(),
  lastUpdatedBy: int("lastUpdatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignSettings = typeof campaignSettings.$inferSelect;
export type InsertCampaignSettings = typeof campaignSettings.$inferInsert;

// Log de acesso — registra cada login bem-sucedido
export const accessLogs = mysqlTable("access_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  userName: text("userName"),
  userRole: mysqlEnum("userRole", ["visitor", "team", "coordinator", "superadmin"]).default("visitor"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = typeof accessLogs.$inferInsert;

// Tokens de recuperação de senha
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Agenda de Rua — eventos presenciais do candidato
export const streetEvents = mysqlTable("street_events", {
  id: int("id").autoincrement().primaryKey(),
  // Identificação
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Tipo de evento
  type: mysqlEnum("type", ["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]).default("outro").notNull(),
  // Status
  status: mysqlEnum("status", ["planejado", "confirmado", "realizado", "cancelado"]).default("planejado").notNull(),
  // Data e hora
  eventDate: timestamp("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 5 }).default("09:00"),
  endTime: varchar("endTime", { length: 5 }),
  // Local
  location: varchar("location", { length: 500 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 255 }),
  city: varchar("city", { length: 255 }).default("Brasília"),
  // Público esperado
  expectedAttendees: int("expectedAttendees").default(0),
  actualAttendees: int("actualAttendees"),
  // Materiais gráficos e mídia (JSON array de URLs)
  mediaUrls: text("mediaUrls"),
  // Observações e notas
  notes: text("notes"),
  // Coordenadas geográficas (geocodificadas a partir do endereço)
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  // Responsável
  responsibleId: int("responsibleId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StreetEvent = typeof streetEvents.$inferSelect;
export type InsertStreetEvent = typeof streetEvents.$inferInsert;

// ─── Notificações ─────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo da notificação
  type: mysqlEnum("type", [
    "novo_cadastro",
    "novo_post",
    "evento_criado",
    "evento_confirmado",
    "evento_realizado",
    "instagram_sync",
    "token_expirando",
    "sistema",
    "outro",
  ]).default("outro").notNull(),
  // Conteúdo
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // Dados extras (JSON)
  metadata: text("metadata"),
  // Status
  isRead: tinyint("isRead").default(0).notNull(),
  // Destinatário (null = todos os coordenadores/superadmin)
  targetUserId: int("targetUserId"),
  // Quem gerou (null = sistema)
  triggeredByUserId: int("triggeredByUserId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Planejamento Semanal ─────────────────────────────────────────────────────
export const weeklyPlanningSessions = mysqlTable("weekly_planning_sessions", {
  id: int("id").autoincrement().primaryKey(),
  // Semana de referência (início da semana, segunda-feira)
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  // Status da sessão
  status: mysqlEnum("status", ["em_andamento", "concluida", "cancelada"]).default("em_andamento").notNull(),
  // Respostas do usuário (JSON com as perguntas e respostas)
  answers: text("answers"), // JSON
  // Fatos pesquisados pela IA (JSON)
  researchedFacts: text("researchedFacts"), // JSON
  // Posts gerados (JSON com os dados dos posts criados)
  generatedPosts: text("generatedPosts"), // JSON com IDs dos posts criados
  // Eventos gerados (JSON com os dados dos eventos criados)
  generatedEvents: text("generatedEvents"), // JSON com IDs dos eventos criados
  // Quem iniciou a sessão
  createdByUserId: int("createdByUserId"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type WeeklyPlanningSession = typeof weeklyPlanningSessions.$inferSelect;
export type InsertWeeklyPlanningSession = typeof weeklyPlanningSessions.$inferInsert;

// ─── Mensagens do chat de planejamento ────────────────────────────────────────
export const planningMessages = mysqlTable("planning_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  // Remetente: "user" ou "assistant"
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  // Metadados extras (ex: tipo de mensagem: pergunta, resposta, resumo, confirmação)
  messageType: mysqlEnum("messageType", ["pergunta", "resposta", "resumo", "confirmacao", "erro", "info"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PlanningMessage = typeof planningMessages.$inferSelect;
export type InsertPlanningMessage = typeof planningMessages.$inferInsert;
