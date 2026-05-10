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

      let response;
      try {
        response = await invokeLLM({
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
      } catch (err: any) {
        const msg = err?.message ?? "Erro desconhecido";
        const isRateLimit = msg.toLowerCase().includes("limite") || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("exceeded");
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: isRateLimit
            ? "Limite de requisições da IA atingido. Aguarde alguns segundos e tente novamente."
            : `Erro ao gerar legenda com IA: ${msg}`,
        });
      }

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
      let planResponse;
      try {
        planResponse = await invokeLLM({
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
      } catch (err: any) {
        const msg = err?.message ?? "Erro desconhecido";
        const isRateLimit = msg.toLowerCase().includes("limite") || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("exceeded");
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: isRateLimit
            ? "Limite de requisições da IA atingido. Aguarde alguns segundos e tente novamente."
            : `Erro ao gerar slides com IA: ${msg}`,
        });
      }

      const planContent = planResponse!.choices?.[0]?.message?.content;
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
      // Metodologia
      contentCategory: z.enum(["autoridade", "bastidor", "opiniao", "vida_pessoal", "proposta"]).optional(),
      trafficType: z.enum(["organico", "teste_pago", "escala"]).optional().default("organico"),
      isABTest: z.number().optional().default(0),
      conversionGoal: z.enum(["engajamento", "crescimento", "conversao"]).optional(),
      ctaType: z.enum(["grupo_whatsapp", "whatsapp_direto", "formulario", "link_bio", "nenhum"]).optional().default("nenhum"),
      ctaLink: z.string().optional(),
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
        contentCategory: input.contentCategory,
        trafficType: input.trafficType,
        isABTest: input.isABTest,
        conversionGoal: input.conversionGoal,
        ctaType: input.ctaType,
        ctaLink: input.ctaLink,
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
      // Metodologia
      contentCategory: z.enum(["autoridade", "bastidor", "opiniao", "vida_pessoal", "proposta"]).nullable().optional(),
      trafficType: z.enum(["organico", "teste_pago", "escala"]).optional(),
      isABTest: z.number().optional(),
      conversionGoal: z.enum(["engajamento", "crescimento", "conversao"]).nullable().optional(),
      ctaType: z.enum(["grupo_whatsapp", "whatsapp_direto", "formulario", "link_bio", "nenhum"]).optional(),
      ctaLink: z.string().nullable().optional(),
      // Métricas reais pós-publicação
      realReach: z.number().optional(),
      realLikes: z.number().optional(),
      realComments: z.number().optional(),
      realShares: z.number().optional(),
      realSaves: z.number().optional(),
      realViews: z.number().optional(),
      retentionRate: z.string().optional(),
      // Análise IA
      aiAnalysis: z.enum(["top", "fraco", "neutro"]).nullable().optional(),
      aiSuggestion: z.enum(["replicar", "ajustar", "descartar"]).nullable().optional(),
      aiSuggestionNote: z.string().nullable().optional(),
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

  // ─── Análise de Performance com IA ───────────────────────────────────────────
  // Analisa posts publicados, classifica top/fraco e gera sugestões
  analyzePerformance: publicProcedure
    .input(z.object({
      period: z.enum(["week", "month"]).default("week"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Buscar posts publicados no período
      const now = new Date();
      const since = new Date();
      if (input.period === "week") since.setDate(now.getDate() - 7);
      else since.setMonth(now.getMonth() - 1);

      const posts = await db.select().from(instagramPosts)
        .where(and(
          eq(instagramPosts.status, "published"),
          gte(instagramPosts.publishedAt, since)
        ))
        .orderBy(desc(instagramPosts.publishedAt))
        .limit(30);

      if (posts.length === 0) return { analyzed: 0, alerts: [], topPosts: [], weakPosts: [] };

      // Calcular score de engajamento para cada post
      type ScoredPost = { id: number; title: string; type: string | null; contentCategory: string | null; publishedAt: Date | null; likes: number; comments: number; shares: number; saves: number; reach: number; score: number };
      type DbPost = typeof posts[number];
      const scored: ScoredPost[] = posts.map((p: DbPost) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        contentCategory: p.contentCategory,
        publishedAt: p.publishedAt,
        likes: p.realLikes ?? p.expectedLikes ?? 0,
        comments: p.realComments ?? p.expectedComments ?? 0,
        shares: p.realShares ?? 0,
        saves: p.realSaves ?? 0,
        reach: p.realReach ?? p.expectedReach ?? 0,
        score: (p.realLikes ?? p.expectedLikes ?? 0) * 1
          + (p.realComments ?? p.expectedComments ?? 0) * 3
          + (p.realShares ?? 0) * 5
          + (p.realSaves ?? 0) * 4,
      }));

      const avgScore = scored.reduce((s: number, p: ScoredPost) => s + p.score, 0) / scored.length;
      const topPosts = scored.filter((p: ScoredPost) => p.score >= avgScore * 1.3).slice(0, 5);
      const weakPosts = scored.filter((p: ScoredPost) => p.score < avgScore * 0.7).slice(0, 5);

      // Pedir análise à IA
      const postsJson = JSON.stringify(scored.slice(0, 15).map((p: ScoredPost) => ({
        id: p.id, title: p.title, type: p.type, category: p.contentCategory,
        likes: p.likes, comments: p.comments, shares: p.shares, saves: p.saves, score: p.score
      })));

      const aiResp = await invokeLLM({
        messages: [
          { role: "system", content: `Você é um analista de marketing político digital. Analise os posts abaixo e retorne JSON com:
- "topIds": array de IDs dos 3 melhores posts
- "weakIds": array de IDs dos 3 piores posts
- "suggestions": array de objetos {id, action: 'replicar'|'ajustar'|'descartar', note: string explicando o motivo em 1 frase}
- "alerts": array de strings com alertas estratégicos (ex: 'Poucos posts de Bastidor esta semana', 'Narrativa não reforçada')
Retorne APENAS JSON válido.` },
          { role: "user", content: postsJson }
        ],
        response_format: { type: "json_object" } as any,
      });

      let aiResult: any = {};
      try {
        const content = (aiResp as any).choices?.[0]?.message?.content || "{}";
        aiResult = JSON.parse(content);
      } catch { aiResult = {}; }

      // Salvar análise no banco
      for (const post of scored) {
        const isTop = (aiResult.topIds || []).includes(post.id);
        const isWeak = (aiResult.weakIds || []).includes(post.id);
        const suggestion = (aiResult.suggestions || []).find((s: any) => s.id === post.id);
        if (isTop || isWeak || suggestion) {
          await db.update(instagramPosts).set({
            aiAnalysis: isTop ? "top" : isWeak ? "fraco" : "neutro",
            aiSuggestion: suggestion?.action ?? null,
            aiSuggestionNote: suggestion?.note ?? null,
          }).where(eq(instagramPosts.id, post.id));
        }
      }

      return {
        analyzed: posts.length,
        avgScore: Math.round(avgScore),
        topPosts,
        weakPosts,
        alerts: aiResult.alerts || [],
        suggestions: aiResult.suggestions || [],
      };
    }),

  // ─── Alertas automáticos de volume e diversidade ───────────────────────────
  getAlerts: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { alerts: [] };

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekPosts = await db.select().from(instagramPosts)
        .where(and(
          gte(instagramPosts.scheduledDate, weekStart),
          lte(instagramPosts.scheduledDate, weekEnd)
        ));

      const alerts: { type: "warning" | "info" | "error"; message: string }[] = [];

      // Alerta: baixo volume
      const daysInWeek = 7;
      const minExpected = daysInWeek * 2; // mínimo 2 posts/dia
      if (weekPosts.length < minExpected) {
        alerts.push({ type: "warning", message: `⚠️ Baixo volume esta semana: ${weekPosts.length} posts (mínimo recomendado: ${minExpected})` });
      }

      // Alerta: falta de diversidade de categorias
      type WkPost = typeof weekPosts[number];
      type CatVal = NonNullable<WkPost["contentCategory"]>;
      const categories = weekPosts.map((p: WkPost) => p.contentCategory).filter((c: WkPost["contentCategory"]): c is CatVal => Boolean(c));
      const uniqueCategories = new Set(categories).size;
      if (weekPosts.length > 3 && uniqueCategories < 3) {
        alerts.push({ type: "warning", message: `⚠️ Falta de diversidade: apenas ${uniqueCategories} categoria(s) de conteúdo esta semana` });
      }

      // Alerta: sem posts de Autoridade
      const hasAutoridade = weekPosts.some((p: WkPost) => p.contentCategory === "autoridade");
      if (weekPosts.length > 0 && !hasAutoridade) {
        alerts.push({ type: "info", message: `💡 Nenhum post de Autoridade planejado esta semana` });
      }

      // Alerta: sem Reels
      const hasReels = weekPosts.some((p: WkPost) => p.type === "reels");
      if (weekPosts.length > 0 && !hasReels) {
        alerts.push({ type: "info", message: `💡 Nenhum Reel planejado esta semana — Reels têm maior alcance orgânico` });
      }

      // Alerta: posts sem categoria definida
      const semCategoria = weekPosts.filter((p: WkPost) => !p.contentCategory).length;
      if (semCategoria > 0) {
        alerts.push({ type: "info", message: `📋 ${semCategoria} post(s) sem categoria definida esta semana` });
      }

      return { alerts, weekPostCount: weekPosts.length, categoryCounts: categories.reduce((acc: Record<string, number>, c: string) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {}) };
    }),

  // ─── Sugestão de horário ideal ─────────────────────────────────────────────
  suggestBestTime: publicProcedure
    .input(z.object({ type: z.enum(["reels", "carrossel", "video", "story", "imagem"]) }))
    .query(({ input }) => {
      // Horários baseados em benchmarks de engajamento político no Instagram Brasil
      const bestTimes: Record<string, { time: string; reason: string }[]> = {
        reels:    [{ time: "19:00", reason: "Pico de visualizações à noite" }, { time: "12:00", reason: "Pausa do almoço" }],
        carrossel:[{ time: "08:00", reason: "Manhã — alto salvamento" }, { time: "20:00", reason: "Noite — mais compartilhamentos" }],
        video:    [{ time: "19:00", reason: "Pico de visualizações à noite" }, { time: "21:00", reason: "Após jantar" }],
        story:    [{ time: "07:30", reason: "Início do dia" }, { time: "12:00", reason: "Almoço" }, { time: "21:00", reason: "Noite" }],
        imagem:   [{ time: "09:00", reason: "Manhã" }, { time: "18:00", reason: "Fim do expediente" }],
      };
      return { suggestions: bestTimes[input.type] || bestTimes.imagem };
    }),

  // ─── Sugestão de conteúdo baseada na narrativa ─────────────────────────────
  suggestContent: publicProcedure
    .input(z.object({
      category: z.enum(["autoridade", "bastidor", "opiniao", "vida_pessoal", "proposta"]),
      type: z.enum(["reels", "carrossel", "video", "story", "imagem"]).optional().default("reels"),
      narrativeCentralPhrase: z.string().optional(),
      narrativePillars: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const categoryLabels: Record<string, string> = {
        autoridade: "Autoridade (demonstrar competência e credibilidade)",
        bastidor: "Bastidor (mostrar o dia a dia da campanha, humanizar)",
        opiniao: "Opinião (posicionamento claro sobre um tema)",
        vida_pessoal: "Vida Pessoal Leve (humanização, família, hobbies)",
        proposta: "Proposta (apresentar uma proposta concreta)",
      };

      const narrativeContext = input.narrativeCentralPhrase
        ? `Frase central da campanha: "${input.narrativeCentralPhrase}". Pilares: ${(input.narrativePillars || []).join(", ")}.`
        : "Candidato Eduardo Brandão, Partido Verde DF, foco em Brasília Cidade Parque.";

      const resp = await invokeLLM({
        messages: [
          { role: "system", content: `Você é um estrategista de conteúdo político digital. ${narrativeContext} Gere 3 ideias de conteúdo para Instagram no formato ${input.type} na categoria ${categoryLabels[input.category]}. Retorne JSON: {"ideas": [{"title": string, "description": string, "caption": string, "hashtags": string, "roteiro": string}]}` },
          { role: "user", content: `Gere 3 ideias de ${input.type} para a categoria ${input.category}` }
        ],
        response_format: { type: "json_object" } as any,
      });

      try {
        const content = (resp as any).choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);
        return { ideas: parsed.ideas || [] };
      } catch {
        return { ideas: [] };
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
