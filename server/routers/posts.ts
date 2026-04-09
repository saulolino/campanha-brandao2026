import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { instagramPosts } from "../../drizzle/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { uploadMedia, serializeMediaUrls, deserializeMediaUrls } from "../media";
import { invokeLLM, type Message, type MessageContent } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";

export const postsRouter = router({
  // Listar todos os posts com filtro por status
  list: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "design", "caption", "review", "scheduled", "published", "failed"]).optional(),
      limit: z.number().default(500),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query: any = db.select().from(instagramPosts);

      if (input.status) {
        query = query.where(eq(instagramPosts.status, input.status));
      }

      const posts = await query
        .orderBy(desc(instagramPosts.scheduledDate))
        .limit(input.limit)
        .offset(input.offset);

      return posts;
    }),

  // Obter um post específico
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);

      if (!post.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post[0];
    }),

  // Buscar posts por semana (ISO week)
  getByWeek: publicProcedure
    .input(z.object({
      year: z.number(),
      week: z.number(), // 1-53
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { posts: [], weekStart: new Date(), weekEnd: new Date() };

      // Calcular início e fim da semana ISO
      // Semana ISO começa na segunda-feira
      const jan4 = new Date(input.year, 0, 4);
      const dayOfWeek = jan4.getDay() || 7; // 1=seg ... 7=dom
      const weekStart = new Date(jan4);
      weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (input.week - 1) * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const posts = await db.select().from(instagramPosts)
        .where(and(
          gte(instagramPosts.scheduledDate, weekStart),
          lte(instagramPosts.scheduledDate, weekEnd)
        ))
        .orderBy(instagramPosts.scheduledDate);

      return { posts, weekStart, weekEnd };
    }),

  // Buscar posts por mês
  getByMonth: publicProcedure
    .input(z.object({
      year: z.number(),
      month: z.number(), // 1-12
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { posts: [], monthStart: new Date(), monthEnd: new Date() };

      const monthStart = new Date(input.year, input.month - 1, 1, 0, 0, 0, 0);
      const monthEnd = new Date(input.year, input.month, 0, 23, 59, 59, 999);

      const posts = await db.select().from(instagramPosts)
        .where(and(
          gte(instagramPosts.scheduledDate, monthStart),
          lte(instagramPosts.scheduledDate, monthEnd)
        ))
        .orderBy(instagramPosts.scheduledDate);

      return { posts, monthStart, monthEnd };
    }),

  // Upload de mídia para S3
  uploadMedia: publicProcedure
    .input(z.object({
      fileBase64: z.string(), // base64 encoded file
      mimeType: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const result = await uploadMedia(buffer, input.mimeType, input.fileName);
      return result;
    }),

  // Gerar legenda com IA
  generateCaption: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.string(),
      objective: z.string().optional(),
      mediaUrl: z.string().optional(), // URL da imagem para análise multimodal
    }))
    .mutation(async ({ input }) => {
      const typeLabels: Record<string, string> = {
        reels: "Reels", carrossel: "Carrossel", video: "Vídeo", story: "Story", imagem: "Imagem",
      };
      const objectiveLabels: Record<string, string> = {
        awareness: "Conscientização", engajamento: "Engajamento", humanização: "Humanização",
        explicação: "Explicação", mobilização: "Mobilização", captação: "Captação de seguidores",
      };

      const systemPrompt = `Você é um especialista em marketing político digital para Instagram.
Você cria legendas impactantes para a campanha do candidato Eduardo Brandão, em Brasília Cidade Parque.
A meta é atingir 20.000 seguidores. O estilo é próximo, autêntico e mobilizador.
Sempre use linguagem brasileira informal mas respeitosa. Inclua call-to-action.`;

      const contentParts: any[] = [
        {
          type: "text",
          text: `Crie uma legenda para Instagram com as seguintes informações:
- Título do post: ${input.title}
- Tipo de conteúdo: ${typeLabels[input.type] || input.type}
- Objetivo: ${objectiveLabels[input.objective || ""] || input.objective || "Engajamento"}
${input.description ? `- Descrição: ${input.description}` : ""}

Retorne SOMENTE um JSON com os campos:
{
  "caption": "texto da legenda (máx 2200 caracteres)",
  "hashtags": "lista de hashtags separadas por espaço (máx 30 hashtags)"
}`,
        },
      ];

      if (input.mediaUrl) {
        contentParts.push({
          type: "image_url",
          image_url: { url: input.mediaUrl, detail: "low" },
        });
      }

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: contentParts as any },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "caption_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                caption: { type: "string" },
                hashtags: { type: "string" },
              },
              required: ["caption", "hashtags"],
              additionalProperties: false,
            },
          },
        },
      });

       const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "IA não retornou resposta" });
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      try {
        const parsed = JSON.parse(content);
        return { caption: parsed.caption || "", hashtags: parsed.hashtags || "" };
      } catch {
        return { caption: content, hashtags: "" };
      }
    }),

  // Gerar imagem com IA
  generateMediaImage: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.string(),
      objective: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const typeLabels: Record<string, string> = {
        reels: "thumbnail de Reels", carrossel: "slide de Carrossel", video: "thumbnail de Vídeo",
        story: "Story", imagem: "post de Imagem",
      };

      const prompt = `Crie uma imagem profissional para ${typeLabels[input.type] || "post"} do Instagram de campanha política.
Candidato: Eduardo Brandão. Cidade: Brasília Cidade Parque, Brasil.
Tema: ${input.title}.
${input.description ? `Contexto: ${input.description}.` : ""}
Estilo: fotorrealista, cores vibrantes verde e branco (cores da campanha), moderno e impactante.
Não inclua texto na imagem.`;

      const result = await generateImage({ prompt });
      return { url: result.url };
    }),

  // Criar novo post
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      scheduledDate: z.date(),
      scheduledTime: z.string().optional().default("12:00"),
      type: z.enum(["reels", "carrossel", "video", "story", "imagem"]).optional().default("imagem"),
      status: z.enum(["draft", "design", "caption", "review", "scheduled", "published", "failed"]).optional().default("draft"),
      objective: z.string().optional(),
      description: z.string().optional(),
      expectedReach: z.number().optional().default(0),
      expectedLikes: z.number().optional().default(0),
      expectedComments: z.number().optional().default(0),
      budget: z.string().optional(),
      notes: z.string().optional(),
      mediaUrls: z.string().optional(),
      caption: z.string().optional(),
      hashtags: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.insert(instagramPosts).values({
        title: input.title,
        scheduledDate: input.scheduledDate,
        scheduledTime: input.scheduledTime,
        type: input.type,
        status: input.status,
        objective: input.objective,
        description: input.description,
        expectedReach: input.expectedReach,
        expectedLikes: input.expectedLikes,
        expectedComments: input.expectedComments,
        budget: input.budget,
        notes: input.notes,
        mediaUrls: input.mediaUrls,
        caption: input.caption,
        hashtags: input.hashtags,
      });

      return { id: (result as any).insertId || 0 };
    }),

  // Atualizar post
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      scheduledDate: z.date().optional(),
      scheduledTime: z.string().optional(),
      type: z.enum(["reels", "carrossel", "video", "story", "imagem"]).optional(),
      status: z.enum(["draft", "design", "caption", "review", "scheduled", "published", "failed"]).optional(),
      objective: z.string().optional(),
      description: z.string().optional(),
      expectedReach: z.number().optional(),
      expectedLikes: z.number().optional(),
      expectedComments: z.number().optional(),
      budget: z.string().optional(),
      notes: z.string().optional(),
      mediaUrls: z.string().optional(),
      caption: z.string().optional(),
      hashtags: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { id, ...updates } = input;

      // Remover campos undefined
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanUpdates).length === 0) {
        return { success: true };
      }

      await db.update(instagramPosts).set(cleanUpdates).where(eq(instagramPosts.id, id));

      return { success: true };
    }),

  // Deletar post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(instagramPosts).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),
});
