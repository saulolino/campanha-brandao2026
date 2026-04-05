// ============================================================
// DESIGN: Command Center Militar Verde
// Sistema de Notificações e Lembretes de Posts
// ============================================================

export type NotificationType = "urgent" | "warning" | "info" | "success";
export type NotificationCategory = "post" | "metric" | "team" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  relatedPostDate?: string;
}

export interface UpcomingPost {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  pillar: string;
  daysUntil: number;
  hoursUntil: number;
  status: "overdue" | "today" | "tomorrow" | "upcoming" | "week";
}

// Simulated upcoming posts based on calendar
export function getUpcomingPosts(): UpcomingPost[] {
  const now = new Date();
  const posts: UpcomingPost[] = [
    {
      id: "p1",
      title: "Brasília tem 42% menos áreas verdes do que deveria",
      date: "2026-04-07",
      time: "18:00",
      type: "Carrossel",
      pillar: "Conteúdo de Causa",
      daysUntil: 2,
      hoursUntil: 48,
      status: "upcoming",
    },
    {
      id: "p2",
      title: "O que é o projeto Brasília Cidade Parque?",
      date: "2026-04-09",
      time: "10:00",
      type: "Vídeo",
      pillar: "Conteúdo de Explicação",
      daysUntil: 4,
      hoursUntil: 96,
      status: "upcoming",
    },
    {
      id: "p3",
      title: "Um sábado no Parque da Cidade com a família",
      date: "2026-04-11",
      time: "12:00",
      type: "Reels",
      pillar: "Conteúdo Humano",
      daysUntil: 6,
      hoursUntil: 144,
      status: "week",
    },
    {
      id: "p4",
      title: "Antes e depois: Praça revitalizada no Gama",
      date: "2026-04-14",
      time: "18:00",
      type: "Carrossel",
      pillar: "Conteúdo de Causa",
      daysUntil: 9,
      hoursUntil: 216,
      status: "week",
    },
    {
      id: "p5",
      title: "5 parques que Brasília precisa urgentemente",
      date: "2026-04-16",
      time: "10:00",
      type: "Vídeo",
      pillar: "Conteúdo de Explicação",
      daysUntil: 11,
      hoursUntil: 264,
      status: "week",
    },
  ];

  return posts;
}

// Simulated notifications
export function getNotifications(): Notification[] {
  return [
    {
      id: "n1",
      type: "urgent",
      category: "post",
      title: "Post em 2 dias",
      message: "\"Brasília tem 42% menos áreas verdes\" precisa estar pronto até 07/04 às 18:00",
      time: "Agora",
      read: false,
      actionLabel: "Ver post",
      relatedPostDate: "2026-04-07",
    },
    {
      id: "n2",
      type: "warning",
      category: "post",
      title: "Produção pendente",
      message: "\"O que é o projeto Brasília Cidade Parque?\" — vídeo precisa ser gravado (09/04)",
      time: "2h atrás",
      read: false,
      actionLabel: "Ver detalhes",
      relatedPostDate: "2026-04-09",
    },
    {
      id: "n3",
      type: "info",
      category: "metric",
      title: "Atualização de métricas",
      message: "Dados do Instagram atualizados: 1.518 seguidores (+13 desde última coleta)",
      time: "3h atrás",
      read: false,
    },
    {
      id: "n4",
      type: "success",
      category: "post",
      title: "Post publicado com sucesso",
      message: "\"Feliz Páscoa! Renascimento e esperança\" — 50 curtidas, 7 comentários",
      time: "05/04 às 10:00",
      read: true,
    },
    {
      id: "n5",
      type: "warning",
      category: "team",
      title: "Revisão necessária",
      message: "3 posts da Semana 1 aguardam aprovação do coordenador",
      time: "Ontem",
      read: true,
      actionLabel: "Revisar",
    },
    {
      id: "n6",
      type: "info",
      category: "system",
      title: "Meta semanal",
      message: "Para atingir a meta de abril, são necessários +574 seguidores nos próximos 25 dias",
      time: "Ontem",
      read: true,
    },
    {
      id: "n7",
      type: "urgent",
      category: "post",
      title: "Conteúdo não aprovado",
      message: "O carrossel \"Antes e depois: Praça revitalizada\" ainda não foi revisado pela equipe",
      time: "2 dias atrás",
      read: true,
      actionLabel: "Aprovar",
      relatedPostDate: "2026-04-14",
    },
    {
      id: "n8",
      type: "success",
      category: "metric",
      title: "Engajamento acima da meta",
      message: "Taxa de engajamento atual: 3.1% (meta: 2.5%) — excelente desempenho!",
      time: "3 dias atrás",
      read: true,
    },
  ];
}

// Reminder rules
export const REMINDER_RULES = [
  { label: "72h antes", hours: 72, type: "info" as NotificationType, description: "Lembrete de preparação — iniciar produção do conteúdo" },
  { label: "48h antes", hours: 48, type: "warning" as NotificationType, description: "Alerta de prazo — conteúdo deve estar em revisão" },
  { label: "24h antes", hours: 24, type: "urgent" as NotificationType, description: "Urgente — conteúdo deve estar aprovado e agendado" },
  { label: "2h antes", hours: 2, type: "urgent" as NotificationType, description: "Publicação iminente — verificar agendamento final" },
];
