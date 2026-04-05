// ============================================================
// DESIGN: Command Center Militar Verde
// Métricas em Tempo Real — Dados do Instagram
// ============================================================

export interface MetricSnapshot {
  date: string;
  followers: number;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagement: number;
}

export interface WeeklyComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  target: number;
  unit: string;
}

export interface PostPerformance {
  id: string;
  title: string;
  date: string;
  type: string;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  saves: number;
  shares: number;
  engagementRate: number;
  status: "above" | "on_track" | "below";
}

// Historical snapshots (last 4 weeks)
export const METRIC_HISTORY: MetricSnapshot[] = [
  { date: "2026-03-08", followers: 1480, likes: 245, comments: 32, reach: 1850, impressions: 3200, engagement: 2.8 },
  { date: "2026-03-15", followers: 1492, likes: 312, comments: 45, reach: 2890, impressions: 4370, engagement: 3.0 },
  { date: "2026-03-22", followers: 1500, likes: 198, comments: 22, reach: 1520, impressions: 2800, engagement: 2.5 },
  { date: "2026-03-29", followers: 1508, likes: 275, comments: 38, reach: 2100, impressions: 3600, engagement: 2.9 },
  { date: "2026-04-05", followers: 1518, likes: 330, comments: 48, reach: 2650, impressions: 4100, engagement: 3.1 },
];

// Weekly comparison
export const WEEKLY_COMPARISON: WeeklyComparison[] = [
  { metric: "Seguidores", current: 1518, previous: 1508, change: 10, changePercent: 0.66, target: 685, unit: "" },
  { metric: "Curtidas Totais", current: 330, previous: 275, change: 55, changePercent: 20, target: 400, unit: "" },
  { metric: "Comentários", current: 48, previous: 38, change: 10, changePercent: 26.3, target: 60, unit: "" },
  { metric: "Alcance", current: 2650, previous: 2100, change: 550, changePercent: 26.2, target: 5000, unit: "" },
  { metric: "Impressões", current: 4100, previous: 3600, change: 500, changePercent: 13.9, target: 8000, unit: "" },
  { metric: "Engajamento", current: 3.1, previous: 2.9, change: 0.2, changePercent: 6.9, target: 4.5, unit: "%" },
];

// Recent post performance
export const RECENT_POSTS: PostPerformance[] = [
  {
    id: "rp1",
    title: "Feliz Páscoa! Renascimento e esperança",
    date: "2026-04-05",
    type: "Vídeo",
    likes: 50,
    comments: 7,
    reach: 142,
    impressions: 280,
    saves: 3,
    shares: 2,
    engagementRate: 4.2,
    status: "on_track",
  },
  {
    id: "rp2",
    title: "Causa animal: Hospital Veterinário Público",
    date: "2026-04-03",
    type: "Carrossel",
    likes: 23,
    comments: 3,
    reach: 192,
    impressions: 350,
    saves: 5,
    shares: 1,
    engagementRate: 1.6,
    status: "below",
  },
  {
    id: "rp3",
    title: "Você lembra do seu voto para Deputado Distrital?",
    date: "2026-04-03",
    type: "Vídeo",
    likes: 53,
    comments: 4,
    reach: 481,
    impressions: 720,
    saves: 8,
    shares: 5,
    engagementRate: 1.4,
    status: "on_track",
  },
  {
    id: "rp4",
    title: "Defesa do Meio Ambiente é inegociável - PV",
    date: "2026-03-27",
    type: "Carrossel",
    likes: 25,
    comments: 1,
    reach: 650,
    impressions: 980,
    saves: 4,
    shares: 3,
    engagementRate: 0.5,
    status: "below",
  },
  {
    id: "rp5",
    title: "Master x BRB - Escândalo",
    date: "2026-03-15",
    type: "Vídeo",
    likes: 85,
    comments: 19,
    reach: 717,
    impressions: 1200,
    saves: 12,
    shares: 8,
    engagementRate: 2.3,
    status: "above",
  },
  {
    id: "rp6",
    title: "Deputado Israel Batista",
    date: "2026-03-14",
    type: "Carrossel",
    likes: 107,
    comments: 10,
    reach: 573,
    impressions: 900,
    saves: 6,
    shares: 4,
    engagementRate: 2.8,
    status: "above",
  },
];

export const LAST_UPDATE = "05/04/2026 às 19:35";
export const NEXT_UPDATE = "12/04/2026 às 19:00";
