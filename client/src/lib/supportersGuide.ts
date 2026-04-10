// ============================================================
// GUIA DE APOIADORES - BRASÍLIA CIDADE PARQUE
// Estratégias de ações para voluntários amplificarem a pré campanha
// ============================================================

export interface ActionStep {
  order: number;
  action: string;
  detail: string;
  timeEstimate: string;
  impact: "baixo" | "médio" | "alto" | "muito alto";
}

export interface EngagementRule {
  title: string;
  icon: string;
  description: string;
  doList: string[];
  dontList: string[];
}

export interface MissionCard {
  id: string;
  title: string;
  category: "diária" | "semanal" | "mensal" | "especial";
  description: string;
  steps: string[];
  impactLevel: "baixo" | "médio" | "alto" | "muito alto";
  timeRequired: string;
  xpPoints: number;
  badge?: string;
}

export interface SupporterLevel {
  level: number;
  name: string;
  minXP: number;
  badge: string;
  color: string;
  perks: string[];
}

export interface QuickAction {
  title: string;
  description: string;
  steps: ActionStep[];
  totalTime: string;
  expectedImpact: string;
}

// ============================================================
// PROTOCOLO DE ENGAJAMENTO - O QUE FAZER QUANDO UM POST SAI
// ============================================================
export const ENGAGEMENT_PROTOCOL: ActionStep[] = [
  {
    order: 1,
    action: "Curta imediatamente",
    detail: "Assim que o post for publicado, curta nos primeiros 5 minutos. O algoritmo do Instagram prioriza posts com engajamento rápido.",
    timeEstimate: "10 segundos",
    impact: "alto",
  },
  {
    order: 2,
    action: "Comente com relevância",
    detail: "Escreva um comentário genuíno com mais de 4 palavras. Evite emojis soltos. Use perguntas ou compartilhe experiências pessoais relacionadas ao tema.",
    timeEstimate: "1 minuto",
    impact: "muito alto",
  },
  {
    order: 3,
    action: "Salve o post",
    detail: "Clique no ícone de salvar. Posts salvos são um dos sinais mais fortes para o algoritmo do Instagram.",
    timeEstimate: "5 segundos",
    impact: "muito alto",
  },
  {
    order: 4,
    action: "Compartilhe nos Stories",
    detail: "Reposte o post nos seus Stories adicionando sua opinião pessoal, um sticker de enquete ou uma pergunta. Stories com interação geram mais alcance.",
    timeEstimate: "2 minutos",
    impact: "muito alto",
  },
  {
    order: 5,
    action: "Envie para 3 pessoas",
    detail: "Envie o post via DM para pelo menos 3 pessoas que possam se interessar pelo tema. Compartilhamentos via DM são o sinal mais forte do algoritmo.",
    timeEstimate: "2 minutos",
    impact: "muito alto",
  },
  {
    order: 6,
    action: "Responda outros comentários",
    detail: "Volte ao post após 30 minutos e responda comentários de outras pessoas, gerando conversação. Isso mantém o post ativo no feed.",
    timeEstimate: "3 minutos",
    impact: "alto",
  },
  {
    order: 7,
    action: "Compartilhe em grupos de WhatsApp",
    detail: "Copie o link do post e compartilhe em grupos relevantes do WhatsApp com uma mensagem contextualizada. Não envie o link solto.",
    timeEstimate: "2 minutos",
    impact: "alto",
  },
];

// ============================================================
// REGRAS DE ENGAJAMENTO
// ============================================================
export const ENGAGEMENT_RULES: EngagementRule[] = [
  {
    title: "Autenticidade Acima de Tudo",
    icon: "heart",
    description: "Seus comentários e interações devem ser genuínos. O algoritmo e as pessoas detectam engajamento artificial.",
    doList: [
      "Escreva comentários pessoais e relevantes",
      "Compartilhe experiências próprias relacionadas ao tema",
      "Use sua voz autêntica — não copie textos prontos",
      "Varie seus comentários entre os posts",
    ],
    dontList: [
      "Não use comentários genéricos como 'Muito bom!' ou só emojis",
      "Não copie e cole o mesmo comentário em vários posts",
      "Não crie contas falsas para engajar",
      "Não use bots ou ferramentas de automação",
    ],
  },
  {
    title: "Timing é Fundamental",
    icon: "clock",
    description: "Os primeiros 30 minutos após a publicação são cruciais. O algoritmo avalia o engajamento inicial para decidir o alcance.",
    doList: [
      "Ative as notificações do perfil @eduardobrandaopv",
      "Engaje nos primeiros 5 minutos após a publicação",
      "Mantenha o celular por perto nos horários de publicação (10h, 12h, 18h)",
      "Se não conseguir nos primeiros minutos, engaje até 1 hora depois",
    ],
    dontList: [
      "Não espere horas para interagir com o post",
      "Não engaje todos de uma vez — distribua ao longo do dia",
      "Não ignore posts porque 'já tem muitos comentários'",
      "Não desative as notificações do perfil",
    ],
  },
  {
    title: "Compartilhamento Estratégico",
    icon: "share",
    description: "Compartilhar é o ato mais poderoso. Um compartilhamento vale mais que 10 curtidas para o algoritmo.",
    doList: [
      "Reposte nos Stories com opinião pessoal",
      "Envie via DM para pessoas que se interessam pelo tema",
      "Compartilhe em grupos de WhatsApp contextualizando",
      "Poste no Facebook, Twitter e LinkedIn quando relevante",
    ],
    dontList: [
      "Não compartilhe sem contexto — sempre adicione sua visão",
      "Não faça spam em grupos — seja seletivo e relevante",
      "Não compartilhe todos os posts no mesmo grupo — varie",
      "Não envie links soltos sem explicação",
    ],
  },
  {
    title: "Conversação Ativa",
    icon: "message",
    description: "O Instagram prioriza posts que geram conversas. Quanto mais respostas a comentários, maior o alcance.",
    doList: [
      "Responda comentários de outras pessoas no post",
      "Faça perguntas nos seus comentários para gerar diálogo",
      "Marque amigos que possam se interessar pelo tema",
      "Volte ao post depois de 1-2 horas para continuar a conversa",
    ],
    dontList: [
      "Não marque pessoas que não têm interesse no tema",
      "Não faça spam de marcações — máximo 2-3 pessoas por comentário",
      "Não entre em discussões negativas ou polêmicas",
      "Não responda trolls ou provocações — ignore ou reporte",
    ],
  },
  {
    title: "Presença Multi-Plataforma",
    icon: "globe",
    description: "Amplifique o conteúdo além do Instagram. Cada plataforma tem seu público e formato ideal.",
    doList: [
      "Compartilhe Reels no TikTok e YouTube Shorts",
      "Poste carrosséis como thread no Twitter/X",
      "Compartilhe conteúdo institucional no LinkedIn",
      "Use o WhatsApp Status para repostar Stories",
    ],
    dontList: [
      "Não poste o mesmo formato em todas as plataformas",
      "Não ignore o contexto de cada rede social",
      "Não force conteúdo político em grupos não-políticos",
      "Não esqueça de adaptar a linguagem para cada plataforma",
    ],
  },
];

// ============================================================
// MISSÕES PARA APOIADORES (GAMIFICAÇÃO)
// ============================================================
export const MISSIONS: MissionCard[] = [
  // MISSÕES DIÁRIAS
  {
    id: "d1",
    title: "Guardião do Feed",
    category: "diária",
    description: "Engaje com o post do dia seguindo o protocolo completo de 7 passos.",
    steps: [
      "Curta o post nos primeiros 5 minutos",
      "Comente com mais de 4 palavras",
      "Salve o post",
      "Compartilhe nos Stories com opinião",
      "Envie para 3 pessoas via DM",
      "Responda 2 comentários de outras pessoas",
      "Compartilhe em 1 grupo de WhatsApp",
    ],
    impactLevel: "muito alto",
    timeRequired: "15 minutos",
    xpPoints: 50,
    badge: "🛡️",
  },
  {
    id: "d2",
    title: "Sentinela de Stories",
    category: "diária",
    description: "Interaja com todos os Stories do perfil @eduardobrandaopv.",
    steps: [
      "Assista todos os Stories até o final",
      "Responda pelo menos 1 Story com mensagem",
      "Vote em enquetes e quizzes",
      "Compartilhe 1 Story no seu perfil",
    ],
    impactLevel: "alto",
    timeRequired: "5 minutos",
    xpPoints: 20,
    badge: "👁️",
  },
  {
    id: "d3",
    title: "Explorador de Hashtags",
    category: "diária",
    description: "Navegue pelas hashtags da pré campanha e engaje com posts relacionados.",
    steps: [
      "Pesquise #BrasíliaCidadeParque no Instagram",
      "Curta 5 posts recentes com a hashtag",
      "Comente em 2 posts de outros perfis sobre o tema",
      "Siga 3 perfis novos que postam sobre meio ambiente em Brasília",
    ],
    impactLevel: "médio",
    timeRequired: "10 minutos",
    xpPoints: 15,
    badge: "🔍",
  },
  // MISSÕES SEMANAIS
  {
    id: "s1",
    title: "Embaixador da Semana",
    category: "semanal",
    description: "Complete o protocolo de engajamento em todos os 3 posts da semana.",
    steps: [
      "Engaje com o post de terça-feira (protocolo completo)",
      "Engaje com o post de quinta-feira (protocolo completo)",
      "Engaje com o post de sábado (protocolo completo)",
      "Compartilhe pelo menos 1 post em cada rede social que você usa",
      "Convide 1 pessoa nova para seguir o perfil",
    ],
    impactLevel: "muito alto",
    timeRequired: "45 minutos/semana",
    xpPoints: 200,
    badge: "⭐",
  },
  {
    id: "s2",
    title: "Recrutador Verde",
    category: "semanal",
    description: "Traga novos seguidores para o perfil da pré campanha.",
    steps: [
      "Convide 5 amigos para seguir @eduardobrandaopv",
      "Compartilhe o perfil nos seus Stories com recomendação pessoal",
      "Envie o link do perfil para 3 grupos de WhatsApp",
      "Peça para 2 pessoas repostarem um conteúdo da pré campanha",
    ],
    impactLevel: "muito alto",
    timeRequired: "20 minutos",
    xpPoints: 150,
    badge: "🌱",
  },
  {
    id: "s3",
    title: "Criador de Conteúdo",
    category: "semanal",
    description: "Crie conteúdo original relacionado à pré campanha Brasília Cidade Parque.",
    steps: [
      "Tire uma foto de um parque ou área verde de Brasília",
      "Poste no seu perfil com a hashtag #BrasíliaCidadeParque",
      "Marque @eduardobrandaopv na publicação",
      "Conte uma história pessoal sobre o local",
    ],
    impactLevel: "muito alto",
    timeRequired: "30 minutos",
    xpPoints: 250,
    badge: "📸",
  },
  {
    id: "s4",
    title: "Analista de Campo",
    category: "semanal",
    description: "Documente problemas ambientais na sua região para gerar conteúdo de denúncia.",
    steps: [
      "Identifique 1 problema ambiental na sua comunidade",
      "Fotografe ou filme o problema",
      "Envie o material para a equipe da pré campanha via DM",
      "Sugira uma solução baseada no projeto Brasília Cidade Parque",
    ],
    impactLevel: "alto",
    timeRequired: "30 minutos",
    xpPoints: 180,
    badge: "📋",
  },
  // MISSÕES MENSAIS
  {
    id: "m1",
    title: "Líder Comunitário",
    category: "mensal",
    description: "Organize um encontro presencial com apoiadores na sua região.",
    steps: [
      "Escolha um parque ou praça pública para o encontro",
      "Convide pelo menos 10 pessoas da sua comunidade",
      "Apresente o projeto Brasília Cidade Parque",
      "Registre o encontro com fotos e vídeos",
      "Compartilhe nas redes sociais com as hashtags da pré campanha",
      "Envie relatório para a equipe da pré campanha",
    ],
    impactLevel: "muito alto",
    timeRequired: "3 horas",
    xpPoints: 500,
    badge: "👑",
  },
  {
    id: "m2",
    title: "Influenciador Local",
    category: "mensal",
    description: "Conecte a pré campanha com influenciadores ou líderes da sua região.",
    steps: [
      "Identifique 3 influenciadores locais (micro ou nano)",
      "Entre em contato apresentando o projeto",
      "Proponha uma colaboração ou menção",
      "Acompanhe e reporte o resultado para a equipe",
    ],
    impactLevel: "muito alto",
    timeRequired: "2 horas",
    xpPoints: 400,
    badge: "🤝",
  },
  // MISSÕES ESPECIAIS
  {
    id: "e1",
    title: "Defensor Digital",
    category: "especial",
    description: "Quando surgir desinformação ou ataques, atue como defensor da pré campanha.",
    steps: [
      "Identifique o conteúdo falso ou ataque",
      "NÃO responda com agressividade — mantenha o tom respeitoso",
      "Apresente fatos e dados que contradigam a desinformação",
      "Reporte o conteúdo se violar as regras da plataforma",
      "Informe a equipe da pré campanha imediatamente",
    ],
    impactLevel: "muito alto",
    timeRequired: "15 minutos",
    xpPoints: 300,
    badge: "🛡️",
  },
  {
    id: "e2",
    title: "Mutirão Verde",
    category: "especial",
    description: "Participe de um mutirão de plantio ou limpeza organizado pela pré campanha.",
    steps: [
      "Confirme presença no evento",
      "Leve pelo menos 1 amigo que não conhece a pré campanha",
      "Registre sua participação com fotos e vídeos",
      "Poste nos Stories durante o evento em tempo real",
      "Faça um post no feed após o evento com sua experiência",
    ],
    impactLevel: "muito alto",
    timeRequired: "4 horas",
    xpPoints: 600,
    badge: "🌳",
  },
];

// ============================================================
// NÍVEIS DE APOIADOR
// ============================================================
export const SUPPORTER_LEVELS: SupporterLevel[] = [
  {
    level: 1,
    name: "Semente",
    minXP: 0,
    badge: "🌰",
    color: "#8B7355",
    perks: ["Acesso ao grupo de apoiadores", "Recebe alertas de novos posts"],
  },
  {
    level: 2,
    name: "Broto",
    minXP: 200,
    badge: "🌱",
    color: "#90EE90",
    perks: ["Acesso a conteúdo exclusivo", "Participa de enquetes de decisão"],
  },
  {
    level: 3,
    name: "Muda",
    minXP: 500,
    badge: "🌿",
    color: "#3CB371",
    perks: ["Convite para eventos presenciais", "Menção nos agradecimentos"],
  },
  {
    level: 4,
    name: "Árvore",
    minXP: 1000,
    badge: "🌳",
    color: "#228B22",
    perks: ["Acesso direto à equipe de pré campanha", "Participa de reuniões estratégicas"],
  },
  {
    level: 5,
    name: "Floresta",
    minXP: 2000,
    badge: "🏞️",
    color: "#006400",
    perks: ["Líder regional reconhecido", "Voz ativa nas decisões da pré campanha", "Destaque no site oficial"],
  },
];

// ============================================================
// AÇÕES RÁPIDAS (QUICK WINS)
// ============================================================
export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Blitz de 2 Minutos",
    description: "Ação relâmpago para quando você tem pouco tempo mas quer ajudar.",
    totalTime: "2 minutos",
    expectedImpact: "Aumenta o alcance do post em até 15%",
    steps: [
      { order: 1, action: "Curta o post", detail: "Toque duas vezes na imagem", timeEstimate: "3s", impact: "alto" },
      { order: 2, action: "Salve o post", detail: "Clique no ícone de bookmark", timeEstimate: "3s", impact: "muito alto" },
      { order: 3, action: "Comente rápido", detail: "Escreva uma frase genuína de 5+ palavras", timeEstimate: "30s", impact: "muito alto" },
      { order: 4, action: "Compartilhe nos Stories", detail: "Reposte com um sticker ou texto", timeEstimate: "45s", impact: "muito alto" },
      { order: 5, action: "Envie para 1 pessoa", detail: "Mande via DM para quem se interessa", timeEstimate: "20s", impact: "alto" },
    ],
  },
  {
    title: "Operação WhatsApp",
    description: "Amplifique o conteúdo nos grupos de WhatsApp de forma estratégica.",
    totalTime: "5 minutos",
    expectedImpact: "Gera 20-50 visitas ao perfil por compartilhamento",
    steps: [
      { order: 1, action: "Copie o link do post", detail: "Toque nos 3 pontos e copie o link", timeEstimate: "10s", impact: "baixo" },
      { order: 2, action: "Escreva uma mensagem contextualizada", detail: "Não envie link solto. Ex: 'Pessoal, olhem essa proposta incrível para os parques de Brasília!'", timeEstimate: "1min", impact: "alto" },
      { order: 3, action: "Envie para 3 grupos relevantes", detail: "Escolha grupos onde o tema faz sentido (bairro, amigos, trabalho)", timeEstimate: "1min", impact: "muito alto" },
      { order: 4, action: "Envie para 5 contatos individuais", detail: "Mensagem personalizada para cada pessoa", timeEstimate: "2min", impact: "muito alto" },
      { order: 5, action: "Poste no Status do WhatsApp", detail: "Use print do post ou reposte o Story", timeEstimate: "30s", impact: "médio" },
    ],
  },
  {
    title: "Missão Recrutamento",
    description: "Traga novos seguidores para o perfil da pré campanha.",
    totalTime: "10 minutos",
    expectedImpact: "3-5 novos seguidores por missão completada",
    steps: [
      { order: 1, action: "Abra sua lista de contatos", detail: "Vá em 'Sugerir para amigos' no Instagram", timeEstimate: "30s", impact: "baixo" },
      { order: 2, action: "Identifique 5 pessoas de Brasília", detail: "Priorize quem mora no DF ou se interessa por meio ambiente", timeEstimate: "1min", impact: "médio" },
      { order: 3, action: "Envie convite personalizado", detail: "Mande DM: 'Oi! Conhece o projeto Brasília Cidade Parque? Acho que você vai gostar. Segue lá: @eduardobrandaopv'", timeEstimate: "3min", impact: "muito alto" },
      { order: 4, action: "Compartilhe o melhor post recente", detail: "Junto com o convite, envie o post mais impactante da semana", timeEstimate: "2min", impact: "alto" },
      { order: 5, action: "Faça um Story de recomendação", detail: "Poste nos Stories: 'Sigam @eduardobrandaopv — o futuro de Brasília passa por mais áreas verdes'", timeEstimate: "2min", impact: "muito alto" },
    ],
  },
];

// ============================================================
// HORÁRIOS DE PUBLICAÇÃO (PARA APOIADORES FICAREM ATENTOS)
// ============================================================
export const POSTING_SCHEDULE = {
  days: [
    { day: "Terça-feira", time: "18:00", type: "Conteúdo de Causa", priority: "alta" },
    { day: "Quinta-feira", time: "10:00", type: "Conteúdo de Explicação", priority: "alta" },
    { day: "Sábado", time: "12:00", type: "Conteúdo Humano/Mobilização", priority: "alta" },
  ],
  alertTimes: ["15 min antes", "No momento da publicação", "30 min depois (para reengajar)"],
};

// ============================================================
// FRASES MODELO PARA COMENTÁRIOS (INSPIRAÇÃO, NÃO PARA COPIAR)
// ============================================================
export const COMMENT_INSPIRATION = [
  {
    category: "Conteúdo de Causa",
    examples: [
      "Moro perto do [local] e realmente faz falta mais verde na região. Essa proposta faz total sentido!",
      "Impressionante esses dados. Brasília merece mais atenção com suas áreas verdes. Apoio total!",
      "Já levei meus filhos para passear nesse parque e vi como está abandonado. Precisamos de ação!",
      "Como moradora de [bairro], posso confirmar que faltam espaços de lazer ao ar livre aqui.",
    ],
  },
  {
    category: "Conteúdo de Explicação",
    examples: [
      "Não sabia que funcionava assim! Muito bom ter alguém que explica de forma clara.",
      "Esse tipo de conteúdo educativo faz muita diferença. Compartilhei com minha família!",
      "Finalmente alguém que apresenta soluções concretas e não só promessas vazias.",
      "Excelente explicação! Vou compartilhar no grupo do meu condomínio.",
    ],
  },
  {
    category: "Conteúdo Humano",
    examples: [
      "Que momento lindo! É bom ver um político que realmente está presente na comunidade.",
      "Essa é a Brasília que a gente quer — pessoas conectadas com a natureza e entre si.",
      "Me emocionei com esse depoimento. Histórias reais mostram o impacto real.",
      "Parabéns pela iniciativa! Brasília precisa de mais ações como essa.",
    ],
  },
  {
    category: "Conteúdo de Mobilização",
    examples: [
      "Conta comigo! Já me inscrevi e vou levar mais 3 amigos.",
      "Vamos juntos! Brasília Cidade Parque é o futuro que queremos.",
      "Compartilhei com todo mundo que conheço. Essa causa é de todos nós!",
      "Quero participar! Como faço para me voluntariar na minha região?",
    ],
  },
];

// ============================================================
// HASHTAGS OFICIAIS DA PRÉ CAMPANHA
// ============================================================
export const CAMPAIGN_HASHTAGS = {
  obrigatorias: ["#BrasíliaCidadeParque", "#EduardoBrandão", "#Brasília2026"],
  recomendadas: ["#BrasíliaVerde", "#ParquesParaTodos", "#FuturoDeBrasília", "#MeioAmbienteBSB", "#CidadeSustentável"],
  proibidas: ["Hashtags de outros candidatos", "Hashtags polêmicas ou divisivas", "Hashtags sem relação com a pré campanha"],
};

// ============================================================
// FAQ DOS APOIADORES
// ============================================================
export const SUPPORTER_FAQ = [
  {
    question: "Preciso curtir TODOS os posts?",
    answer: "Idealmente sim, mas qualidade é mais importante que quantidade. Se puder engajar com apenas 1 post por semana, faça o protocolo completo nesse post. É melhor 1 engajamento forte do que 3 curtidas fracas.",
  },
  {
    question: "Posso usar minha conta pessoal ou preciso criar uma nova?",
    answer: "USE SUA CONTA PESSOAL. Contas novas ou falsas prejudicam o algoritmo e podem ser detectadas como spam. Sua conta real tem mais peso e credibilidade.",
  },
  {
    question: "E se alguém atacar a pré campanha nos comentários?",
    answer: "Não responda com agressividade. Apresente fatos calmamente e reporte à equipe da pré campanha. Se for ofensivo, denuncie o comentário. Nunca entre em briga online.",
  },
  {
    question: "Quanto tempo por dia preciso dedicar?",
    answer: "A Blitz de 2 Minutos já faz diferença enorme. Se puder dedicar 15 minutos por dia de publicação (terça, quinta e sábado), o impacto é transformador.",
  },
  {
    question: "Posso criar meu próprio conteúdo sobre a pré campanha?",
    answer: "SIM! Conteúdo orgânico de apoiadores é extremamente valioso. Use as hashtags oficiais, marque @eduardobrandaopv e mantenha o tom positivo e propositivo.",
  },
  {
    question: "Como sei que meu engajamento está fazendo diferença?",
    answer: "A equipe compartilha relatórios semanais no grupo de apoiadores. Você verá o crescimento de seguidores, alcance e engajamento — e saberá que faz parte disso.",
  },
  {
    question: "Posso compartilhar conteúdo da pré campanha no Facebook e Twitter?",
    answer: "Com certeza! Adapte o formato para cada plataforma. No Facebook, adicione um texto mais longo. No Twitter, seja conciso. No LinkedIn, foque no aspecto profissional/institucional.",
  },
  {
    question: "O que faço se não tiver Instagram?",
    answer: "Você pode ajudar compartilhando no WhatsApp, Facebook, Twitter ou pessoalmente. Cada plataforma e cada conversa conta. O boca-a-boca ainda é a forma mais poderosa de comunicação.",
  },
];
