// ============================================================
// DESIGN: Command Center Militar Verde
// Banco de Conteúdo - Repositório de materiais da pré campanha
// Brasília Cidade Parque - Templates, legendas e diretrizes
// ============================================================

export type ContentCategory = "template" | "legenda" | "hashtag" | "visual" | "story" | "cta";
export type ContentPillar = "causa" | "explicacao" | "humano" | "mobilizacao" | "geral";
export type ContentFormat = "reel" | "carrossel" | "video" | "story" | "todos";
export type ContentStatus = "pronto" | "rascunho" | "aprovado" | "usado";

export interface ContentItem {
  id: string;
  category: ContentCategory;
  pillar: ContentPillar;
  format: ContentFormat;
  status: ContentStatus;
  title: string;
  description: string;
  content: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  lastUsed?: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  pillar: ContentPillar;
  format: ContentFormat;
  structure: string[];
  captionTemplate: string;
  visualGuide: string;
  bestPractices: string[];
  exampleCaption: string;
}

export interface HashtagSet {
  id: string;
  name: string;
  pillar: ContentPillar;
  hashtags: string[];
  reach: string;
  usage: string;
}

export interface VisualGuide {
  id: string;
  name: string;
  format: ContentFormat;
  specs: { label: string; value: string }[];
  tips: string[];
  colorPalette: { name: string; hex: string }[];
}

export interface StoryTemplate {
  id: string;
  name: string;
  type: "enquete" | "quiz" | "countdown" | "bastidores" | "depoimento" | "repost";
  description: string;
  structure: string;
  frequency: string;
  engagementTip: string;
}

export interface CTABank {
  id: string;
  text: string;
  type: "engajamento" | "compartilhamento" | "salvamento" | "seguir" | "acao";
  pillar: ContentPillar;
  effectiveness: "alto" | "medio" | "baixo";
}

// ============================================================
// TEMPLATES DE CONTEÚDO
// ============================================================
export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: "tpl-reel-causa",
    name: "Reel de Denúncia Construtiva",
    pillar: "causa",
    format: "reel",
    structure: [
      "Hook visual impactante (0-3s)",
      "Apresentação do problema (3-15s)",
      "Dados/estatísticas (15-25s)",
      "Solução proposta (25-40s)",
      "Eduardo no local + CTA (40-60s)",
    ],
    captionTemplate: "[Estatística chocante] 😔\n\n[Descrição do problema em 2-3 linhas]\n\nMas isso pode mudar.\n\n[Solução proposta em 2-3 linhas]\n\nBrasília Cidade Parque é sobre [conexão com o tema].\n\n[CTA com emoji]",
    visualGuide: "Começar com imagem aérea ou close do problema. Transições rápidas. Texto overlay com dados em destaque. Eduardo aparece no terço final. Cores predominantes: verde-escuro e dourado.",
    bestPractices: [
      "Sempre começar com dado impactante nos primeiros 3 segundos",
      "Usar split-screen para antes/depois quando possível",
      "Eduardo deve aparecer no local real do problema",
      "Trilha sonora emotiva mas não dramática demais",
      "Manter entre 45-60 segundos para melhor retenção",
    ],
    exampleCaption: "Você sabia que Brasília perdeu 42% das suas áreas verdes nos últimos 20 anos? 🌳\n\nEnquanto a cidade cresce, nossos parques e praças ficam para trás.\n\nMas isso pode mudar. Eu acredito numa Brasília Cidade Parque.\n\nComente: qual parque de Brasília você mais ama? 💚",
  },
  {
    id: "tpl-carrossel-explicacao",
    name: "Carrossel Educativo/Infográfico",
    pillar: "explicacao",
    format: "carrossel",
    structure: [
      "Slide 1: Título impactante + gancho visual",
      "Slides 2-5: Um ponto por slide (ícone + foto + texto curto)",
      "Slide 6: Resumo visual / infográfico",
      "Slide 7: CTA + foto de Eduardo",
    ],
    captionTemplate: "[Título do tema] 📊\n\n[Introdução contextual em 2 linhas]\n\nNeste carrossel, explico [tema]:\n\n[Lista com emojis dos pontos]\n\nDeslize para conhecer cada um →\n\n[CTA de salvamento]",
    visualGuide: "Design limpo com fundo escuro (verde-escuro). Um ponto por slide com ícone grande, foto real e texto curto. Identidade visual consistente. Último slide com foto de Eduardo e CTA claro.",
    bestPractices: [
      "Máximo 7 slides para manter atenção",
      "Cada slide deve ter NO MÁXIMO 30 palavras",
      "Usar ícones consistentes em todos os slides",
      "Primeiro slide deve gerar curiosidade para deslizar",
      "Incluir CTA de salvamento na legenda",
    ],
    exampleCaption: "Brasília Cidade Parque não é só um slogan. É um plano real. 📋\n\n🌳 Revitalização de parques\n🏗️ Novos espaços verdes\n👨‍👩‍👧‍👦 Áreas de lazer\n🚴 Ciclovias conectando parques\n💧 Sustentabilidade hídrica\n\nDeslize para conhecer cada pilar →\n\nSalve para consultar depois 💚",
  },
  {
    id: "tpl-video-humano",
    name: "Vídeo Humanizado / Bastidores",
    pillar: "humano",
    format: "video",
    structure: [
      "Abertura casual e natural (0-5s)",
      "Contexto pessoal / momento (5-20s)",
      "Conexão com a causa (20-40s)",
      "Reflexão emocional (40-55s)",
      "Convite ao público (55-90s)",
    ],
    captionTemplate: "[Contexto do momento] 🌿\n\n[Descrição pessoal em 2-3 linhas]\n\n[Reflexão sobre por que isso importa]\n\nBrasília Cidade Parque é sobre [conexão emocional].\n\n[Pergunta para o público]",
    visualGuide: "Filmagem casual com celular. Luz natural. Sem roteiro rígido — naturalidade é a chave. Tons quentes. Eduardo em ambiente real (parque, casa, rua). Música suave de fundo ou sem música.",
    bestPractices: [
      "NÃO parecer ensaiado — autenticidade é tudo",
      "Filmar com celular para sensação de proximidade",
      "Mostrar família, amigos, comunidade",
      "Evitar falar de política diretamente",
      "Focar em emoção e conexão humana",
    ],
    exampleCaption: "Sábado é dia de parque! 🌿\n\nHoje trouxe a família para o Parque da Cidade. É aqui que eu recarrego as energias.\n\nCada criança merece ter um parque perto de casa.\n\nE você, onde está curtindo esse sábado?",
  },
  {
    id: "tpl-reel-mobilizacao",
    name: "Reel de Mobilização / Convite",
    pillar: "mobilizacao",
    format: "reel",
    structure: [
      "Chamada energética (0-5s)",
      "Apresentação do evento/ação (5-20s)",
      "Detalhes práticos (20-35s)",
      "Motivação / por quê participar (35-50s)",
      "CTA forte com data/local (50-60s)",
    ],
    captionTemplate: "Chega de reclamar. É hora de AGIR! 💪🌿\n\n[Descrição do evento/ação]\n\n📅 [Data]\n📍 [Local]\n⏰ [Horário]\n\n[O que trazer / como participar]\n\nBrasília Cidade Parque começa com cada um de nós.\n\n[CTA de engajamento nos comentários]",
    visualGuide: "Energia alta. Eduardo convidando com entusiasmo. Mostrar o local. Texto com data/local em destaque. Música motivacional. Intercalar com imagens de ações anteriores se houver.",
    bestPractices: [
      "CTA 'EU VOU' gera alto engajamento nos comentários",
      "Sempre incluir data, local e horário visíveis",
      "Mostrar que é fácil participar (remover barreiras)",
      "Usar countdown nos stories durante a semana",
      "Preparar evento real — não pode ser só digital",
    ],
    exampleCaption: "Chega de reclamar. É hora de AGIR! 💪🌿\n\nMutirão Verde no Parque Águas Claras!\n\n📅 Sábado, 25 de Abril\n📍 Parque Águas Claras\n⏰ 8h às 12h\n\nTraga luvas, disposição e um amigo!\n\nComente 'EU VOU' se quer participar! 🙋‍♂️",
  },
  {
    id: "tpl-carrossel-resultados",
    name: "Carrossel de Resultados / Prestação de Contas",
    pillar: "geral",
    format: "carrossel",
    structure: [
      "Slide 1: Título 'Resultados do Mês/Semana'",
      "Slides 2-4: Métricas com números grandes e ícones",
      "Slide 5: Destaques visuais (fotos de ações)",
      "Slide 6: Próximos passos + CTA",
    ],
    captionTemplate: "Nosso [período] em números! 📊\n\n[Lista de métricas com emojis]\n\nCada número representa uma pessoa que acredita numa Brasília melhor.\n\n[Prévia do próximo período] 🚀\n\n[CTA de notificação]",
    visualGuide: "Infográfico elegante. Números grandes em destaque. Ícones e gráficos simples. Fotos reais das ações. Design consistente com identidade da pré campanha.",
    bestPractices: [
      "Usar números reais e verificáveis",
      "Comparar com período anterior quando possível",
      "Incluir fotos reais das ações realizadas",
      "Tom de gratidão e transparência",
      "Sempre terminar com prévia do próximo período",
    ],
    exampleCaption: "Abril em números! 📊\n\n📈 +587 novos seguidores\n🌳 30 mudas plantadas\n👥 50+ voluntários\n📍 12 parques mapeados\n\nCada número é uma pessoa que acredita.\n\nMaio vem com mais força! 🚀",
  },
];

// ============================================================
// CONJUNTOS DE HASHTAGS
// ============================================================
export const HASHTAG_SETS: HashtagSet[] = [
  {
    id: "hs-principal",
    name: "Hashtags Principais (Usar Sempre)",
    pillar: "geral",
    hashtags: ["#BrasíliaCidadeParque", "#EduardoBrandão", "#Brasília", "#DF"],
    reach: "Alcance base da marca",
    usage: "Obrigatório em TODOS os posts",
  },
  {
    id: "hs-causa",
    name: "Hashtags de Causa Ambiental",
    pillar: "causa",
    hashtags: ["#MaisVerde", "#MeioAmbiente", "#ParquesDeBrasília", "#CuidaDeBrasília", "#ÁreasVerdes", "#Sustentabilidade"],
    reach: "Alto alcance orgânico",
    usage: "Posts de denúncia e causa ambiental",
  },
  {
    id: "hs-mobilizacao",
    name: "Hashtags de Mobilização",
    pillar: "mobilizacao",
    hashtags: ["#MutirãoVerde", "#AçãoComunitária", "#VoluntáriosBSB", "#JuntosPorBrasília", "#FaçaParte"],
    reach: "Engajamento comunitário",
    usage: "Posts de eventos e ações coletivas",
  },
  {
    id: "hs-humano",
    name: "Hashtags de Conexão Humana",
    pillar: "humano",
    hashtags: ["#HistóriasReais", "#GenteQueFaz", "#FamíliaBrandão", "#QualidadeDeVida", "#VidaAoArLivre"],
    reach: "Conexão emocional",
    usage: "Posts pessoais e depoimentos",
  },
  {
    id: "hs-explicacao",
    name: "Hashtags Educativas",
    pillar: "explicacao",
    hashtags: ["#Urbanismo", "#PlanejamentoUrbano", "#Transparência", "#DadosReais", "#InfográficoBSB"],
    reach: "Público qualificado",
    usage: "Posts informativos e infográficos",
  },
  {
    id: "hs-trending",
    name: "Hashtags de Tendência (Rotativas)",
    pillar: "geral",
    hashtags: ["#Brasília2026", "#FuturoDeBrasília", "#CidadeInteligente", "#MobilidadeVerde", "#ClimaUrbano"],
    reach: "Alcance expandido",
    usage: "Alternar conforme tendências do momento",
  },
];

// ============================================================
// GUIAS VISUAIS POR FORMATO
// ============================================================
export const VISUAL_GUIDES: VisualGuide[] = [
  {
    id: "vg-reel",
    name: "Guia Visual — Reels",
    format: "reel",
    specs: [
      { label: "Resolução", value: "1080 x 1920px (9:16)" },
      { label: "Duração ideal", value: "45-60 segundos" },
      { label: "Formato", value: "MP4 / MOV" },
      { label: "Legendas", value: "Sempre com legendas embutidas" },
      { label: "Música", value: "Trending audio ou original" },
      { label: "Thumbnail", value: "Frame customizado com texto" },
    ],
    tips: [
      "Hook nos primeiros 3 segundos é obrigatório",
      "Usar texto overlay para pontos-chave",
      "Transições rápidas mantêm atenção",
      "Eduardo deve aparecer no vídeo",
      "Sempre incluir legendas (acessibilidade)",
    ],
    colorPalette: [
      { name: "Verde Floresta", hex: "#2d6a4f" },
      { name: "Verde Médio", hex: "#40916c" },
      { name: "Dourado", hex: "#c9a84c" },
      { name: "Branco", hex: "#f8f9fa" },
      { name: "Preto Suave", hex: "#1a1a2e" },
    ],
  },
  {
    id: "vg-carrossel",
    name: "Guia Visual — Carrosséis",
    format: "carrossel",
    specs: [
      { label: "Resolução", value: "1080 x 1350px (4:5)" },
      { label: "Slides", value: "5-7 slides (ideal)" },
      { label: "Formato", value: "PNG / JPG" },
      { label: "Texto por slide", value: "Máx. 30 palavras" },
      { label: "Fonte título", value: "Space Grotesk Bold" },
      { label: "Fonte corpo", value: "Inter Regular" },
    ],
    tips: [
      "Primeiro slide deve gerar curiosidade",
      "Um conceito por slide — não sobrecarregar",
      "Manter identidade visual em todos os slides",
      "Usar setas visuais para incentivar deslizar",
      "Último slide sempre com CTA claro",
    ],
    colorPalette: [
      { name: "Fundo Escuro", hex: "#0f1a15" },
      { name: "Verde Primário", hex: "#2d6a4f" },
      { name: "Destaque", hex: "#c9a84c" },
      { name: "Texto Claro", hex: "#e8e8e8" },
      { name: "Acento", hex: "#e76f51" },
    ],
  },
  {
    id: "vg-video",
    name: "Guia Visual — Vídeos Longos",
    format: "video",
    specs: [
      { label: "Resolução", value: "1080 x 1920px ou 1920 x 1080px" },
      { label: "Duração ideal", value: "60-90 segundos" },
      { label: "Formato", value: "MP4 / MOV" },
      { label: "Iluminação", value: "Luz natural preferível" },
      { label: "Áudio", value: "Microfone lapela recomendado" },
      { label: "Edição", value: "Cortes dinâmicos, sem pausas longas" },
    ],
    tips: [
      "Filmar em locais reais (parques, ruas, comunidades)",
      "Usar luz natural sempre que possível",
      "Microfone lapela para áudio limpo",
      "Intercalar fala com imagens de cobertura (B-roll)",
      "Manter tom conversacional, não discurso",
    ],
    colorPalette: [
      { name: "Natural", hex: "#4a7c59" },
      { name: "Quente", hex: "#d4a574" },
      { name: "Céu", hex: "#87ceeb" },
      { name: "Terra", hex: "#8b7355" },
      { name: "Verde Vivo", hex: "#52b788" },
    ],
  },
  {
    id: "vg-story",
    name: "Guia Visual — Stories",
    format: "story",
    specs: [
      { label: "Resolução", value: "1080 x 1920px (9:16)" },
      { label: "Duração", value: "15 segundos por story" },
      { label: "Máx. por dia", value: "5-8 stories" },
      { label: "Stickers", value: "Enquete, Quiz, Countdown" },
      { label: "Fonte", value: "Nativa do Instagram" },
      { label: "Frequência", value: "Diário (dias de post)" },
    ],
    tips: [
      "Usar stickers interativos em pelo menos 50% dos stories",
      "Não ultrapassar 10 stories por dia",
      "Intercalar conteúdo produzido com casual",
      "Usar countdown para eventos e posts importantes",
      "Repostar conteúdo do feed com comentário adicional",
    ],
    colorPalette: [
      { name: "Verde Brand", hex: "#2d6a4f" },
      { name: "Dourado", hex: "#c9a84c" },
      { name: "Branco", hex: "#ffffff" },
      { name: "Preto", hex: "#000000" },
      { name: "Destaque", hex: "#e76f51" },
    ],
  },
];

// ============================================================
// TEMPLATES DE STORIES
// ============================================================
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: "st-enquete",
    name: "Enquete de Opinião",
    type: "enquete",
    description: "Perguntar a opinião do público sobre temas relevantes",
    structure: "Foto/vídeo de fundo + Sticker de enquete com 2 opções claras",
    frequency: "2-3x por semana",
    engagementTip: "Perguntas binárias simples geram mais votos. Ex: 'Brasília precisa de mais parques? SIM / COM CERTEZA'",
  },
  {
    id: "st-quiz",
    name: "Quiz Educativo",
    type: "quiz",
    description: "Testar conhecimento do público sobre Brasília e meio ambiente",
    structure: "Imagem temática + Sticker de quiz com 4 opções",
    frequency: "1x por semana",
    engagementTip: "Usar dados curiosos que surpreendam. A resposta errada mais votada revela oportunidade de conteúdo educativo.",
  },
  {
    id: "st-countdown",
    name: "Countdown para Evento",
    type: "countdown",
    description: "Criar expectativa para eventos e posts importantes",
    structure: "Imagem do evento + Sticker countdown com data/hora",
    frequency: "3-5 dias antes de cada evento",
    engagementTip: "Quem ativa o lembrete recebe notificação — aumenta alcance do post do evento.",
  },
  {
    id: "st-bastidores",
    name: "Bastidores da Pré campanha",
    type: "bastidores",
    description: "Mostrar o dia a dia da equipe e produção de conteúdo",
    structure: "Vídeo casual filmado com celular, sem edição pesada",
    frequency: "2x por semana",
    engagementTip: "Conteúdo 'imperfeito' gera mais conexão. Mostrar erros de gravação, preparação, equipe trabalhando.",
  },
  {
    id: "st-depoimento",
    name: "Depoimento Rápido",
    type: "depoimento",
    description: "Capturar depoimentos curtos de moradores e apoiadores",
    structure: "Vídeo vertical de 15s com pessoa falando diretamente para câmera",
    frequency: "1-2x por semana",
    engagementTip: "Pessoas reais geram mais confiança que conteúdo produzido. Pedir autorização de imagem.",
  },
  {
    id: "st-repost",
    name: "Repost com Comentário",
    type: "repost",
    description: "Compartilhar post do feed com comentário adicional nos stories",
    structure: "Screenshot/repost do feed + texto adicional com insight extra",
    frequency: "Sempre que publicar no feed",
    engagementTip: "Adicionar um dado extra ou bastidor que não está na legenda do post. Gera cliques no feed.",
  },
];

// ============================================================
// BANCO DE CTAs
// ============================================================
export const CTA_BANK: CTABank[] = [
  // Engajamento
  { id: "cta-1", text: "Comente: qual parque de Brasília você mais ama? 💚", type: "engajamento", pillar: "causa", effectiveness: "alto" },
  { id: "cta-2", text: "Marque alguém que precisa ver isso 👇", type: "engajamento", pillar: "geral", effectiveness: "alto" },
  { id: "cta-3", text: "Você concorda? Conta nos comentários!", type: "engajamento", pillar: "geral", effectiveness: "medio" },
  { id: "cta-4", text: "Qual desses problemas mais te incomoda? Comente o número!", type: "engajamento", pillar: "causa", effectiveness: "alto" },
  { id: "cta-5", text: "Comente 'EU VOU' se quer participar! 🙋‍♂️", type: "engajamento", pillar: "mobilizacao", effectiveness: "alto" },
  // Compartilhamento
  { id: "cta-6", text: "Compartilhe para que mais pessoas vejam a realidade 📢", type: "compartilhamento", pillar: "causa", effectiveness: "alto" },
  { id: "cta-7", text: "Compartilhe com quem ama Brasília 💚", type: "compartilhamento", pillar: "geral", effectiveness: "medio" },
  { id: "cta-8", text: "Compartilhe para inspirar mais pessoas a agir! 🔄", type: "compartilhamento", pillar: "mobilizacao", effectiveness: "alto" },
  // Salvamento
  { id: "cta-9", text: "Salve este post para consultar depois 📌", type: "salvamento", pillar: "explicacao", effectiveness: "alto" },
  { id: "cta-10", text: "Salve e compartilhe com moradores da sua região 📍", type: "salvamento", pillar: "causa", effectiveness: "alto" },
  // Seguir
  { id: "cta-11", text: "Siga o perfil para acompanhar essa jornada! 🔔", type: "seguir", pillar: "geral", effectiveness: "medio" },
  { id: "cta-12", text: "Ative as notificações para não perder nada! 🔔", type: "seguir", pillar: "geral", effectiveness: "medio" },
  // Ação
  { id: "cta-13", text: "Marque 3 amigos que vão com você! 👥", type: "acao", pillar: "mobilizacao", effectiveness: "alto" },
  { id: "cta-14", text: "Envie para o grupo do bairro! 📱", type: "acao", pillar: "mobilizacao", effectiveness: "alto" },
  { id: "cta-15", text: "Comente o nome do seu bairro para mapearmos juntos 📍", type: "acao", pillar: "causa", effectiveness: "alto" },
];

// ============================================================
// LEGENDAS PRONTAS (BANCO DE TEXTOS)
// ============================================================
export const CAPTION_BANK: ContentItem[] = [
  {
    id: "cap-1",
    category: "legenda",
    pillar: "causa",
    format: "reel",
    status: "pronto",
    title: "Denúncia de Parque Abandonado",
    description: "Legenda para reel mostrando estado precário de um parque",
    content: "Isso é o [NOME DO PARQUE] HOJE. 😔\n\n[Descrição dos problemas encontrados]\n\nMas eu não vou esquecer. Já mapeei [X] pontos que precisam de atenção urgente.\n\nBrasília Cidade Parque começa com cuidar do que já temos.\n\nVocê já visitou esse parque recentemente? Conta nos comentários.",
    tags: ["denúncia", "parque", "antes-depois", "causa"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
  {
    id: "cap-2",
    category: "legenda",
    pillar: "humano",
    format: "video",
    status: "pronto",
    title: "Momento em Família no Parque",
    description: "Legenda para vídeo casual com família em parque",
    content: "[Dia da semana] é dia de parque! 🌿\n\nHoje trouxe a família para o [NOME DO PARQUE]. É aqui que eu recarrego as energias e lembro por que luto por mais espaços como esse.\n\nCada criança merece ter um parque perto de casa. Cada família merece um fim de semana ao ar livre.\n\nBrasília Cidade Parque é sobre isso: qualidade de vida para todos.\n\nE você, onde está curtindo esse [dia]?",
    tags: ["família", "parque", "humanização", "casual"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
  {
    id: "cap-3",
    category: "legenda",
    pillar: "mobilizacao",
    format: "reel",
    status: "pronto",
    title: "Convite para Mutirão/Evento",
    description: "Legenda para convite de ação comunitária",
    content: "Chega de reclamar. É hora de AGIR! 💪🌿\n\nEstou organizando [NOME DO EVENTO]!\n\n📅 [Data]\n📍 [Local]\n⏰ [Horário]\n\nVamos juntos [ação principal].\n\n[O que trazer/como participar]\n\nBrasília Cidade Parque começa com cada um de nós.\n\nComente 'EU VOU' se quer participar! 🙋‍♂️",
    tags: ["evento", "mutirão", "mobilização", "ação"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
  {
    id: "cap-4",
    category: "legenda",
    pillar: "explicacao",
    format: "carrossel",
    status: "pronto",
    title: "Infográfico Educativo",
    description: "Legenda para carrossel com dados e informações",
    content: "[Título do tema] 📊\n\n[Introdução contextual em 2 linhas]\n\nNeste carrossel, explico [o quê]:\n\n[Emoji 1] [Ponto 1]\n[Emoji 2] [Ponto 2]\n[Emoji 3] [Ponto 3]\n[Emoji 4] [Ponto 4]\n[Emoji 5] [Ponto 5]\n\nDeslize para conhecer cada um →\n\nSalve para consultar depois e compartilhe com quem ama Brasília 💚",
    tags: ["educativo", "infográfico", "dados", "explicação"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
  {
    id: "cap-5",
    category: "legenda",
    pillar: "causa",
    format: "reel",
    status: "pronto",
    title: "Estatística Chocante",
    description: "Legenda para reel com dado impactante",
    content: "Você sabia que [ESTATÍSTICA IMPACTANTE]? 😱\n\n[Contextualização do dado em 2-3 linhas]\n\nIsso não é aceitável. E eu vou mostrar por quê.\n\n[Solução ou proposta em 2 linhas]\n\nBrasília merece mais. Brasília merece ser uma Cidade Parque.\n\n[CTA de compartilhamento]",
    tags: ["estatística", "dados", "impacto", "viral"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
  {
    id: "cap-6",
    category: "legenda",
    pillar: "humano",
    format: "video",
    status: "pronto",
    title: "Depoimento de Morador",
    description: "Legenda para vídeo com depoimento emocional",
    content: "[Nome] mora há [X] anos [onde]. [Pronome] me contou que [situação].\n\n[Citação direta do depoimento]\n\n'[Frase emocional do morador]'\n\nÉ por isso que fazemos o que fazemos. Brasília Cidade Parque é sobre pessoas como [Nome].\n\nMarque alguém que precisa ouvir essa história 💛",
    tags: ["depoimento", "emocional", "morador", "história"],
    usageCount: 0,
    createdAt: "2026-04-05",
  },
];

// ============================================================
// CATEGORIAS E LABELS
// ============================================================
export const CATEGORY_LABELS: Record<ContentCategory, { label: string; color: string }> = {
  template: { label: "Templates", color: "#2d6a4f" },
  legenda: { label: "Legendas", color: "#40916c" },
  hashtag: { label: "Hashtags", color: "#52b788" },
  visual: { label: "Guias Visuais", color: "#c9a84c" },
  story: { label: "Stories", color: "#e76f51" },
  cta: { label: "CTAs", color: "#74c69d" },
};

export const PILLAR_LABELS: Record<ContentPillar, { label: string; color: string }> = {
  causa: { label: "Causa", color: "#2d6a4f" },
  explicacao: { label: "Explicação", color: "#40916c" },
  humano: { label: "Humano", color: "#c9a84c" },
  mobilizacao: { label: "Mobilização", color: "#e76f51" },
  geral: { label: "Geral", color: "#74c69d" },
};

export const STATUS_LABELS: Record<ContentStatus, { label: string; color: string }> = {
  pronto: { label: "Pronto", color: "#52b788" },
  rascunho: { label: "Rascunho", color: "#c9a84c" },
  aprovado: { label: "Aprovado", color: "#2d6a4f" },
  usado: { label: "Usado", color: "#6c757d" },
};
