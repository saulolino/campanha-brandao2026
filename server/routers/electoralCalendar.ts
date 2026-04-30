import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import electoralData from "../data/electoral_calendar_2026.json" assert { type: "json" };

interface ElectoralDate {
  id: string;
  date: string;
  title: string;
  description: string;
  category: "legal" | "prazo" | "restricao" | "propaganda" | "convencao" | "financeiro" | "eleicao" | "tse";
  month: string;
}

function loadElectoralDates(): ElectoralDate[] {
  return electoralData as ElectoralDate[];
}

// Cores por categoria para uso no frontend
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  eleicao:    { bg: "bg-red-900/40",    text: "text-red-300",    border: "border-red-700",    label: "Eleição" },
  propaganda: { bg: "bg-amber-900/40",  text: "text-amber-300",  border: "border-amber-700",  label: "Propaganda" },
  prazo:      { bg: "bg-blue-900/40",   text: "text-blue-300",   border: "border-blue-700",   label: "Prazo Legal" },
  legal:      { bg: "bg-purple-900/40", text: "text-purple-300", border: "border-purple-700", label: "Marco Legal" },
  restricao:  { bg: "bg-orange-900/40", text: "text-orange-300", border: "border-orange-700", label: "Restrição" },
  convencao:  { bg: "bg-green-900/40",  text: "text-green-300",  border: "border-green-700",  label: "Convenção" },
  financeiro: { bg: "bg-teal-900/40",   text: "text-teal-300",   border: "border-teal-700",   label: "Financeiro" },
  tse:        { bg: "bg-slate-700/40",  text: "text-slate-300",  border: "border-slate-600",  label: "TSE" },
};

export const electoralCalendarRouter = router({
  // Retorna todas as datas eleitorais
  getAll: publicProcedure.query(() => {
    return loadElectoralDates();
  }),

  // Retorna datas eleitorais dentro de um intervalo de datas
  getByRange: publicProcedure
    .input(z.object({
      startDate: z.string(), // YYYY-MM-DD
      endDate: z.string(),   // YYYY-MM-DD
    }))
    .query(({ input }) => {
      const all = loadElectoralDates();
      return all.filter(d => d.date >= input.startDate && d.date <= input.endDate);
    }),

  // Retorna as próximas N datas eleitorais a partir de hoje
  getUpcoming: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(({ input }) => {
      const today = new Date().toISOString().split("T")[0];
      const all = loadElectoralDates();
      return all
        .filter(d => d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, input.limit);
    }),

  // Retorna as cores por categoria (para uso no frontend)
  getCategoryColors: publicProcedure.query(() => {
    return CATEGORY_COLORS;
  }),
});
