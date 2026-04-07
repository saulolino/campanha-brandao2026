import { z } from "zod";
import { notifyOwner } from "./notification";
import { generateImage } from "./imageGeneration";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10, "prompt must be at least 10 characters"),
        originalImages: z.array(
          z.object({
            url: z.string().url(),
            mimeType: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: input.prompt,
          originalImages: input.originalImages,
        });
        return {
          success: true,
          url: result.url,
        };
      } catch (error) {
        console.error("[systemRouter] Image generation error:", error);
        throw error;
      }
    }),
});
