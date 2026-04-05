// Depoimentos de voluntários/apoiadores da campanha
// Relatos reais do impacto das ações de engajamento

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  level: string;
  levelEmoji: string;
  xp: number;
  daysActive: number;
  quote: string;
  highlight: string;
  impact: {
    label: string;
    value: string;
  };
  date: string;
  category: "engajamento" | "recrutamento" | "comunidade" | "criacao";
}

export const TESTIMONIAL_CATEGORIES = [
  { id: "todos", label: "Todos", emoji: "🌳" },
  { id: "engajamento", label: "Engajamento", emoji: "💚" },
  { id: "recrutamento", label: "Recrutamento", emoji: "🎯" },
  { id: "comunidade", label: "Comunidade", emoji: "🤝" },
  { id: "criacao", label: "Criação", emoji: "✨" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Ana Carolina",
    role: "Professora",
    location: "Asa Norte",
    avatar: "AC",
    level: "Floresta",
    levelEmoji: "🏞️",
    xp: 2450,
    daysActive: 14,
    quote: "Comecei seguindo o protocolo de 7 passos e em duas semanas já vi a diferença. Os posts do Eduardo passaram a aparecer mais no meu feed e no dos meus amigos. O mais gratificante é ver que minha participação realmente ajuda a amplificar a mensagem de Brasília Cidade Parque. Meus alunos até perguntaram sobre o projeto!",
    highlight: "Protocolo de 7 passos mudou minha forma de engajar",
    impact: { label: "Alcance gerado", value: "3.200 pessoas" },
    date: "02 Abr 2026",
    category: "engajamento",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Empresário",
    location: "Lago Sul",
    avatar: "CM",
    level: "Árvore",
    levelEmoji: "🌳",
    xp: 1820,
    daysActive: 12,
    quote: "Uso a estratégia de compartilhamento no WhatsApp Business e já trouxe mais de 40 novos seguidores para o perfil. O segredo é contextualizar o post antes de enviar nos grupos — as pessoas se interessam muito mais quando entendem o porquê. A campanha Cidade Parque faz sentido para quem vive em Brasília.",
    highlight: "40+ novos seguidores via WhatsApp Business",
    impact: { label: "Seguidores recrutados", value: "47 pessoas" },
    date: "30 Mar 2026",
    category: "recrutamento",
  },
  {
    id: 3,
    name: "Juliana Rocha",
    role: "Arquiteta",
    location: "Sudoeste",
    avatar: "JR",
    level: "Árvore",
    levelEmoji: "🌳",
    xp: 1650,
    daysActive: 10,
    quote: "Como arquiteta, o conceito de Brasília Cidade Parque me toca profundamente. Comecei a criar Stories com minha perspectiva profissional sobre os parques urbanos e a resposta foi incrível. As pessoas querem saber mais sobre como os espaços verdes transformam a qualidade de vida. Meus seguidores agora acompanham o Eduardo também.",
    highlight: "Stories com perspectiva profissional viralizaram",
    impact: { label: "Visualizações de Stories", value: "1.800 views" },
    date: "28 Mar 2026",
    category: "criacao",
  },
  {
    id: 4,
    name: "Pedro Santos",
    role: "Servidor Público",
    location: "Taguatinga",
    avatar: "PS",
    level: "Muda",
    levelEmoji: "🌿",
    xp: 890,
    daysActive: 8,
    quote: "Moro em Taguatinga e sempre achei que política era coisa distante. Mas quando vi o trabalho do Eduardo com os parques e áreas verdes, me identifiquei. Agora dedico 10 minutos por dia seguindo o protocolo e já consegui engajar meu grupo de vizinhos. A Blitz de 2 Minutos é perfeita para dias corridos.",
    highlight: "Engajou grupo de vizinhos inteiro",
    impact: { label: "Grupo mobilizado", value: "23 vizinhos" },
    date: "25 Mar 2026",
    category: "comunidade",
  },
  {
    id: 5,
    name: "Mariana Lima",
    role: "Estudante de Biologia",
    location: "Plano Piloto",
    avatar: "ML",
    level: "Muda",
    levelEmoji: "🌿",
    xp: 780,
    daysActive: 7,
    quote: "Sou estudante de biologia na UnB e o tema ambiental me atraiu para a campanha. Comecei compartilhando os posts nos grupos da faculdade e a resposta foi surpreendente. Muitos colegas não conheciam o Eduardo e agora acompanham. O sistema de missões me motiva — quero chegar ao nível Árvore até maio!",
    highlight: "Mobilizou grupos universitários da UnB",
    impact: { label: "Universitários alcançados", value: "85 pessoas" },
    date: "22 Mar 2026",
    category: "recrutamento",
  },
  {
    id: 6,
    name: "Roberto Ferreira",
    role: "Jornalista",
    location: "Águas Claras",
    avatar: "RF",
    level: "Muda",
    levelEmoji: "🌿",
    xp: 720,
    daysActive: 6,
    quote: "Como jornalista, sei o poder de uma boa narrativa. Os posts da campanha Brasília Cidade Parque contam histórias reais e isso facilita muito o compartilhamento. Quando comento nos posts, trago dados e contexto que enriquecem a discussão. Já recebi mensagens de pessoas que começaram a seguir o Eduardo por causa dos meus comentários.",
    highlight: "Comentários com contexto jornalístico geram conversas",
    impact: { label: "Conversas geradas", value: "34 threads" },
    date: "20 Mar 2026",
    category: "engajamento",
  },
  {
    id: 7,
    name: "Fernanda Alves",
    role: "Mãe e Empreendedora",
    location: "Guará",
    avatar: "FA",
    level: "Broto",
    levelEmoji: "🌱",
    xp: 450,
    daysActive: 5,
    quote: "Tenho pouco tempo livre, mas a Blitz de 2 Minutos é perfeita para mim. Faço enquanto espero meus filhos na escola. Mesmo com pouco tempo, sinto que contribuo. O mais legal é que outras mães do grupo da escola também começaram a seguir a campanha depois que compartilhei alguns posts sobre os parques infantis.",
    highlight: "Blitz de 2 Minutos ideal para rotina corrida",
    impact: { label: "Mães engajadas", value: "12 pessoas" },
    date: "18 Mar 2026",
    category: "comunidade",
  },
  {
    id: 8,
    name: "Lucas Torres",
    role: "Designer Gráfico",
    location: "Noroeste",
    avatar: "LT",
    level: "Broto",
    levelEmoji: "🌱",
    xp: 380,
    daysActive: 4,
    quote: "Comecei a criar conteúdo visual complementar para os posts — infográficos simples sobre os dados de áreas verdes em Brasília. Compartilho nos meus Stories marcando o perfil do Eduardo e a resposta tem sido muito positiva. O guia de referências visuais me ajudou a manter a identidade visual consistente.",
    highlight: "Criou infográficos complementares para a campanha",
    impact: { label: "Conteúdo criado", value: "8 infográficos" },
    date: "15 Mar 2026",
    category: "criacao",
  },
];

export const TESTIMONIALS_STATS = {
  totalTestimonials: 8,
  totalImpact: "5.200+ pessoas alcançadas",
  avgDaysActive: 8.25,
  topCategory: "Engajamento",
  growthFromTestimonials: "+89 seguidores",
  conversionRate: "34%",
};
