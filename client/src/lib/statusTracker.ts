// ============================================================
// DESIGN: Command Center Militar Verde
// Painel de Acompanhamento de Status — Tracker de Posts
// ============================================================

export type PostStatus = "planejado" | "em_producao" | "aprovado" | "publicado" | "cancelado";

export interface TrackedPost {
  id: string;
  weekId: number;
  title: string;
  date: string;
  dayOfWeek: string;
  time: string;
  pillar: string;
  format: string;
  status: PostStatus;
  assignedTo: string;
  metaAlcance: number;
  metaCurtidas: number;
  metaComentarios: number;
  realAlcance?: number;
  realCurtidas?: number;
  realComentarios?: number;
  notes: string;
  adBudget: number;
  priority: "alta" | "media" | "baixa";
}

export interface WeeklyGoals {
  weekId: number;
  weekLabel: string;
  dateRange: string;
  totalPosts: number;
  metaSeguidores: number;
  metaAlcanceTotal: number;
  metaCurtidasTotal: number;
  metaComentariosTotal: number;
  realSeguidores?: number;
  realAlcanceTotal?: number;
  realCurtidasTotal?: number;
  realComentariosTotal?: number;
  adBudgetTotal: number;
}

export const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  planejado: { label: "Planejado", color: "#6c757d", bgColor: "#6c757d20", icon: "📋" },
  em_producao: { label: "Em Produção", color: "#c9a84c", bgColor: "#c9a84c20", icon: "🎬" },
  aprovado: { label: "Aprovado", color: "#40916c", bgColor: "#40916c20", icon: "✅" },
  publicado: { label: "Publicado", color: "#2d6a4f", bgColor: "#2d6a4f20", icon: "🚀" },
  cancelado: { label: "Cancelado", color: "#e76f51", bgColor: "#e76f5120", icon: "❌" },
};

export const WEEKLY_GOALS: WeeklyGoals[] = [
  {
    weekId: 1,
    weekLabel: "Semana 1",
    dateRange: "06 - 12 Abril",
    totalPosts: 3,
    metaSeguidores: 1650,
    metaAlcanceTotal: 5300,
    metaCurtidasTotal: 210,
    metaComentariosTotal: 37,
    adBudgetTotal: 250,
  },
  {
    weekId: 2,
    weekLabel: "Semana 2",
    dateRange: "13 - 19 Abril",
    totalPosts: 3,
    metaSeguidores: 1800,
    metaAlcanceTotal: 6200,
    metaCurtidasTotal: 240,
    metaComentariosTotal: 42,
    adBudgetTotal: 300,
  },
  {
    weekId: 3,
    weekLabel: "Semana 3",
    dateRange: "20 - 26 Abril",
    totalPosts: 3,
    metaSeguidores: 1950,
    metaAlcanceTotal: 7100,
    metaCurtidasTotal: 270,
    metaComentariosTotal: 48,
    adBudgetTotal: 250,
  },
  {
    weekId: 4,
    weekLabel: "Semana 4",
    dateRange: "27 Abr - 03 Mai",
    totalPosts: 3,
    metaSeguidores: 2092,
    metaAlcanceTotal: 7800,
    metaCurtidasTotal: 300,
    metaComentariosTotal: 52,
    adBudgetTotal: 200,
  },
];

export const TRACKED_POSTS: TrackedPost[] = [
  // Semana 1
  {
    id: "tp-1-1",
    weekId: 1,
    title: "Brasília tem 42% menos áreas verdes do que deveria",
    date: "07/04/2026",
    dayOfWeek: "Terça",
    time: "12:00",
    pillar: "Causa",
    format: "Reels (60s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 2000,
    metaCurtidas: 80,
    metaComentarios: 15,
    notes: "Post de lançamento. Precisa ter qualidade cinematográfica. Investir em drone.",
    adBudget: 150,
    priority: "alta",
  },
  {
    id: "tp-1-2",
    weekId: 1,
    title: "O que é o projeto Brasília Cidade Parque?",
    date: "09/04/2026",
    dayOfWeek: "Quinta",
    time: "18:00",
    pillar: "Explicação",
    format: "Carrossel (7 slides)",
    status: "planejado",
    assignedTo: "Designer",
    metaAlcance: 1500,
    metaCurtidas: 60,
    metaComentarios: 10,
    notes: "Infográfico educativo. Usar dados reais e design limpo.",
    adBudget: 0,
    priority: "alta",
  },
  {
    id: "tp-1-3",
    weekId: 1,
    title: "Um sábado no Parque da Cidade com a família",
    date: "11/04/2026",
    dayOfWeek: "Sábado",
    time: "10:00",
    pillar: "Humano",
    format: "Vídeo (90s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 1800,
    metaCurtidas: 70,
    metaComentarios: 12,
    notes: "Vídeo casual com celular. Naturalidade é a chave.",
    adBudget: 100,
    priority: "media",
  },
  // Semana 2
  {
    id: "tp-2-1",
    weekId: 2,
    title: "Antes e Depois: Parque Olhos D'Água",
    date: "14/04/2026",
    dayOfWeek: "Terça",
    time: "12:00",
    pillar: "Causa",
    format: "Reels (45s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 2500,
    metaCurtidas: 90,
    metaComentarios: 18,
    notes: "Conteúdo viral. Usar split-screen para antes/depois.",
    adBudget: 200,
    priority: "alta",
  },
  {
    id: "tp-2-2",
    weekId: 2,
    title: "5 parques de Brasília que você precisa conhecer",
    date: "16/04/2026",
    dayOfWeek: "Quinta",
    time: "18:00",
    pillar: "Explicação",
    format: "Carrossel (7 slides)",
    status: "planejado",
    assignedTo: "Designer",
    metaAlcance: 1800,
    metaCurtidas: 70,
    metaComentarios: 12,
    notes: "Conteúdo salvável. Fotos bonitas de cada parque.",
    adBudget: 0,
    priority: "media",
  },
  {
    id: "tp-2-3",
    weekId: 2,
    title: "Depoimento: Dona Maria do Paranoá",
    date: "18/04/2026",
    dayOfWeek: "Sábado",
    time: "10:00",
    pillar: "Humano",
    format: "Vídeo (60s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 1900,
    metaCurtidas: 80,
    metaComentarios: 12,
    notes: "Depoimento emocional. Pedir autorização de imagem.",
    adBudget: 100,
    priority: "media",
  },
  // Semana 3
  {
    id: "tp-3-1",
    weekId: 3,
    title: "Brasília gasta R$ 0 em novos parques — isso precisa mudar",
    date: "21/04/2026",
    dayOfWeek: "Terça",
    time: "12:00",
    pillar: "Causa",
    format: "Reels (60s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 2800,
    metaCurtidas: 100,
    metaComentarios: 20,
    notes: "Estatística chocante. Usar dados do orçamento público.",
    adBudget: 150,
    priority: "alta",
  },
  {
    id: "tp-3-2",
    weekId: 3,
    title: "Como funciona o orçamento de áreas verdes do DF",
    date: "23/04/2026",
    dayOfWeek: "Quinta",
    time: "18:00",
    pillar: "Explicação",
    format: "Carrossel (6 slides)",
    status: "planejado",
    assignedTo: "Designer",
    metaAlcance: 2000,
    metaCurtidas: 75,
    metaComentarios: 14,
    notes: "Infográfico com dados reais. Transparência.",
    adBudget: 0,
    priority: "media",
  },
  {
    id: "tp-3-3",
    weekId: 3,
    title: "Mutirão Verde no Parque Águas Claras",
    date: "25/04/2026",
    dayOfWeek: "Sábado",
    time: "10:00",
    pillar: "Mobilização",
    format: "Reels (45s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 2300,
    metaCurtidas: 95,
    metaComentarios: 14,
    notes: "Convite para evento real. CTA 'EU VOU'.",
    adBudget: 100,
    priority: "alta",
  },
  // Semana 4
  {
    id: "tp-4-1",
    weekId: 4,
    title: "Resultados do Mutirão Verde — o que conquistamos",
    date: "28/04/2026",
    dayOfWeek: "Terça",
    time: "12:00",
    pillar: "Mobilização",
    format: "Carrossel (6 slides)",
    status: "planejado",
    assignedTo: "Designer",
    metaAlcance: 2600,
    metaCurtidas: 100,
    metaComentarios: 18,
    notes: "Prestação de contas do mutirão. Fotos reais.",
    adBudget: 100,
    priority: "alta",
  },
  {
    id: "tp-4-2",
    weekId: 4,
    title: "Mapa interativo: parques de Brasília por região",
    date: "30/04/2026",
    dayOfWeek: "Quinta",
    time: "18:00",
    pillar: "Explicação",
    format: "Carrossel (8 slides)",
    status: "planejado",
    assignedTo: "Designer",
    metaAlcance: 2400,
    metaCurtidas: 90,
    metaComentarios: 16,
    notes: "Conteúdo altamente salvável. Mapa por RA.",
    adBudget: 0,
    priority: "media",
  },
  {
    id: "tp-4-3",
    weekId: 4,
    title: "Abril em números — nosso primeiro mês",
    date: "02/05/2026",
    dayOfWeek: "Sábado",
    time: "10:00",
    pillar: "Causa",
    format: "Reels (60s)",
    status: "planejado",
    assignedTo: "Produtor de Conteúdo",
    metaAlcance: 2800,
    metaCurtidas: 110,
    metaComentarios: 18,
    notes: "Retrospectiva do mês. Números reais + prévia de maio.",
    adBudget: 100,
    priority: "alta",
  },
];
