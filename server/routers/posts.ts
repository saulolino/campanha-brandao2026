import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { instagramPosts, postStatusHistory } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { uploadMedia, serializeMediaUrls, deserializeMediaUrls } from "../media";
import { notifyPostStatusChange, notifyPostPublished, notifyPublishError } from "../notifications";
import { publishToInstagram } from "../instagram";

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

      // Notificar mudança de status
      await notifyPostStatusChange(
        input.id,
        post[0].title,
        post[0].status,
        "caption",
        ctx.user.id,
        input.comment
      );

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

      // Notificar mudança de status
      await notifyPostStatusChange(
        input.id,
        post[0].title,
        post[0].status,
        "review",
        ctx.user.id,
        input.comment
      );

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

      // Notificar mudança de status
      await notifyPostStatusChange(
        input.id,
        post[0].title,
        post[0].status,
        "scheduled",
        ctx.user.id,
        input.comment
      );

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

  // Upload de mídia (designer)
  uploadMedia: protectedProcedure
    .input(z.object({
      id: z.number(),
      file: z.instanceof(Buffer),
      mimeType: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      // Upload do arquivo
      const media = await uploadMedia(input.file, input.mimeType, input.fileName);

      // Deserializar URLs existentes
      const existingUrls = deserializeMediaUrls(post[0].mediaUrls);
      existingUrls.push(media.url);

      // Atualizar post com nova mídia
      await db.update(instagramPosts)
        .set({ mediaUrls: serializeMediaUrls(existingUrls) })
        .where(eq(instagramPosts.id, input.id));

      return { success: true, media };
    }),

  // Remover mídia (designer)
  removeMedia: protectedProcedure
    .input(z.object({
      id: z.number(),
      mediaUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const post = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post.length) throw new TRPCError({ code: "NOT_FOUND" });

      // Deserializar URLs e remover a especificada
      const urls = deserializeMediaUrls(post[0].mediaUrls);
      const filtered = urls.filter(url => url !== input.mediaUrl);

      // Atualizar post
      await db.update(instagramPosts)
        .set({ mediaUrls: serializeMediaUrls(filtered) })
        .where(eq(instagramPosts.id, input.id));

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

      try {
        // Deserializar URLs de mídia
        const mediaUrls = deserializeMediaUrls(post[0].mediaUrls);
        
        // Publicar no Instagram
        const result = await publishToInstagram(
          mediaUrls,
          post[0].caption || "",
          post[0].hashtags || undefined
        );

        if (!result.success) {
          // Registrar erro
          await db.insert(postStatusHistory).values({
            postId: input.id,
            previousStatus: post[0].status,
            newStatus: "failed",
            changedBy: ctx.user.id,
            comment: result.error,
          });

          await db.update(instagramPosts)
            .set({ status: "failed", instagramError: result.error })
            .where(eq(instagramPosts.id, input.id));

          // Notificar erro
          await notifyPublishError(input.id, post[0].title, result.error || "Erro desconhecido");

          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        }

        // Registrar mudança de status
        await db.insert(postStatusHistory).values({
          postId: input.id,
          previousStatus: post[0].status,
          newStatus: "published",
          changedBy: ctx.user.id,
          comment: "Published to Instagram",
        });

        // Atualizar post com ID do Instagram
        await db.update(instagramPosts)
          .set({ 
            status: "published", 
            publishedAt: new Date(),
            instagramPostId: result.postId
          })
          .where(eq(instagramPosts.id, input.id));

        // Notificar publicação bem-sucedida
        await notifyPostPublished(input.id, post[0].title, result.postId);

        return { success: true, postId: result.postId };
      } catch (error) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: error instanceof Error ? error.message : "Erro ao publicar no Instagram"
        });
      }
    }),
});
