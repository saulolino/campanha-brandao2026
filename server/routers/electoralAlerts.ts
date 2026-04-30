import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getDb } from "../db";
import { electoralAlertLog } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { createNotification } from "./notifications";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ElectoralDate {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  month: string;
}

function loadElectoralDates(): ElectoralDate[] {
  try {
    const filePath = join(__dirname, "../data/electoral_calendar_2026.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as ElectoralDate[];
  } catch {
    return [];
  }
}

// Categorias consideradas críticas para alertas
const CRITICAL_CATEGORIES = ["eleicao", "prazo", "restricao", "convencao", "propaganda"];

// Dias de antecedência para alertas
const ALERT_DAYS = [7, 3, 1];

// Função principal: verifica marcos eleitorais e dispara alertas
export async function checkAndSendElectoralAlerts(): Promise<{
  checked: number;
  sent: number;
  skipped: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) return { checked: 0, sent: 0, skipped: 0, errors: ["DB indisponível"] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = loadElectoralDates();
  const criticalDates = allDates.filter(d => CRITICAL_CATEGORIES.includes(d.category));

  let checked = 0;
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const electoralDate of criticalDates) {
    const eventDate = new Date(electoralDate.date + "T12:00:00");
    eventDate.setHours(0, 0, 0, 0);

    for (const daysBeforeEvent of ALERT_DAYS) {
      const alertDate = new Date(eventDate);
      alertDate.setDate(alertDate.getDate() - daysBeforeEvent);

      // Só dispara se hoje é o dia do alerta
      if (alertDate.getTime() !== today.getTime()) continue;

      checked++;

      // Verificar se já foi enviado (evitar duplicatas)
      const existing = await db
        .select()
        .from(electoralAlertLog)
        .where(
          and(
            eq(electoralAlertLog.electoralDateId, electoralDate.id),
            eq(electoralAlertLog.daysBeforeEvent, daysBeforeEvent)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Montar mensagem do alerta
      const urgencyLabel =
        daysBeforeEvent === 1 ? "⚠️ AMANHÃ" :
        daysBeforeEvent === 3 ? "🔔 Em 3 dias" :
        "📅 Em 7 dias";

      const categoryLabels: Record<string, string> = {
        eleicao: "🗳️ Eleição",
        prazo: "⏰ Prazo Legal",
        restricao: "🚫 Restrição",
        convencao: "🏛️ Convenção",
        propaganda: "📢 Propaganda",
        financeiro: "💰 Financeiro",
        legal: "⚖️ Marco Legal",
        tse: "📋 TSE",
      };

      const catLabel = categoryLabels[electoralDate.category] || electoralDate.category;
      const eventDateStr = new Date(electoralDate.date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
      });

      const title = `${urgencyLabel} — ${electoralDate.title}`;
      const message = `${catLabel} • ${eventDateStr}\n\n${electoralDate.description}\n\nEste é um marco eleitoral crítico do Calendário TSE 2026. Verifique se a campanha está preparada.`;

      try {
        // 1. Notificação interna no sistema (para coordenadores)
        await createNotification({
          type: "sistema",
          title,
          message,
          metadata: {
            electoralDateId: electoralDate.id,
            electoralDate: electoralDate.date,
            daysBeforeEvent,
            category: electoralDate.category,
          },
        });

        // 2. Notificação para o owner (via Manus)
        await notifyOwner({ title, content: message });

        // 3. Registrar no log para evitar duplicatas
        await db.insert(electoralAlertLog).values({
          electoralDateId: electoralDate.id,
          electoralTitle: electoralDate.title,
          electoralDate: electoralDate.date,
          category: electoralDate.category,
          daysBeforeEvent,
          notificationSent: 1,
        });

        sent++;
      } catch (err: any) {
        errors.push(`Erro ao enviar alerta para "${electoralDate.title}" (${daysBeforeEvent}d): ${err?.message}`);

        // Registrar falha no log
        try {
          await db.insert(electoralAlertLog).values({
            electoralDateId: electoralDate.id,
            electoralTitle: electoralDate.title,
            electoralDate: electoralDate.date,
            category: electoralDate.category,
            daysBeforeEvent,
            notificationSent: 0,
            notificationError: err?.message,
          });
        } catch { /* ignora erro de log */ }
      }
    }
  }

  return { checked, sent, skipped, errors };
}

export const electoralAlertsRouter = router({
  // Verificar e disparar alertas manualmente (apenas coordenador/superadmin)
  checkAndSend: protectedProcedure.mutation(async ({ ctx }) => {
    if (!["coordinator", "superadmin"].includes(ctx.user.role ?? "")) {
      throw new Error("Apenas coordenadores podem disparar alertas manualmente.");
    }
    return await checkAndSendElectoralAlerts();
  }),

  // Listar alertas já disparados
  getLogs: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const limit = input?.limit ?? 30;
      return await db
        .select()
        .from(electoralAlertLog)
        .orderBy(desc(electoralAlertLog.sentAt))
        .limit(limit);
    }),

  // Próximos alertas que serão disparados (preview)
  getUpcomingAlerts: publicProcedure
    .input(z.object({ days: z.number().min(1).max(30).default(14) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const days = input?.days ?? 14;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allDates = loadElectoralDates();
      const criticalDates = allDates.filter(d => CRITICAL_CATEGORIES.includes(d.category));

      // Buscar alertas já enviados para marcar como "já notificado"
      const sentAlerts = db
        ? await db.select().from(electoralAlertLog).where(eq(electoralAlertLog.notificationSent, 1))
        : [];
      const sentKeys = new Set(sentAlerts.map((a: typeof sentAlerts[0]) => `${a.electoralDateId}_${a.daysBeforeEvent}`));

      const upcoming: Array<{
        electoralDate: ElectoralDate;
        daysBeforeEvent: number;
        alertDate: string;
        alreadySent: boolean;
      }> = [];

      for (const ed of criticalDates) {
        const eventDate = new Date(ed.date + "T12:00:00");
        eventDate.setHours(0, 0, 0, 0);

        for (const dBefore of ALERT_DAYS) {
          const alertDate = new Date(eventDate);
          alertDate.setDate(alertDate.getDate() - dBefore);

          // Só inclui se o alerta cai nos próximos N dias
          const diffMs = alertDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 0 || diffDays > days) continue;

          upcoming.push({
            electoralDate: ed,
            daysBeforeEvent: dBefore,
            alertDate: alertDate.toISOString().split("T")[0],
            alreadySent: sentKeys.has(`${ed.id}_${dBefore}`),
          });
        }
      }

      return upcoming.sort((a, b) => a.alertDate.localeCompare(b.alertDate));
    }),
});
