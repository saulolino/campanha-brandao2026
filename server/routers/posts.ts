import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { instagramPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postsRouter = router({
  // Listar todos os posts com filtro por status
  list: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "design", "caption", "review", "scheduled", "published", "failed"]).optional(),
      limit: z.number().default(20),
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
