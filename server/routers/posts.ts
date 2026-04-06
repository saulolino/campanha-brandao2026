import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { instagramPosts, postStatusHistory } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postsRouter = router({
  // Listar todos os posts com filtro por status
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "design", "caption", "review", "scheduled", "published", "failed"]).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

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
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      
      if (!post.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post[0];
    }),

  // Criar novo post (designer)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      scheduledDate: z.date(),
      mediaUrls: z.string().optional(), // JSON string de URLs
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.insert(instagramPosts).values({
        title: input.title,
        scheduledDate: input.scheduledDate,
        mediaUrls: input.mediaUrls,
        designerId: ctx.user.id,
        status: "design",
      });

      return { id: (result as any).insertId || 0 };
    }),

  // Atualizar media/design (designer)
  updateDesign: protectedProcedure
    .input(z.object({
      id: z.number(),
      mediaUrls: z.string(),
      title: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: any = { mediaUrls: input.mediaUrls };
      if (input.title) updates.title = input.title;

      await db.update(instagramPosts).set(updates).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Enviar para redator (designer → caption)
  sendToCaption: protectedProcedure
    .input(z.object({
      id: z.number(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      // Registrar mudança de status
      await db.insert(postStatusHistory).values({
        postId: input.id,
        previousStatus: post[0].status,
        newStatus: "caption",
        changedBy: ctx.user.id,
        comment: input.comment,
      });

      await db.update(instagramPosts).set({ status: "caption" }).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Adicionar legenda (redator)
  updateCaption: protectedProcedure
    .input(z.object({
      id: z.number(),
      caption: z.string(),
      hashtags: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      await db.update(instagramPosts)
        .set({
          caption: input.caption,
          hashtags: input.hashtags,
          captionWriterId: ctx.user.id,
        })
        .where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Enviar para revisão (redator → review)
  sendToReview: protectedProcedure
    .input(z.object({
      id: z.number(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      await db.insert(postStatusHistory).values({
        postId: input.id,
        previousStatus: post[0].status,
        newStatus: "review",
        changedBy: ctx.user.id,
        comment: input.comment,
      });

      await db.update(instagramPosts).set({ status: "review" }).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Aprovar e agendar (coordenador)
  approveAndSchedule: protectedProcedure
    .input(z.object({
      id: z.number(),
      scheduledDate: z.date().optional(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: any = { status: "scheduled", coordinatorId: ctx.user.id };
      if (input.scheduledDate) updates.scheduledDate = input.scheduledDate;

      await db.insert(postStatusHistory).values({
        postId: input.id,
        previousStatus: post[0].status,
        newStatus: "scheduled",
        changedBy: ctx.user.id,
        comment: input.comment,
      });

      await db.update(instagramPosts).set(updates).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Rejeitar e devolver (coordenador)
  reject: protectedProcedure
    .input(z.object({
      id: z.number(),
      returnTo: z.enum(["design", "caption"]),
      comment: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      await db.insert(postStatusHistory).values({
        postId: input.id,
        previousStatus: post[0].status,
        newStatus: input.returnTo,
        changedBy: ctx.user.id,
        comment: input.comment,
      });

      await db.update(instagramPosts).set({ status: input.returnTo }).where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),

  // Publicar no Instagram (coordenador)
  publish: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      // TODO: Integrar com API do Instagram para publicar
      // Por enquanto, apenas marca como publicado
      await db.insert(postStatusHistory).values({
        postId: input.id,
        previousStatus: post[0].status,
        newStatus: "published",
        changedBy: ctx.user.id,
        comment: "Published to Instagram",
      });

      await db.update(instagramPosts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(instagramPosts.id, input.id));

      return { success: true };
    }),
});
