import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { instagramPosts } from "../../drizzle/schema";
import { eq, desc, gte, lte, and, isNotNull, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { uploadMedia, serializeMediaUrls, deserializeMediaUrls } from "../media";
import { invokeLLM, type Message, type MessageContent } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { notifyOwner } from "../_core/notification";

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
Você cria legendas impactantes para a pré campanha do candidato Eduardo Brandão, em Brasília Cidade Parque.
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

      const prompt = `Crie uma imagem profissional para ${typeLabels[input.type] || "post"} do Instagram de pré campanha política.
Candidato: Eduardo Brandão. Cidade: Brasília Cidade Parque, Brasil.
Tema: ${input.title}.
${input.description ? `Contexto: ${input.description}.` : ""}
Estilo: fotorrealista, cores vibrantes verde e branco (cores da pré campanha), moderno e impactante.
Não inclua texto na imagem.`;

      const result = await generateImage({ prompt });
      return { url: result.url };
    }),

  // Gerar carrossel com IA (múltiplas imagens consistentes)
  generateCarousel: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      objective: z.string().optional(),
      slideCount: z.number().min(2).max(10),
    }))
    .mutation(async ({ input }) => {
      // Prompt base com identidade visual compartilhada entre todos os slides
      const styleGuide = `Estilo visual consistente para todos os slides:
- Paleta de cores: verde vibrante (#4ade80) e branco sobre fundo escuro azul-marinho
- Estilo: fotorrealista com elementos gráficos modernos, clean e profissional
- Pré campanha política de Eduardo Brandão, Brasília Cidade Parque, Brasil
- Sem texto na imagem
- Proporção quadrada (1:1) ideal para Instagram`;

      const objectiveLabels: Record<string, string> = {
        awareness: "conscientização", engajamento: "engajamento", humanização: "humanização",
        explicação: "explicação", mobilização: "mobilização", captação: "captação de seguidores",
      };

      const objectiveLabel = objectiveLabels[input.objective || ""] || input.objective || "engajamento";

      // Gerar prompts individuais para cada slide com a IA
      const planResponse = await invokeLLM({
        messages: [
          {
            role: "system" as const,
            content: `Você é um diretor de arte especializado em carrosséis do Instagram para pré campanhas políticas.
Crie ${input.slideCount} prompts de imagem para um carrossél coeso e narrativo.
Cada slide deve ter uma cena diferente mas manter a mesma identidade visual.
O carrossél deve contar uma história progressiva: introdução → desenvolvimento → conclusão/call-to-action.`,
          },
          {
            role: "user" as const,
            content: `Crie ${input.slideCount} prompts de imagem para um carrossél do Instagram com:
- Título: ${input.title}
- Objetivo: ${objectiveLabel}
${input.description ? `- Contexto: ${input.description}` : ""}

Guia de estilo para TODOS os slides:
${styleGuide}

Retorne SOMENTE um JSON com o campo "slides" sendo um array de ${input.slideCount} objetos, cada um com:
- "slideNumber": número do slide (1 a ${input.slideCount})
- "sceneDescription": descrição da cena em português
- "imagePrompt": prompt em inglês para geração de imagem (detalhado, 50-100 palavras)

Garanta que os slides formem uma narrativa coesa e que o último slide tenha um elemento de call-to-action visual.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "carousel_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      slideNumber: { type: "integer" },
                      sceneDescription: { type: "string" },
                      imagePrompt: { type: "string" },
                    },
                    required: ["slideNumber", "sceneDescription", "imagePrompt"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["slides"],
              additionalProperties: false,
            },
          },
        },
      });

      const planContent = planResponse.choices?.[0]?.message?.content;
      if (!planContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "IA não retornou plano de slides" });

      const planText = typeof planContent === "string" ? planContent : JSON.stringify(planContent);
      let slidePlan: { slides: Array<{ slideNumber: number; sceneDescription: string; imagePrompt: string }> };

      try {
        slidePlan = JSON.parse(planText);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao processar plano de slides" });
      }

      // Gerar todas as imagens em paralelo
      const imagePromises = slidePlan.slides.map(async (slide) => {
        const fullPrompt = `${slide.imagePrompt}\n\nStyle: ${styleGuide}`;
        const result = await generateImage({ prompt: fullPrompt });
        return {
          slideNumber: slide.slideNumber,
          sceneDescription: slide.sceneDescription,
          url: result.url ?? "",
        };
      });

      const generatedSlides = await Promise.all(imagePromises);

      // Ordenar por número do slide
      generatedSlides.sort((a, b) => a.slideNumber - b.slideNumber);

      return {
        slides: generatedSlides,
        urls: generatedSlides.map(s => s.url),
      };
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
      slideCount: z.number().optional(),
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
        slideCount: input.slideCount ?? 1,
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
      slideCount: z.number().optional(),
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

  // Publicar post no Instagram (apenas coordinator e superadmin)
  publish: publicProcedure
    .input(z.object({
      id: z.number(),
      userRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
      userName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Verificar permissão de role
      if (input.userRole !== "coordinator" && input.userRole !== "superadmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas Coordenadores e Superadmins podem publicar posts no Instagram.",
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Buscar o post
      const [post] = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado." });

      // Validar dados mínimos
      if (!post.caption) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O post precisa ter uma legenda antes de ser publicado." });
      }

      // Montar legenda completa (caption + hashtags)
      const fullCaption = post.hashtags
        ? `${post.caption}\n\n${post.hashtags}`
        : post.caption;

      const INSTAGRAM_TOKEN = process.env.INSTAGRAM_GRAPH_API_TOKEN;
      const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

      if (!INSTAGRAM_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Credenciais do Instagram não configuradas.",
        });
      }

      // Parsear URLs de mídia
      let mediaUrls: string[] = [];
      if (post.mediaUrls) {
        try { mediaUrls = JSON.parse(post.mediaUrls); } catch { mediaUrls = []; }
      }

      let instagramPostId: string | null = null;

      try {
        const postType = post.type || "imagem";

        if (postType === "carrossel" && mediaUrls.length >= 2) {
          // === CARROSSEL ===
          // 1. Criar cada item do carrossel
          const childIds: string[] = [];
          for (const url of mediaUrls) {
            const childRes = await fetch(
              `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  image_url: url,
                  is_carousel_item: true,
                  access_token: INSTAGRAM_TOKEN,
                }),
              }
            );
            const childData = await childRes.json() as any;
            if (!childData.id) throw new Error(`Erro ao criar item do carrossel: ${JSON.stringify(childData)}`);
            childIds.push(childData.id);
          }

          // 2. Criar container do carrossel
          const containerRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                media_type: "CAROUSEL",
                children: childIds.join(","),
                caption: fullCaption,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const containerData = await containerRes.json() as any;
          if (!containerData.id) throw new Error(`Erro ao criar container do carrossel: ${JSON.stringify(containerData)}`);

          // 3. Publicar
          const publishRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const publishData = await publishRes.json() as any;
          if (!publishData.id) throw new Error(`Erro ao publicar carrossel: ${JSON.stringify(publishData)}`);
          instagramPostId = publishData.id;

        } else if ((postType === "reels" || postType === "video") && mediaUrls.length > 0) {
          // === REELS / VÍDEO ===
          const videoUrl = mediaUrls[0];
          const containerRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                media_type: "REELS",
                video_url: videoUrl,
                caption: fullCaption,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const containerData = await containerRes.json() as any;
          if (!containerData.id) throw new Error(`Erro ao criar container de reels: ${JSON.stringify(containerData)}`);

          // Aguardar processamento do vídeo (polling)
          let attempts = 0;
          let status = "IN_PROGRESS";
          while (status === "IN_PROGRESS" && attempts < 20) {
            await new Promise(r => setTimeout(r, 3000));
            const statusRes = await fetch(
              `https://graph.facebook.com/v21.0/${containerData.id}?fields=status_code&access_token=${INSTAGRAM_TOKEN}`
            );
            const statusData = await statusRes.json() as any;
            status = statusData.status_code || "FINISHED";
            attempts++;
          }

          const publishRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const publishData = await publishRes.json() as any;
          if (!publishData.id) throw new Error(`Erro ao publicar reels: ${JSON.stringify(publishData)}`);
          instagramPostId = publishData.id;

        } else {
          // === IMAGEM Única / STORY ===
          const imageUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;
          if (!imageUrl) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "O post precisa ter pelo menos uma imagem para ser publicado." });
          }

          const containerRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image_url: imageUrl,
                caption: fullCaption,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const containerData = await containerRes.json() as any;
          if (!containerData.id) throw new Error(`Erro ao criar container de imagem: ${JSON.stringify(containerData)}`);

          const publishRes = await fetch(
            `https://graph.facebook.com/v21.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerData.id,
                access_token: INSTAGRAM_TOKEN,
              }),
            }
          );
          const publishData = await publishRes.json() as any;
          if (!publishData.id) throw new Error(`Erro ao publicar imagem: ${JSON.stringify(publishData)}`);
          instagramPostId = publishData.id;
        }

        // Atualizar post no banco: status published + instagramPostId + publishedAt + publishedBy
        const publisherName = input.userName || "Coordenador";
        await db.update(instagramPosts).set({
          status: "published",
          instagramPostId: instagramPostId,
          instagramError: null,
          publishedAt: new Date(),
          publishedBy: publisherName,
          scheduledPublishAt: null, // limpar agendamento após publicar
        }).where(eq(instagramPosts.id, input.id));

        // Notificar Superadmin
        const permalink = `https://www.instagram.com/p/${instagramPostId}/`;
        await notifyOwner({
          title: `✅ Post publicado no Instagram`,
          content: `**${post.title}** foi publicado por **${publisherName}** (${input.userRole}).\n\n[Ver post no Instagram](${permalink})`,
        }).catch(() => {}); // não bloquear em caso de falha na notificação

        return {
          success: true,
          instagramPostId,
          permalink,
          publishedAt: new Date().toISOString(),
        };

      } catch (err: any) {
        // Salvar erro no banco para auditoria
        await db.update(instagramPosts).set({
          status: "failed",
          instagramError: err.message || "Erro desconhecido",
        }).where(eq(instagramPosts.id, input.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err.message || "Erro ao publicar no Instagram.",
        });
      }
    }),

  // Agendar publicação automática
  schedulePublish: publicProcedure
    .input(z.object({
      id: z.number(),
      scheduledPublishAt: z.date().nullable(),
      userRole: z.enum(["visitor", "team", "coordinator", "superadmin"]),
    }))
    .mutation(async ({ input }) => {
      if (input.userRole !== "coordinator" && input.userRole !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas Coordenadores e Superadmins podem agendar publicações." });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [post] = await db.select().from(instagramPosts).where(eq(instagramPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado." });

      if (input.scheduledPublishAt && !post.caption) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "O post precisa ter uma legenda antes de ser agendado." });
      }

      await db.update(instagramPosts).set({
        scheduledPublishAt: input.scheduledPublishAt,
        status: input.scheduledPublishAt ? "scheduled" : post.status === "scheduled" ? "review" : post.status,
      }).where(eq(instagramPosts.id, input.id));

      return { success: true, scheduledPublishAt: input.scheduledPublishAt };
    }),
});
