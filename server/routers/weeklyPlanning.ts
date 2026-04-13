/**
 * Router de Planejamento Semanal
 * Gerencia sessões de chat guiado para planejamento de conteúdo e ações de rua
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { weeklyPlanningSessions, planningMessages, instagramPosts, streetEvents } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekBounds(referenceDate: Date = new Date()) {
  // Próxima segunda-feira (ou hoje se for domingo)
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0=dom, 1=seg...
  const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + daysUntilMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

// ─── Prompts do sistema ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é o assistente de planejamento semanal da campanha Eduardo Brandão — Brasília Cidade Parque.

Sua função é conduzir uma conversa estruturada para planejar a semana de conteúdo digital e ações de rua da campanha.

CONTEXTO DA CAMPANHA:
- Candidato: Eduardo Brandão
- Cargo: Deputado Distrital (Câmara Legislativa do DF)
- Eleição: Outubro 2026
- Meta: 20.000 seguidores no Instagram
- Território: Brasília — RAs prioritárias: Asa Sul, Asa Norte, Lago Norte, Lago Sul, Cruzeiro, Sudoeste, Noroeste, Guará
- Pilares: Mobilidade Urbana, Saúde, Gestão Fiscal, Meio Ambiente (Brasília Cidade Parque), Segurança

METODOLOGIA (Teoria do Formato Validado):
- Funil de 3 estágios: Topo (descoberta/reconhecimento) → Meio (consideração/autoridade) → Fundo (mobilização)
- Framework PAS: Problema → Agitação → Solução
- Regra dos 3 segundos: nome da RA nos primeiros 3 segundos do Reel
- Mix atual: 60% topo, 35% meio, 5% fundo

FORMATOS DISPONÍVEIS:
- Posts: reels, carrossel, story, imagem, video
- Ações de rua: caminhada, reuniao, panfletagem, visita, debate, entrevista, show, outro

REGRAS:
1. Sempre basear sugestões em FATOS VERIFICADOS com fontes (TCDF, Metrópoles, G1, Correio Braziliense, Sindmédico DF, etc.)
2. Citar números concretos (datas, valores, percentuais)
3. Cada post deve ter: título, formato, objetivo, roteiro/descrição, legenda, hashtags e notas de produção
4. Cada ação de rua deve ter: título, tipo, data, horário, local, bairro, público esperado e roteiro
5. Conectar ações de rua com posts (a visita de terça gera o Reel de segunda)

Quando o usuário responder as perguntas, você deve:
1. Confirmar as respostas
2. Propor um plano coerente com 5 posts e 2 ações de rua
3. Aguardar aprovação antes de cadastrar
4. Ao receber aprovação, retornar um JSON estruturado com os dados para cadastro`;

const QUESTIONS_FLOW = [
  {
    id: "periodo",
    pergunta: "📅 **Período da semana**\n\nQual semana vamos planejar? (Ex: próxima semana, semana de 21–25 de abril)\n\nSe quiser, pode confirmar apenas com \"próxima semana\" e eu calculo as datas automaticamente.",
    tipo: "pergunta",
  },
  {
    id: "volume",
    pergunta: "📊 **Volume de produção**\n\nQuantas ações de rua e quantos posts por semana a equipe consegue executar?\n\n_(Padrão sugerido: 2 ações de rua + 5 posts)_",
    tipo: "pergunta",
  },
  {
    id: "territorio",
    pergunta: "📍 **Território prioritário**\n\nQuais RAs (Regiões Administrativas) são foco desta semana?\n\n_(Ex: Asa Norte, Lago Sul, Ceilândia, Taguatinga...)_",
    tipo: "pergunta",
  },
  {
    id: "pautas",
    pergunta: "🔥 **Pautas e fatos da semana**\n\nHá alguma pauta local urgente, notícia recente ou problema específico que a campanha quer abordar?\n\n_(Ex: obra parada, problema no transporte, crise na saúde, evento político...)_",
    tipo: "pergunta",
  },
  {
    id: "agenda",
    pergunta: "🗓️ **Agenda e restrições**\n\nHá eventos externos já marcados, dias indisponíveis ou temas que a campanha prefere evitar esta semana?",
    tipo: "pergunta",
  },
];

// ─── Router ───────────────────────────────────────────────────────────────────

export const weeklyPlanningRouter = router({
  // Listar sessões
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx }) => {
      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a coordenadores" });
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(weeklyPlanningSessions)
        .orderBy(desc(weeklyPlanningSessions.createdAt))
        .limit(10);
    }),

  // Obter sessão com mensagens
  getSession: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db.select().from(weeklyPlanningSessions)
        .where(eq(weeklyPlanningSessions.id, input.id)).limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.select().from(planningMessages)
        .where(eq(planningMessages.sessionId, input.id))
        .orderBy(planningMessages.createdAt);

      return { session, messages };
    }),

  // Iniciar nova sessão
  startSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a coordenadores" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { weekStart, weekEnd } = getWeekBounds();

      const [result] = await db.insert(weeklyPlanningSessions).values({
        weekStart,
        weekEnd,
        status: "em_andamento",
        createdByUserId: ctx.user.id ? Number(ctx.user.id) : null,
      });

      const sessionId = (result as any).insertId;

      // Mensagem de boas-vindas
      const welcomeMsg = `Olá! 👋 Vamos planejar a semana de **${weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} a ${weekEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}**.

Vou fazer algumas perguntas rápidas e depois gero automaticamente os posts e ações de rua para você aprovar antes de cadastrar nas agendas.

${QUESTIONS_FLOW[0].pergunta}`;

      await db.insert(planningMessages).values({
        sessionId,
        role: "assistant",
        content: welcomeMsg,
        messageType: "pergunta",
      });

      return { sessionId, welcomeMessage: welcomeMsg };
    }),

  // Enviar mensagem e receber resposta da IA
  sendMessage: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ input, ctx }) => {
      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verificar sessão
      const [session] = await db.select().from(weeklyPlanningSessions)
        .where(eq(weeklyPlanningSessions.id, input.sessionId)).limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.status !== "em_andamento") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Sessão já encerrada" });
      }

      // Salvar mensagem do usuário
      await db.insert(planningMessages).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.message,
        messageType: "resposta",
      });

      // Buscar histórico completo
      const history = await db.select().from(planningMessages)
        .where(eq(planningMessages.sessionId, input.sessionId))
        .orderBy(planningMessages.createdAt);

      // Montar mensagens para o LLM
      const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content as string,
        })),
      ];

      // Verificar se o usuário está aprovando o plano
      const isApproving = /\b(aprovo|aprovado|confirmo|confirmado|pode cadastrar|cadastra|sim|ok|certo|perfeito|ótimo|vamos|pode ir|vai em frente)\b/i.test(input.message);
      const hasPlan = history.some(m => m.role === "assistant" && m.content.includes("```json"));

      let assistantReply = "";
      let createdItems: { posts: number[]; events: number[] } = { posts: [], events: [] };

      if (isApproving && hasPlan) {
        // Usuário aprovou — extrair JSON e cadastrar
        const planMsg = [...history].reverse().find(m => m.role === "assistant" && m.content.includes("```json"));
        if (planMsg) {
          try {
            // Tentar extrair JSON do bloco ```json ... ``` ou do texto puro
            const jsonMatch = planMsg.content.match(/```json\n?([\s\S]*?)\n?```/) ||
                              planMsg.content.match(/```\n?([\s\S]*?)\n?```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : planMsg.content;
            if (jsonStr) {
              let plan: any;
              try {
                plan = JSON.parse(jsonStr);
              } catch {
                // Tentar extrair apenas o objeto JSON do texto
                const objMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (objMatch) plan = JSON.parse(objMatch[0]);
                else throw new Error("JSON inválido no plano da IA");
              }

              // Tipos válidos para posts e eventos
              const validPostTypes = ["reels", "carrossel", "video", "story", "imagem"];
              const validEventTypes = ["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"];

              // Cadastrar posts
              for (const post of (plan.posts || [])) {
                // Garantir data válida
                let scheduledDate = new Date(post.scheduledDate);
                if (isNaN(scheduledDate.getTime())) scheduledDate = new Date();
                // Garantir tipo válido
                const postType = validPostTypes.includes(post.type) ? post.type : "reels";
                const [r] = await db.insert(instagramPosts).values({
                  title: String(post.title || "Post sem título").slice(0, 255),
                  scheduledDate,
                  scheduledTime: post.scheduledTime || "12:00",
                  type: postType,
                  status: "draft",
                  objective: post.objective ? String(post.objective).slice(0, 255) : null,
                  description: post.description ? String(post.description) : null,
                  caption: post.caption ? String(post.caption) : null,
                  hashtags: post.hashtags ? String(post.hashtags) : null,
                  notes: post.notes ? String(post.notes) : null,
                  expectedReach: Number(post.expectedReach) || 0,
                  expectedLikes: Number(post.expectedLikes) || 0,
                  expectedComments: Number(post.expectedComments) || 0,
                  slideCount: Number(post.slideCount) || 1,
                });
                createdItems.posts.push((r as any).insertId);
              }

              // Cadastrar eventos
              for (const event of (plan.events || [])) {
                let eventDate = new Date(event.eventDate);
                if (isNaN(eventDate.getTime())) eventDate = new Date();
                const eventType = validEventTypes.includes(event.type) ? event.type : "outro";
                const [r] = await db.insert(streetEvents).values({
                  title: String(event.title || "Evento sem título").slice(0, 255),
                  description: event.description ? String(event.description) : null,
                  type: eventType,
                  status: "planejado",
                  eventDate,
                  eventTime: event.eventTime || "09:00",
                  endTime: event.endTime || null,
                  location: event.location ? String(event.location).slice(0, 255) : null,
                  neighborhood: event.neighborhood ? String(event.neighborhood).slice(0, 255) : null,
                  city: "Brasília",
                  expectedAttendees: Number(event.expectedAttendees) || 0,
                  notes: event.notes ? String(event.notes) : null,
                });
                createdItems.events.push((r as any).insertId);
              }

              // Atualizar sessão
              await db.update(weeklyPlanningSessions)
                .set({
                  status: "concluida",
                  generatedPosts: JSON.stringify(createdItems.posts),
                  generatedEvents: JSON.stringify(createdItems.events),
                  completedAt: new Date(),
                })
                .where(eq(weeklyPlanningSessions.id, input.sessionId));

              assistantReply = `✅ **Plano cadastrado com sucesso!**

**${createdItems.posts.length} posts** adicionados à Agenda de Conteúdo e **${createdItems.events.length} ações de rua** adicionadas à Agenda de Rua.

Você pode revisar e editar tudo diretamente nas agendas. Boa semana de campanha! 🚀

_Quando quiser planejar a próxima semana, clique em "Nova Sessão"._`;
            }
          } catch (e: any) {
            console.error("[WeeklyPlanning] Erro ao cadastrar plano:", e?.message ?? e);
            const errMsg = e?.message ?? "erro desconhecido";
            assistantReply = `Houve um erro ao cadastrar o plano: ${errMsg}. Por favor, tente novamente ou cadastre manualmente nas agendas.`;
          }
        }
      } else {
        // Continuar o diálogo com a IA
        const response = await invokeLLM({ messages: llmMessages });
        const rawContent = response.choices?.[0]?.message?.content;
        assistantReply = (typeof rawContent === "string" ? rawContent : null) || "Desculpe, não consegui processar sua resposta. Pode tentar novamente?";
      }

      // Salvar resposta do assistente
      const msgType = isApproving && hasPlan ? "confirmacao" : "pergunta";
      await db.insert(planningMessages).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: assistantReply,
        messageType: msgType,
      });

      return {
        reply: assistantReply,
        sessionStatus: isApproving && hasPlan ? "concluida" : "em_andamento",
        createdItems: isApproving && hasPlan ? createdItems : null,
      };
    }),

  // Cancelar sessão
  cancelSession: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const role = ctx.user.role ?? "visitor";
      if (!["coordinator", "superadmin"].includes(role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.update(weeklyPlanningSessions)
        .set({ status: "cancelada" })
        .where(eq(weeklyPlanningSessions.id, input.id));

      return { success: true };
    }),
});
