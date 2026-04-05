// ============================================================
// DESIGN: Command Center Militar Verde
// Análise de Concorrentes — Perfis de candidatos do DF
// ============================================================

export interface Competitor {
  id: number;
  name: string;
  handle: string;
  party: string;
  followers: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  postsPerWeek: number;
  mainTheme: string;
  strengths: string[];
  weaknesses: string[];
  trend: "up" | "down" | "stable";
  trendPercent: number;
  color: string;
}

export interface CompetitorMetric {
  label: string;
  eduardo: number;
  competitors: number[];
  unit: string;
}

export const OUR_PROFILE = {
  name: "Eduardo Brandão",
  handle: "@eduardobrandaopv",
  party: "PV",
  followers: 1518,
  avgLikes: 47.5,
  avgComments: 6.7,
  engagementRate: 3.1,
  postsPerWeek: 2.3,
  color: "#2d6a4f",
};

export const COMPETITORS: Competitor[] = [
  {
    id: 1,
    name: "Candidato A",
    handle: "@candidato_a_df",
    party: "PSD",
    followers: 12500,
    avgLikes: 85,
    avgComments: 12,
    engagementRate: 0.78,
    postsPerWeek: 5,
    mainTheme: "Saúde e Educação",
    strengths: ["Base grande de seguidores", "Conteúdo frequente", "Equipe profissional"],
    weaknesses: ["Engajamento baixo para o tamanho", "Conteúdo genérico", "Pouca interação nos comentários"],
    trend: "stable",
    trendPercent: 2,
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Candidato B",
    handle: "@candidato_b_df",
    party: "PT",
    followers: 8200,
    avgLikes: 120,
    avgComments: 25,
    engagementRate: 1.77,
    postsPerWeek: 4,
    mainTheme: "Direitos Sociais",
    strengths: ["Alto engajamento", "Conteúdo emocional", "Comunidade ativa"],
    weaknesses: ["Crescimento lento", "Pouco conteúdo técnico", "Dependente de polêmicas"],
    trend: "up",
    trendPercent: 8,
    color: "#ef4444",
  },
  {
    id: 3,
    name: "Candidato C",
    handle: "@candidato_c_df",
    party: "MDB",
    followers: 5400,
    avgLikes: 45,
    avgComments: 8,
    engagementRate: 0.98,
    postsPerWeek: 3,
    mainTheme: "Infraestrutura",
    strengths: ["Conteúdo técnico", "Parcerias políticas", "Presença em eventos"],
    weaknesses: ["Visual amador", "Sem identidade visual", "Conteúdo irregular"],
    trend: "down",
    trendPercent: -3,
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "Candidato D",
    handle: "@candidato_d_df",
    party: "PSOL",
    followers: 15800,
    avgLikes: 200,
    avgComments: 35,
    engagementRate: 1.49,
    postsPerWeek: 6,
    mainTheme: "Meio Ambiente e Justiça Social",
    strengths: ["Maior base do segmento", "Conteúdo viral", "Forte presença digital"],
    weaknesses: ["Super exposição", "Conteúdo polarizante", "Fadiga do público"],
    trend: "up",
    trendPercent: 12,
    color: "#a855f7",
  },
  {
    id: 5,
    name: "Candidato E",
    handle: "@candidato_e_df",
    party: "REDE",
    followers: 3200,
    avgLikes: 35,
    avgComments: 5,
    engagementRate: 1.25,
    postsPerWeek: 2,
    mainTheme: "Sustentabilidade",
    strengths: ["Nicho bem definido", "Conteúdo autêntico", "Público fiel"],
    weaknesses: ["Base pequena", "Pouca frequência", "Sem investimento em ads"],
    trend: "stable",
    trendPercent: 1,
    color: "#06b6d4",
  },
];

export const COMPARISON_METRICS: CompetitorMetric[] = [
  { label: "Seguidores", eduardo: 1518, competitors: [12500, 8200, 5400, 15800, 3200], unit: "" },
  { label: "Curtidas/Post", eduardo: 47.5, competitors: [85, 120, 45, 200, 35], unit: "" },
  { label: "Comentários/Post", eduardo: 6.7, competitors: [12, 25, 8, 35, 5], unit: "" },
  { label: "Engajamento %", eduardo: 3.1, competitors: [0.78, 1.77, 0.98, 1.49, 1.25], unit: "%" },
  { label: "Posts/Semana", eduardo: 2.3, competitors: [5, 4, 3, 6, 2], unit: "" },
];

export const OPPORTUNITIES = [
  {
    title: "Maior taxa de engajamento do segmento",
    description: "Com 3.1%, Eduardo tem o MAIOR engajamento entre todos os candidatos analisados. Isso indica uma base altamente engajada e receptiva.",
    impact: "alto",
    action: "Manter qualidade do conteúdo e aumentar frequência gradualmente para ampliar alcance sem perder engajamento.",
  },
  {
    title: "Nicho ambiental pouco disputado",
    description: "Apenas o Candidato E (REDE) compete diretamente no nicho ambiental, mas com base menor e menos frequência.",
    impact: "alto",
    action: "Consolidar posição como referência ambiental no DF antes que outros candidatos ocupem esse espaço.",
  },
  {
    title: "Potencial de crescimento via parcerias",
    description: "Candidatos com bases maiores (A e D) têm engajamento baixo. Parcerias estratégicas podem capturar seguidores insatisfeitos.",
    impact: "medio",
    action: "Propor lives e colaborações com perfis complementares para atrair público novo.",
  },
  {
    title: "Conteúdo técnico como diferencial",
    description: "Nenhum concorrente combina conteúdo técnico ambiental com storytelling emocional como Eduardo.",
    impact: "alto",
    action: "Criar série de conteúdo educativo que demonstre expertise e gere compartilhamentos.",
  },
  {
    title: "Investimento em ads pode acelerar crescimento",
    description: "Com o melhor engajamento orgânico, ads terão ROI superior ao dos concorrentes.",
    impact: "medio",
    action: "Iniciar com R$ 2.500/mês focando em alcance e seguidores na região do DF.",
  },
];
