import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint, double, boolean, json } from "drizzle-orm/mysql-core";

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
  // ─── Metodologia: Categoria de Conteúdo ───────────────────────────────────
  // Autoridade | Bastidor | Opinião | Vida Pessoal | Proposta
  contentCategory: mysqlEnum("contentCategory", ["autoridade", "bastidor", "opiniao", "vida_pessoal", "proposta"]),
  // ─── Metodologia: Distribuição / Tráfego ────────────────────────────────────
  trafficType: mysqlEnum("trafficType", ["organico", "teste_pago", "escala"]).default("organico"),
  isABTest: tinyint("isABTest").default(0), // 1 = criativo em teste A/B
  // ─── Metodologia: Objetivo de Conversão ─────────────────────────────────────
  conversionGoal: mysqlEnum("conversionGoal", ["engajamento", "crescimento", "conversao"]),
  // ─── Metodologia: CTA ────────────────────────────────────────────────────────
  ctaType: mysqlEnum("ctaType", ["grupo_whatsapp", "whatsapp_direto", "formulario", "link_bio", "nenhum"]).default("nenhum"),
  ctaLink: varchar("ctaLink", { length: 500 }),
  // ─── Metodologia: Métricas reais (pós-publicação) ────────────────────────────
  realReach: int("realReach"),
  realLikes: int("realLikes"),
  realComments: int("realComments"),
  realShares: int("realShares"),
  realSaves: int("realSaves"),
  retentionRate: decimal("retentionRate", { precision: 5, scale: 2 }), // % retenção vídeo
  // ─── Metodologia: Análise IA ─────────────────────────────────────────────────
  aiAnalysis: mysqlEnum("aiAnalysis", ["top", "fraco", "neutro"]), // classificação automática
  aiSuggestion: mysqlEnum("aiSuggestion", ["replicar", "ajustar", "descartar"]), // sugestão da IA
  aiSuggestionNote: text("aiSuggestionNote"), // explicação da sugestão
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

// Histórico diário de seguidores do Instagram (snapshot por dia)
export const instagramFollowersHistory = mysqlTable("instagram_followers_history", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  followers: int("followers").notNull(),
  following: int("following").default(0).notNull(),
  postsCount: int("postsCount").default(0).notNull(),
  totalLikes: int("totalLikes").default(0).notNull(),
  totalComments: int("totalComments").default(0).notNull(),
  totalShares: int("totalShares").default(0).notNull(),
  totalSaves: int("totalSaves").default(0).notNull(),
  snapshotDate: varchar("snapshotDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type InstagramFollowersHistory = typeof instagramFollowersHistory.$inferSelect;
export type InsertInstagramFollowersHistory = typeof instagramFollowersHistory.$inferInsert;

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
  // WhatsApp / Whapi.Cloud
  whapiToken: text("whapiToken"),                                      // Bearer token da Whapi.Cloud
  whapiChannelName: varchar("whapiChannelName", { length: 255 }),       // Nome do canal/número conectado
  whapiChannelPhone: varchar("whapiChannelPhone", { length: 30 }),      // Número de telefone do canal
  whapiChannelStatus: varchar("whapiChannelStatus", { length: 64 }),    // Status: connected / disconnected / etc.
  whapiDefaultGroups: text("whapiDefaultGroups"),                       // JSON: [{ id, name, participantsCount }]
  // Facebook da campanha (Eduardo Brandão)
  facebookPageUrl: text("facebookPageUrl"),                            // URL da página (ex: facebook.com/brandaopv)
  facebookPageName: varchar("facebookPageName", { length: 255 }),       // Nome da página
  facebookFollowers: int("facebookFollowers"),                          // Seguidores
  facebookLikes: int("facebookLikes"),                                  // Curtidas na página
  facebookBio: text("facebookBio"),                                     // Descrição da página
  facebookProfilePic: text("facebookProfilePic"),                       // URL da foto de perfil
  facebookLastSync: timestamp("facebookLastSync"),                      // Última sincronização
  // ─── Metodologia: Narrativa da Campanha ─────────────────────────────────────
  narrativeCentralPhrase: varchar("narrativeCentralPhrase", { length: 120 }), // Frase central (máx 120 chars)
  narrativePillars: text("narrativePillars"),   // JSON: ["pilar1", "pilar2", "pilar3"]
  narrativeStrategicThemes: text("narrativeStrategicThemes"), // JSON: ["tema1", "tema2", ...]
  // Dados do Candidato Principal
  candidateName: varchar("candidateName", { length: 255 }),              // Nome completo
  candidateNickname: varchar("candidateNickname", { length: 100 }),      // Nome de urna / apelido
  candidateParty: varchar("candidateParty", { length: 100 }),            // Partido (ex: Partido Verde)
  candidateNumber: varchar("candidateNumber", { length: 20 }),           // Número eleitoral
  candidateRole: varchar("candidateRole", { length: 255 }),              // Cargo disputado
  candidateBio: text("candidateBio"),                                    // Biografia / apresentação
  candidateEmail: varchar("candidateEmail", { length: 320 }),            // E-mail de contato público
  candidatePhone: varchar("candidatePhone", { length: 30 }),             // Telefone / WhatsApp público
  candidateProfilePic: text("candidateProfilePic"),                      // URL da foto de perfil
  candidateInstagram: varchar("candidateInstagram", { length: 255 }),    // @username do Instagram
  candidateFacebook: varchar("candidateFacebook", { length: 255 }),      // URL ou username do Facebook
  candidateYoutube: varchar("candidateYoutube", { length: 255 }),        // URL do canal YouTube
  candidateTiktok: varchar("candidateTiktok", { length: 255 }),          // @username do TikTok
  candidateWebsite: varchar("candidateWebsite", { length: 500 }),        // Site oficial
  candidateElectionDate: varchar("candidateElectionDate", { length: 10 }), // Data da eleição (YYYY-MM-DD)
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

// ─── Propostas de Pauta ─────────────────────────────────────────────────────────────────────────────────────
// Qualquer membro da equipe pode propor conteúdo (post) ou evento de rua.
// O coordenador aprova ou rejeita. Ao aprovar, a proposta vira um item real.
export const contentProposals = mysqlTable("content_proposals", {
  id: int("id").autoincrement().primaryKey(),

  // Tipo de proposta
  proposalType: mysqlEnum("proposalType", ["conteudo", "evento_rua"]).notNull(),

  // Status do fluxo: pendente → aprovado → rejeitado
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),

  // ── Campos comuns ──────────────────────────────────────────────────────────────────────────────
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  suggestedDate: timestamp("suggestedDate").notNull(),

  // ── Campos específicos de CONTEÚDOM (post Instagram) ────────────────────────────────────
  contentType: mysqlEnum("contentType", ["reels", "carrossel", "video", "story", "imagem"]),
  objective: varchar("objective", { length: 255 }),
  caption: text("caption"),
  hashtags: text("hashtags"),
  referenceUrls: text("referenceUrls"),

  // ── Campos específicos de EVENTO DE RUA ───────────────────────────────────────────────
  eventType: mysqlEnum("eventType", ["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]),
  location: varchar("location", { length: 500 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  city: varchar("city", { length: 255 }).default("Brasília"),
  eventTime: varchar("eventTime", { length: 5 }).default("09:00"),
  endTime: varchar("endTime", { length: 5 }),
  expectedAttendees: int("expectedAttendees").default(0),

  // ── Rastreamento ──────────────────────────────────────────────────────────────────────────────
  proposedById: int("proposedById").notNull(),
  proposedByName: varchar("proposedByName", { length: 255 }),
  reviewedById: int("reviewedById"),
  reviewedByName: varchar("reviewedByName", { length: 255 }),
  reviewNotes: text("reviewNotes"),
  convertedItemId: int("convertedItemId"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});
export type ContentProposal = typeof contentProposals.$inferSelect;
export type InsertContentProposal = typeof contentProposals.$inferInsert;

// ─── WhatsApp Dispatches ──────────────────────────────────────────────────────
// Histórico de disparos de agenda via WhatsApp (Whapi.Cloud)
export const whatsappDispatches = mysqlTable("whatsapp_dispatches", {
  id: int("id").autoincrement().primaryKey(),
  // Grupo de destino
  groupId: varchar("groupId", { length: 255 }).notNull(),
  groupName: varchar("groupName", { length: 255 }).notNull(),
  // Tipo de disparo: diário ou semanal
  dispatchType: mysqlEnum("dispatchType", ["diario", "semanal"]).notNull(),
  // Mensagem enviada
  message: text("message").notNull(),
  // IDs dos itens incluídos, serializado como JSON
  includedPostIds: text("includedPostIds"),
  includedEventIds: text("includedEventIds"),
  // Quem disparou
  sentById: int("sentById").notNull(),
  sentByName: varchar("sentByName", { length: 255 }),
  // Status do envio
  status: mysqlEnum("status", ["enviado", "erro"]).default("enviado").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WhatsappDispatch = typeof whatsappDispatches.$inferSelect;
export type InsertWhatsappDispatch = typeof whatsappDispatches.$inferInsert;

// ─── Competitors (Benchmarking de Candidatos) ────────────────────────────────
// Perfis de candidatos concorrentes para análise comparativa
export const competitors = mysqlTable("competitors", {
  id: int("id").autoincrement().primaryKey(),
  // Identificação do candidato
  name: varchar("name", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 255 }), // segundo nome / apelido / nome de urna
  party: varchar("party", { length: 100 }),
  role: varchar("role", { length: 255 }), // cargo disputado
  notes: text("notes"), // observações livres
  // Instagram
  instagramUsername: varchar("instagramUsername", { length: 100 }),
  instagramId: varchar("instagramId", { length: 64 }), // ID numérico da conta
  instagramFollowers: int("instagramFollowers"),
  instagramFollowing: int("instagramFollowing"),
  instagramPosts: int("instagramPosts"),
  instagramBio: text("instagramBio"),
  instagramProfilePic: text("instagramProfilePic"),
  instagramLastSync: timestamp("instagramLastSync"),
  // Facebook
  facebookPageId: varchar("facebookPageId", { length: 100 }), // ID ou username da página
  facebookPageName: varchar("facebookPageName", { length: 255 }),
  facebookFollowers: int("facebookFollowers"),
  facebookLikes: int("facebookLikes"),
  facebookBio: text("facebookBio"),
  facebookProfilePic: text("facebookProfilePic"),
  facebookLastSync: timestamp("facebookLastSync"),
  // Controle
  isActive: tinyint("isActive").default(1).notNull(),
  createdById: int("createdById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

// Histórico de métricas dos concorrentes (snapshot diário)
export const competitorSnapshots = mysqlTable("competitor_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  competitorId: int("competitorId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "facebook"]).notNull(),
  followers: int("followers"),
  following: int("following"),
  posts: int("posts"),
  likes: int("likes"),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
});
export type CompetitorSnapshot = typeof competitorSnapshots.$inferSelect;
export type InsertCompetitorSnapshot = typeof competitorSnapshots.$inferInsert;

// ─── Electoral Alert Log (Alertas Eleitorais Automáticos) ────────────────────────
// Registro de alertas disparados para marcos eleitorais críticos
export const electoralAlertLog = mysqlTable("electoral_alert_log", {
  id: int("id").autoincrement().primaryKey(),
  // ID da data eleitoral (referencia ao JSON electoral_calendar_2026.json)
  electoralDateId: varchar("electoralDateId", { length: 64 }).notNull(),
  // Título e data do marco eleitoral (desnormalizado para histórico)
  electoralTitle: varchar("electoralTitle", { length: 512 }).notNull(),
  electoralDate: varchar("electoralDate", { length: 10 }).notNull(), // YYYY-MM-DD
  category: varchar("category", { length: 64 }).notNull(),
  // Quantos dias antes o alerta foi disparado (7, 3 ou 1)
  daysBeforeEvent: int("daysBeforeEvent").notNull(),
  // Status do envio da notificação
  notificationSent: tinyint("notificationSent").default(0).notNull(),
  notificationError: text("notificationError"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});
export type ElectoralAlertLog = typeof electoralAlertLog.$inferSelect;
export type InsertElectoralAlertLog = typeof electoralAlertLog.$inferInsert;

// ─── Instagram Published Posts (Posts Históricos do Perfil) ─────────────────
// Armazena posts reais publicados no perfil @eduardobrandaopv
// Fonte: Apify scraper / Graph API — substitui instagram_real_data.json
// Diferente de instagram_posts (fluxo de produção interna), esta tabela
// guarda os dados de performance dos posts já publicados no Instagram.
export const instagramPublishedPosts = mysqlTable("instagram_published_posts", {
  id: int("id").autoincrement().primaryKey(),
  // ID original do Instagram (shortcode ou ID numérico do Apify) — chave única
  instagramId: varchar("instagramId", { length: 128 }).notNull().unique(),
  caption: text("caption"),
  mediaType: varchar("mediaType", { length: 32 }).notNull().default("IMAGE"), // IMAGE, VIDEO, CAROUSEL_ALBUM
  mediaProductType: varchar("mediaProductType", { length: 32 }).notNull().default("FEED"), // FEED, REELS
  permalink: varchar("permalink", { length: 512 }),
  thumbnailUrl: text("thumbnailUrl"),
  mediaUrl: text("mediaUrl"),
  // Métricas de engajamento (atualizadas a cada sync)
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  saves: int("saves").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  views: int("views").default(0).notNull(),
  // Timestamp original do post no Instagram (UTC)
  postedAt: timestamp("postedAt").notNull(),
  // Controle de sincronização
  syncSource: varchar("syncSource", { length: 32 }).default("json").notNull(), // json, apify, graph_api
  lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type InstagramPublishedPost = typeof instagramPublishedPosts.$inferSelect;
export type InsertInstagramPublishedPost = typeof instagramPublishedPosts.$inferInsert;

// ─── Relatórios Salvos ────────────────────────────────────────────────────────
// Histórico de relatórios de performance gerados pela IA
export const savedReports = mysqlTable("saved_reports", {
  id: int("id").autoincrement().primaryKey(),
  // Título do relatório (gerado automaticamente ou personalizado)
  title: varchar("title", { length: 256 }).notNull(),
  // Período analisado
  periodFrom: timestamp("periodFrom").notNull(),
  periodTo: timestamp("periodTo").notNull(),
  periodLabel: varchar("periodLabel", { length: 128 }).notNull(),
  // Métricas do período atual (JSON serializado)
  currentMetrics: json("currentMetrics").notNull(),
  // Métricas do período anterior (JSON serializado)
  previousMetrics: json("previousMetrics").notNull(),
  // Variações percentuais (JSON serializado)
  variations: json("variations").notNull(),
  // Dados de seguidores (JSON serializado)
  followersData: json("followersData"),
  // Top posts (JSON serializado)
  topPosts: json("topPosts"),
  // Distribuição por tipo (JSON serializado)
  byType: json("byType"),
  // Análise completa da IA (texto markdown)
  aiAnalysis: text("aiAnalysis"),
  // Fonte dos dados usada na geração
  dataSource: varchar("dataSource", { length: 32 }).default("mysql").notNull(),
  // Usuário que salvou
  createdBy: varchar("createdBy", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = typeof savedReports.$inferInsert;
