// ============================================================
// DESIGN: Command Center Militar Verde
// Calendário Mensal — 81 posts planejados (Abr-Out 2026)
// ============================================================

export interface CalendarPost {
  id: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  title: string;
  pillar: "causa" | "explicacao" | "humano" | "mobilizacao";
  format: string;
  time: string;
  hasAds: boolean;
  status: "planejado" | "em_producao" | "aprovado" | "publicado";
}

export interface CalendarMonth {
  id: string;
  name: string;
  year: number;
  month: number;
  theme: string;
  postsCount: number;
  metaSeguidores: number;
  posts: CalendarPost[];
}

const PILLAR_CYCLE: Array<"causa" | "explicacao" | "humano" | "mobilizacao"> = [
  "causa", "explicacao", "humano",
  "causa", "mobilizacao", "causa",
  "explicacao", "humano", "mobilizacao",
  "causa", "explicacao", "humano",
];

function generateMonthPosts(
  month: number,
  year: number,
  startId: number,
  titles: string[]
): CalendarPost[] {
  const posts: CalendarPost[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const postDays: number[] = [];

  // Find all Tuesdays, Thursdays, Saturdays
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow === 2 || dow === 4 || dow === 6) {
      postDays.push(d);
    }
  }

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const times = ["12:00", "18:00", "10:00"];
  const formats = ["Reels (60s)", "Carrossel (7 slides)", "Vídeo (90s)"];

  postDays.forEach((day, i) => {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    const timeIdx = dow === 2 ? 0 : dow === 4 ? 1 : 2;
    const pillarIdx = i % PILLAR_CYCLE.length;

    posts.push({
      id: startId + i,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayOfWeek: dayNames[dow],
      title: titles[i] || `Post ${i + 1} - ${dayNames[dow]}`,
      pillar: PILLAR_CYCLE[pillarIdx],
      format: formats[timeIdx],
      time: times[timeIdx],
      hasAds: dow === 2 || (dow === 6 && i % 3 === 0),
      status: "planejado",
    });
  });

  return posts;
}

const APRIL_TITLES = [
  "Brasília tem 42% menos áreas verdes do que deveria",
  "O que é o projeto Brasília Cidade Parque?",
  "Um sábado no Parque da Cidade com a família",
  "Antes e depois: Praça revitalizada no Gama",
  "5 parques que Brasília precisa urgentemente",
  "Eduardo visita comunidade em Ceilândia",
  "Por que Brasília precisa de mais árvores?",
  "Depoimento: moradora conta como parque mudou sua vida",
  "Venha para o mutirão de plantio no Lago Sul",
  "Dados chocantes: orçamento de parques vs. publicidade",
  "Como funciona a compensação ambiental?",
  "Bastidores: um dia na Câmara Legislativa",
  "Junte-se ao movimento Brasília Cidade Parque",
];

const MAY_TITLES = [
  "Dia do Trabalhador: quem cuida dos parques de Brasília?",
  "Mapa: áreas verdes por região administrativa",
  "Eduardo no Parque Olhos d'Água com moradores",
  "Ranking: Brasília vs. outras capitais em áreas verdes",
  "Proposta: corredor verde conectando parques",
  "Família Brandão no Jardim Botânico",
  "Desmatamento urbano: dados alarmantes do DF",
  "Como criar um parque linear na sua cidade",
  "Convite: audiência pública sobre meio ambiente",
  "Você sabia? Brasília já foi a capital mais verde",
  "Entrevista com especialista em urbanismo verde",
  "Sábado de ação: limpeza no Parque Nacional",
  "Mobilização: assine a petição por mais parques",
];

const JUNE_TITLES = [
  "Dia do Meio Ambiente: nosso compromisso com Brasília",
  "Infográfico: benefícios dos parques para saúde",
  "Eduardo planta árvore com crianças de escola pública",
  "Comparativo: investimento em parques por gestão",
  "Projeto: parque urbano no Setor Noroeste",
  "Festa junina no parque: tradição e comunidade",
  "Crise hídrica e áreas verdes: qual a relação?",
  "Guia: como denunciar desmatamento no DF",
  "Venha para o Fórum Brasília Cidade Parque",
  "Resultado: pesquisa sobre prioridades dos brasilienses",
  "Tecnologia verde: soluções para parques inteligentes",
  "Um domingo no Parque da Cidade: vlog",
  "Chamada: voluntários para o projeto Cidade Parque",
];

const JULY_TITLES = [
  "Férias nos parques: programação gratuita para famílias",
  "Mapa interativo: todos os parques do DF",
  "Eduardo com família no Parque Nacional de Brasília",
  "Prestação de contas: o que fizemos nos últimos 3 meses",
  "Proposta: parque aquático público em Taguatinga",
  "Depoimento: comerciante conta impacto do parque",
  "Queimadas no cerrado: como combater?",
  "Educação ambiental nas escolas: proposta legislativa",
  "Evento: corrida Brasília Cidade Parque",
  "Dados: quanto cada RA investe em áreas verdes",
  "Entrevista: secretário de urbanismo sobre parques",
  "Trilha no Parque Nacional: aventura e natureza",
  "Petição: 10.000 assinaturas por mais parques",
];

const AUGUST_TITLES = [
  "Dia dos Pais: Eduardo e seu pai no parque",
  "Infográfico: evolução das áreas verdes em Brasília",
  "Visita à obra do novo parque em Samambaia",
  "Debate: candidatos e suas propostas ambientais",
  "Projeto aprovado: corredor ecológico no Lago Norte",
  "Bastidores: preparação para a campanha",
  "Seca em Brasília: importância das áreas verdes",
  "Como participar da política ambiental do DF",
  "Live: perguntas e respostas sobre Cidade Parque",
  "Resultado: 3 meses de campanha em números",
  "Parceria com universidades para pesquisa ambiental",
  "Família no parque: rotina de fim de semana",
  "Convite: grande ato por Brasília Cidade Parque",
];

const SEPTEMBER_TITLES = [
  "Dia da Árvore: plantio coletivo em 10 RAs",
  "Mapa: progresso do projeto Cidade Parque",
  "Eduardo com apoiadores no Parque da Cidade",
  "Primavera em Brasília: floração dos ipês",
  "Proposta final: plano de governo para parques",
  "Depoimento: jovem ambientalista apoia Eduardo",
  "Semana do Cerrado: biodiversidade em risco",
  "Como votar consciente para o meio ambiente",
  "Comício verde: Brasília Cidade Parque",
  "Dados finais: impacto da campanha nas redes",
  "Entrevista: por que Eduardo é o candidato verde",
  "Último sábado: grande mobilização nos parques",
  "Agradecimento: obrigado por acreditar no verde",
];

const OCTOBER_TITLES = [
  "Reta final: por que votar Eduardo Brandão",
  "Resumo: todas as propostas para Brasília",
  "Eduardo vota: dia de esperança para o DF",
  "Dia das Crianças: futuro verde para nossos filhos",
  "Prestação de contas final da campanha",
  "Mensagem pessoal: o que Brasília significa para mim",
  "Eleições: como funciona o voto para distrital",
  "Debate final: Eduardo apresenta Cidade Parque",
  "Mobilização final: cada voto conta",
  "Véspera da eleição: mensagem aos brasilienses",
  "Dia da eleição: vote pelo verde",
  "Resultado: obrigado Brasília!",
  "Próximos passos: o mandato começa agora",
];

export const CALENDAR_MONTHS: CalendarMonth[] = [
  {
    id: "abr",
    name: "Abril",
    year: 2026,
    month: 4,
    theme: "Lançamento: Brasília Merece Mais Verde",
    metaSeguidores: 2092,
    postsCount: 0,
    posts: generateMonthPosts(4, 2026, 1, APRIL_TITLES),
  },
  {
    id: "mai",
    name: "Maio",
    year: 2026,
    month: 5,
    theme: "Expansão: Conectando Comunidades ao Verde",
    metaSeguidores: 5028,
    postsCount: 0,
    posts: generateMonthPosts(5, 2026, 14, MAY_TITLES),
  },
  {
    id: "jun",
    name: "Junho",
    year: 2026,
    month: 6,
    theme: "Consolidação: Brasília Respira Verde",
    metaSeguidores: 7964,
    postsCount: 0,
    posts: generateMonthPosts(6, 2026, 27, JUNE_TITLES),
  },
  {
    id: "jul",
    name: "Julho",
    year: 2026,
    month: 7,
    theme: "Aceleração: Férias nos Parques",
    metaSeguidores: 10997,
    postsCount: 0,
    posts: generateMonthPosts(7, 2026, 40, JULY_TITLES),
  },
  {
    id: "ago",
    name: "Agosto",
    year: 2026,
    month: 8,
    theme: "Intensificação: Pré-Campanha Eleitoral",
    metaSeguidores: 14031,
    postsCount: 0,
    posts: generateMonthPosts(8, 2026, 53, AUGUST_TITLES),
  },
  {
    id: "set",
    name: "Setembro",
    year: 2026,
    month: 9,
    theme: "Mobilização: Campanha Eleitoral Oficial",
    metaSeguidores: 16966,
    postsCount: 0,
    posts: generateMonthPosts(9, 2026, 66, SEPTEMBER_TITLES),
  },
  {
    id: "out",
    name: "Outubro",
    year: 2026,
    month: 10,
    theme: "Reta Final: Eleição e Vitória",
    metaSeguidores: 20000,
    postsCount: 0,
    posts: generateMonthPosts(10, 2026, 79, OCTOBER_TITLES),
  },
];

// Update postsCount
CALENDAR_MONTHS.forEach((m) => {
  m.postsCount = m.posts.length;
});

export const PILLAR_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  causa: { bg: "#2d6a4f20", text: "#2d6a4f", label: "Causa" },
  explicacao: { bg: "#c9a84c20", text: "#c9a84c", label: "Explicação" },
  humano: { bg: "#40916c20", text: "#40916c", label: "Humano" },
  mobilizacao: { bg: "#e76f5120", text: "#e76f51", label: "Mobilização" },
};
