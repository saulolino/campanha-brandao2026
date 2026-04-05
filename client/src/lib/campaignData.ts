// ============================================================
// DESIGN: Command Center Militar Verde
// Dados centralizados da campanha Eduardo Brandão
// Brasília Cidade Parque - Meta: 20.000 seguidores
// ============================================================

export const CAMPAIGN = {
  candidate: "Eduardo Brandão",
  handle: "@eduardobrandaopv",
  slogan: "Brasília Cidade Parque",
  role: "Deputado Distrital",
  currentFollowers: 1505,
  targetFollowers: 20000,
  startDate: "2026-04-25",
  endDate: "2026-10-31",
  totalDays: 189,
  totalWeeks: 27,
  dailyGrowth: 98,
  weeklyGrowth: 685,
  monthlyGrowth: 2946,
};

export const MONTHLY_PROJECTION = [
  { month: "Abr", label: "Abril (25-30)", growth: 587, total: 2092, investment: 1000 },
  { month: "Mai", label: "Maio", growth: 2936, total: 5028, investment: 2500 },
  { month: "Jun", label: "Junho", growth: 2936, total: 7964, investment: 2500 },
  { month: "Jul", label: "Julho", growth: 3034, total: 10997, investment: 2500 },
  { month: "Ago", label: "Agosto", growth: 3034, total: 14031, investment: 2500 },
  { month: "Set", label: "Setembro", growth: 2936, total: 16966, investment: 2500 },
  { month: "Out", label: "Outubro", growth: 3034, total: 20000, investment: 3000 },
];

export const PILLARS = [
  {
    id: 1,
    name: "Conteúdo Viral",
    description: "2-3 posts virais por mês (80+ curtidas)",
    growthMin: 600,
    growthMax: 1000,
    percentage: "20-30%",
    responsible: "Produtor de Conteúdo",
    color: "#2d6a4f",
    icon: "Zap",
  },
  {
    id: 2,
    name: "Impulsionamento Pago",
    description: "R$ 2.000-3.000/mês em ads",
    growthMin: 500,
    growthMax: 900,
    percentage: "15-25%",
    responsible: "Especialista em Ads",
    color: "#c9a84c",
    icon: "DollarSign",
  },
  {
    id: 3,
    name: "Parcerias Estratégicas",
    description: "Colaborações com influenciadores locais",
    growthMin: 1600,
    growthMax: 2000,
    percentage: "30-40%",
    responsible: "Gerente de Parcerias",
    color: "#40916c",
    icon: "Users",
  },
  {
    id: 4,
    name: "Conteúdo de Qualidade",
    description: "Média de 80+ curtidas por post",
    growthMin: 400,
    growthMax: 600,
    percentage: "10-15%",
    responsible: "Produtor de Conteúdo",
    color: "#52b788",
    icon: "Star",
  },
  {
    id: 5,
    name: "Engajamento Ativo",
    description: "Responder 100% dos comentários em 24h",
    growthMin: 300,
    growthMax: 500,
    percentage: "10-15%",
    responsible: "Community Manager",
    color: "#74c69d",
    icon: "MessageCircle",
  },
  {
    id: 6,
    name: "Compartilhamento Viral",
    description: "Incentivar compartilhamentos e tags",
    growthMin: 200,
    growthMax: 400,
    percentage: "5-10%",
    responsible: "Community Manager",
    color: "#95d5b2",
    icon: "Share2",
  },
  {
    id: 7,
    name: "Multi-Plataformas",
    description: "TikTok, YouTube Shorts, LinkedIn",
    growthMin: 1000,
    growthMax: 1800,
    percentage: "15-20%",
    responsible: "Especialista Digital",
    color: "#2c5f6e",
    icon: "Globe",
  },
  {
    id: 8,
    name: "Community Building",
    description: "Eventos presenciais e grupos",
    growthMin: 320,
    growthMax: 550,
    percentage: "10-15%",
    responsible: "Gerente de Comunidade",
    color: "#b7e4c7",
    icon: "Heart",
  },
];

export const WEEKLY_SCHEDULE = [
  { day: "SEG", content: "Planejamento", amplification: "Análise de métricas", engagement: "Resposta de comentários" },
  { day: "TER", content: "Post Viral", amplification: "Impulsionamento Pago", engagement: "Engajamento com seguidores" },
  { day: "QUA", content: "Behind-the-scenes", amplification: "Parcerias", engagement: "Stories interativos" },
  { day: "QUI", content: "Post Estratégico", amplification: "Multi-plataforma", engagement: "Resposta de comentários" },
  { day: "SEX", content: "Conteúdo Humano", amplification: "Parcerias", engagement: "Engajamento com seguidores" },
  { day: "SAB", content: "Post Mobilização", amplification: "Impulsionamento Pago", engagement: "Stories/Live" },
  { day: "DOM", content: "Análise", amplification: "Community Building", engagement: "Planejamento semana" },
];

export const KPIS = [
  { name: "Novos Seguidores", target: "2.946+/mês", icon: "UserPlus" },
  { name: "Média de Curtidas", target: "80+/post", icon: "Heart" },
  { name: "Média de Comentários", target: "15+/post", icon: "MessageCircle" },
  { name: "Taxa de Engajamento", target: "5-7%", icon: "TrendingUp" },
  { name: "Alcance Orgânico", target: "20.000+/mês", icon: "Eye" },
  { name: "Posts Virais", target: "2-3/mês", icon: "Zap" },
  { name: "Salvamentos", target: "200+/mês", icon: "Bookmark" },
  { name: "Compartilhamentos", target: "100+/mês", icon: "Share2" },
];

export const TEAM = [
  { role: "Gerente de Campanha", hours: 30, responsibilities: "Estratégia geral, coordenação, relatórios" },
  { role: "Produtor de Conteúdo", hours: 30, responsibilities: "Gravação, edição, produção de vídeos" },
  { role: "Community Manager", hours: 25, responsibilities: "Engajamento, respostas, stories, lives" },
  { role: "Especialista em Ads", hours: 20, responsibilities: "Gestão de publicidade, otimização" },
  { role: "Gerente de Parcerias", hours: 20, responsibilities: "Identificação, negociação, execução" },
  { role: "Especialista Digital", hours: 15, responsibilities: "Multi-plataformas, TikTok, YouTube" },
  { role: "Gerente de Comunidade", hours: 15, responsibilities: "Eventos presenciais, grupos" },
  { role: "Analista de Dados", hours: 15, responsibilities: "Métricas, relatórios, insights" },
];

export const BUDGET = [
  { item: "Equipe", min: 25000, max: 35000 },
  { item: "Impulsionamento de Ads", min: 2500, max: 2500 },
  { item: "Ferramentas", min: 1500, max: 1500 },
  { item: "Produção de Conteúdo", min: 2000, max: 2000 },
  { item: "Eventos Presenciais", min: 1500, max: 1500 },
  { item: "Parcerias/Influenciadores", min: 1000, max: 1000 },
  { item: "Contingência (10%)", min: 3350, max: 3350 },
];

export const DONT_DO_RULES = [
  { rule: "Publicar mais de 3 posts por dia", impact: "Engajamento cai 60%", severity: "critical" as const },
  { rule: "Publicar fora do plano de comunicação", impact: "Narrativa enfraquece", severity: "critical" as const },
  { rule: "Responder com agressividade", impact: "Crise de imagem", severity: "critical" as const },
  { rule: "Deletar críticas construtivas", impact: "Desconfiança aumenta", severity: "critical" as const },
  { rule: "Publicar sem caption estratégica", impact: "Oportunidade perdida", severity: "warning" as const },
  { rule: "Usar apenas imagens estáticas", impact: "Engajamento reduz 45%", severity: "warning" as const },
  { rule: "Publicar em horário aleatório", impact: "Visibilidade cai", severity: "warning" as const },
  { rule: "Não responder comentários em 24h", impact: "Engajamento cai 40%", severity: "warning" as const },
  { rule: "Conteúdo genérico sem propósito", impact: "Não diferencia candidato", severity: "warning" as const },
  { rule: "Mensagens contraditórias", impact: "Confiança reduz", severity: "critical" as const },
];

export const CONTENT_PILLARS = [
  { name: "Conteúdo de Causa", percentage: 40, description: "Mostrar problemas reais de Brasília", color: "#2d6a4f" },
  { name: "Conteúdo de Explicação", percentage: 25, description: "Demonstrar experiência e soluções", color: "#40916c" },
  { name: "Conteúdo Humano", percentage: 20, description: "Conexão emocional com o público", color: "#c9a84c" },
  { name: "Conteúdo de Mobilização", percentage: 15, description: "Engajamento e chamadas para ação", color: "#e76f51" },
];

export const VIRAL_TYPES = [
  { type: "Antes/Depois", description: "Transformação de espaço público", potential: "Alto", frequency: "1x/mês" },
  { type: "Pergunta Provocadora", description: "Questão de relevância pública", potential: "Muito Alto", frequency: "1x/mês" },
  { type: "Estatística Chocante", description: "Número que impressiona", potential: "Alto", frequency: "1x/mês" },
  { type: "Depoimento Emocional", description: "Histórias de transformação", potential: "Muito Alto", frequency: "1x/mês" },
  { type: "Desafio/Trend", description: "Adaptação criativa de trend", potential: "Muito Alto", frequency: "1x/mês" },
];

export const CHECKLIST_ITEMS = [
  { question: 'Está alinhado com "Brasília Cidade Parque"?', critical: true },
  { question: "Está em um dos 4 pilares de conteúdo?", critical: true },
  { question: "É vídeo ou carrossel (não imagem simples)?", critical: false },
  { question: "Tem caption estratégica com CTA?", critical: true },
  { question: "Tem qualidade visual profissional?", critical: true },
  { question: "É o horário certo (terça, quinta, sábado)?", critical: false },
  { question: "Já publicou 3 posts esta semana?", critical: false },
  { question: "Pode gerar críticas não planejadas?", critical: true },
  { question: "Está conectado com plano de comunicação?", critical: true },
];

// Dados dos posts de 2026 para referência
export const POSTS_2026 = [
  { date: "2026-03-15", type: "VIDEO", caption: "Master x BRB", likes: 85, comments: 19, reach: 717, impressions: 1504 },
  { date: "2026-03-14", type: "CAROUSEL_ALBUM", caption: "Deputado Israel Batista", likes: 107, comments: 10, reach: 573, impressions: 1051 },
  { date: "2026-03-12", type: "CAROUSEL_ALBUM", caption: "Conteúdo político", likes: 38, comments: 3, reach: 324, impressions: 578 },
  { date: "2026-03-08", type: "VIDEO", caption: "Conteúdo ambiental", likes: 19, comments: 3, reach: 327, impressions: 607 },
  { date: "2026-03-05", type: "CAROUSEL_ALBUM", caption: "Conteúdo social", likes: 26, comments: 2, reach: 230, impressions: 360 },
  { date: "2026-02-28", type: "CAROUSEL_ALBUM", caption: "Conteúdo institucional", likes: 10, comments: 0, reach: 194, impressions: 270 },
];
