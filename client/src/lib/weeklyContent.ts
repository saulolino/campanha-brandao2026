// ============================================================
// DESIGN: Command Center Militar Verde
// Dados das semanas de abril 2026 com propostas de conteúdo
// Brasília Cidade Parque - Plano de Publicação Semanal
// ============================================================

export interface PostProposal {
  id: string;
  date: string;
  dayOfWeek: string;
  time: string;
  pillar: "causa" | "explicacao" | "humano" | "mobilizacao";
  pillarLabel: string;
  pillarColor: string;
  format: "VIDEO" | "CAROUSEL" | "REEL";
  formatLabel: string;
  title: string;
  caption: string;
  hashtags: string[];
  visualDescription: string;
  cta: string;
  objective: string;
  targetReach: number;
  targetLikes: number;
  targetComments: number;
  boost: boolean;
  boostBudget?: number;
  storyCompanion: string;
  notes: string;
}

export interface WeekPlan {
  id: string;
  weekNumber: number;
  label: string;
  dateRange: string;
  month: string;
  theme: string;
  themeDescription: string;
  posts: PostProposal[];
  weeklyGoal: string;
  followersTarget: number;
}

// Semana 1 de Abril (06-12 Abr) - Lançamento da Pré campanha Digital
export const APRIL_WEEKS: WeekPlan[] = [
  {
    id: "abr-s1",
    weekNumber: 1,
    label: "Semana 1",
    dateRange: "06 - 12 Abril",
    month: "Abril",
    theme: "Lançamento: Brasília Merece Mais Verde",
    themeDescription: "Semana de abertura da pré campanha digital. Foco em apresentar a visão 'Brasília Cidade Parque' e estabelecer a narrativa central com conteúdo de alto impacto.",
    weeklyGoal: "Estabelecer a narrativa central e gerar curiosidade sobre o projeto Brasília Cidade Parque",
    followersTarget: 1650,
    posts: [
      {
        id: "abr-s1-ter",
        date: "07/04/2026",
        dayOfWeek: "Terça-feira",
        time: "12:00",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        pillarColor: "#2d6a4f",
        format: "REEL",
        formatLabel: "Reels (60s)",
        title: "Brasília tem 42% menos áreas verdes do que deveria",
        caption: "Você sabia que Brasília perdeu 42% das suas áreas verdes nos últimos 20 anos? 🌳\n\nEnquanto a cidade cresce, nossos parques e praças ficam para trás. Mas isso pode mudar.\n\nEu acredito numa Brasília Cidade Parque — onde cada quadra tem um espaço verde de qualidade, onde nossas crianças brincam ao ar livre e onde a natureza faz parte do dia a dia.\n\nNos próximos meses, vou mostrar como isso é possível. Acompanhe essa jornada comigo.",
        hashtags: ["#BrasíliaCidadeParque", "#MaisVerde", "#EduardoBrandão", "#Brasília", "#MeioAmbiente"],
        visualDescription: "Reel com drone mostrando áreas de Brasília com pouca vegetação, intercalado com imagens de parques bonitos. Texto animado com a estatística '42%' em destaque. Trilha sonora inspiradora. Eduardo aparece no final olhando para um parque.",
        cta: "Comente: qual parque de Brasília você mais ama? 💚",
        objective: "Gerar awareness sobre o problema e apresentar a visão",
        targetReach: 2000,
        targetLikes: 80,
        targetComments: 15,
        boost: true,
        boostBudget: 150,
        storyCompanion: "3 stories: 1) Enquete 'Você acha que Brasília tem áreas verdes suficientes?', 2) Bastidores da gravação do Reel, 3) Countdown para próximo post",
        notes: "Este é o post de lançamento. Precisa ter qualidade cinematográfica. Investir em drone e edição profissional.",
      },
      {
        id: "abr-s1-qui",
        date: "09/04/2026",
        dayOfWeek: "Quinta-feira",
        time: "18:00",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        pillarColor: "#40916c",
        format: "CAROUSEL",
        formatLabel: "Carrossel (7 slides)",
        title: "O que é o projeto Brasília Cidade Parque?",
        caption: "Brasília Cidade Parque não é só um slogan. É um plano real. 📋\n\nNos últimos anos, trabalhei diretamente na criação e revitalização de parques urbanos em Brasília. Conheço cada desafio e cada oportunidade.\n\nNeste carrossel, explico os 5 pilares do projeto:\n\n🌳 Revitalização de parques existentes\n🏗️ Criação de novos espaços verdes\n👨‍👩‍👧‍👦 Áreas de lazer para famílias\n🚴 Ciclovias conectando parques\n💧 Sustentabilidade hídrica\n\nDeslize para conhecer cada um →",
        hashtags: ["#BrasíliaCidadeParque", "#ProjetoVerde", "#EduardoBrandão", "#Urbanismo", "#Sustentabilidade"],
        visualDescription: "Carrossel com design limpo verde-escuro. Slide 1: Título impactante. Slides 2-6: Um pilar por slide com ícone, foto real e texto curto. Slide 7: CTA com foto de Eduardo. Identidade visual consistente com tons de verde e dourado.",
        cta: "Salve este post para consultar depois e compartilhe com quem ama Brasília 💚",
        objective: "Educar sobre o projeto e demonstrar competência técnica",
        targetReach: 1500,
        targetLikes: 60,
        targetComments: 10,
        boost: false,
        storyCompanion: "2 stories: 1) Quiz 'Quantos parques Brasília tem?', 2) Repost do carrossel com destaque em 1 pilar",
        notes: "Carrossel precisa ser visualmente impecável. Usar template de design consistente para todos os slides.",
      },
      {
        id: "abr-s1-sab",
        date: "11/04/2026",
        dayOfWeek: "Sábado",
        time: "10:00",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        pillarColor: "#c9a84c",
        format: "VIDEO",
        formatLabel: "Vídeo (90s)",
        title: "Um sábado no Parque da Cidade com a família",
        caption: "Sábado é dia de parque! 🌿\n\nHoje trouxe a família para o Parque da Cidade. É aqui que eu recarrego as energias e lembro por que luto por mais espaços como esse.\n\nCada criança merece ter um parque perto de casa. Cada família merece um fim de semana ao ar livre.\n\nBrasília Cidade Parque é sobre isso: qualidade de vida para todos.\n\nE você, onde está curtindo esse sábado?",
        hashtags: ["#BrasíliaCidadeParque", "#FamíliaBrandão", "#ParqueDaCidade", "#SábadoEmFamília", "#QualidadeDeVida"],
        visualDescription: "Vídeo casual e autêntico no Parque da Cidade. Eduardo com a família, brincando com crianças, caminhando. Tons quentes, luz natural de manhã. Sem roteiro rígido — naturalidade é a chave. Música suave de fundo.",
        cta: "Marque alguém que ama um parque em Brasília 🌳",
        objective: "Humanizar o candidato e criar conexão emocional",
        targetReach: 1800,
        targetLikes: 70,
        targetComments: 12,
        boost: true,
        boostBudget: 100,
        storyCompanion: "4 stories ao longo do dia: 1) Chegando no parque, 2) Momento família, 3) Interação com pessoas no parque, 4) Pôr do sol com reflexão",
        notes: "Conteúdo autêntico e espontâneo. NÃO parecer ensaiado. Filmar com celular para dar sensação de proximidade.",
      },
    ],
  },
  {
    id: "abr-s2",
    weekNumber: 2,
    label: "Semana 2",
    dateRange: "13 - 19 Abril",
    month: "Abril",
    theme: "Denúncia: Os Parques Abandonados de Brasília",
    themeDescription: "Semana de conteúdo investigativo. Mostrar a realidade dos parques abandonados e gerar indignação construtiva, posicionando Eduardo como quem conhece e resolve.",
    weeklyGoal: "Gerar engajamento através de denúncia construtiva e posicionar Eduardo como conhecedor dos problemas",
    followersTarget: 1800,
    posts: [
      {
        id: "abr-s2-ter",
        date: "14/04/2026",
        dayOfWeek: "Terça-feira",
        time: "12:00",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        pillarColor: "#2d6a4f",
        format: "REEL",
        formatLabel: "Reels (45s)",
        title: "Antes e Depois: Parque Olhos D'Água",
        caption: "Isso é o Parque Olhos D'Água HOJE vs como ele ERA. 😔\n\nBancos quebrados, trilhas sem manutenção, iluminação precária. Um dos parques mais bonitos de Brasília está sendo esquecido.\n\nMas eu não vou esquecer. Já mapeei 47 pontos que precisam de atenção urgente neste parque.\n\nBrasília Cidade Parque começa com cuidar do que já temos.\n\nVocê já visitou esse parque recentemente? Conta nos comentários como estava.",
        hashtags: ["#BrasíliaCidadeParque", "#ParqueOlhosDAgua", "#AntesEDepois", "#CuidaDeBrasília", "#EduardoBrandão"],
        visualDescription: "Reel com formato split-screen: lado esquerdo mostra fotos antigas do parque bonito, lado direito mostra estado atual. Transições rápidas e impactantes. Texto overlay com dados. Eduardo aparece no final no próprio parque.",
        cta: "Compartilhe para que mais pessoas vejam a realidade 📢",
        objective: "Gerar indignação construtiva e compartilhamentos",
        targetReach: 3000,
        targetLikes: 90,
        targetComments: 20,
        boost: true,
        boostBudget: 200,
        storyCompanion: "5 stories: Tour completo pelo parque mostrando problemas específicos com enquetes de reação",
        notes: "POST VIRAL PLANEJADO. Investir em edição de alta qualidade. Formato Antes/Depois tem alto potencial de viralização.",
      },
      {
        id: "abr-s2-qui",
        date: "16/04/2026",
        dayOfWeek: "Quinta-feira",
        time: "18:00",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        pillarColor: "#40916c",
        format: "CAROUSEL",
        formatLabel: "Carrossel (8 slides)",
        title: "Mapa: 12 parques que precisam de atenção urgente",
        caption: "Fiz um levantamento completo. 📊\n\nBrasília tem dezenas de parques, mas 12 deles estão em situação crítica. Mapeei cada um com os principais problemas:\n\n🔴 Segurança precária\n🟡 Infraestrutura danificada\n🟠 Falta de manutenção\n🔵 Acessibilidade inexistente\n\nDeslize para ver o mapa completo e descubra se o parque do seu bairro está na lista.\n\nConhecimento é o primeiro passo para a mudança.",
        hashtags: ["#BrasíliaCidadeParque", "#MapaVerde", "#ParquesDeBrasília", "#Transparência", "#EduardoBrandão"],
        visualDescription: "Carrossel com mapa estilizado de Brasília. Cada slide foca em 2 parques com foto, localização e lista de problemas. Design infográfico profissional. Último slide com resumo e CTA.",
        cta: "Salve e compartilhe com moradores dessas regiões 📍",
        objective: "Demonstrar conhecimento técnico e gerar salvamentos",
        targetReach: 2000,
        targetLikes: 65,
        targetComments: 15,
        boost: false,
        storyCompanion: "3 stories: 1) 'Qual parque da sua região precisa de mais atenção?', 2) Dados extras, 3) Prévia do próximo conteúdo",
        notes: "Conteúdo de alta qualidade informativa. Precisa de pesquisa real e dados verificáveis.",
      },
      {
        id: "abr-s2-sab",
        date: "18/04/2026",
        dayOfWeek: "Sábado",
        time: "10:00",
        pillar: "mobilizacao",
        pillarLabel: "Conteúdo de Mobilização",
        pillarColor: "#e76f51",
        format: "VIDEO",
        formatLabel: "Vídeo (60s)",
        title: "Mutirão Verde: Vamos limpar o Parque Águas Claras juntos!",
        caption: "Chega de reclamar. É hora de AGIR! 💪🌿\n\nEstou organizando o primeiro Mutirão Verde da pré campanha Brasília Cidade Parque!\n\n📅 Sábado, 25 de Abril\n📍 Parque Águas Claras\n⏰ 8h às 12h\n\nVamos juntos limpar, plantar e cuidar desse espaço que é de todos nós.\n\nTraga luvas, disposição e um amigo! Materiais de plantio por nossa conta.\n\nBrasília Cidade Parque começa com cada um de nós.",
        hashtags: ["#MutirãoVerde", "#BrasíliaCidadeParque", "#AçãoComunitária", "#ÁguasClaras", "#EduardoBrandão"],
        visualDescription: "Vídeo de Eduardo convidando para o mutirão. Começa em frente ao parque, mostra problemas, depois mostra como ficaria com melhorias (mockup). Energia alta, música motivacional. Texto com data/local em destaque.",
        cta: "Comente 'EU VOU' se quer participar! 🙋‍♂️",
        objective: "Mobilizar comunidade e gerar engajamento presencial",
        targetReach: 2500,
        targetLikes: 75,
        targetComments: 25,
        boost: true,
        boostBudget: 150,
        storyCompanion: "Countdown stories durante a semana: 'Faltam X dias para o Mutirão Verde!'",
        notes: "Post de mobilização. O CTA 'EU VOU' gera alto engajamento nos comentários. Preparar evento real.",
      },
    ],
  },
  {
    id: "abr-s3",
    weekNumber: 3,
    label: "Semana 3",
    dateRange: "20 - 26 Abril",
    month: "Abril",
    theme: "Ação: Mutirão Verde e Resultados Reais",
    themeDescription: "Semana do primeiro evento presencial. Conteúdo focado em mostrar ação real, resultados tangíveis e mobilização comunitária. Alto potencial de viralização.",
    weeklyGoal: "Documentar o Mutirão Verde e mostrar que Eduardo entrega resultados reais",
    followersTarget: 1950,
    posts: [
      {
        id: "abr-s3-ter",
        date: "21/04/2026",
        dayOfWeek: "Terça-feira",
        time: "12:00",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        pillarColor: "#2d6a4f",
        format: "REEL",
        formatLabel: "Reels (60s)",
        title: "Por que Tiradentes deveria nos inspirar a cuidar de Brasília",
        caption: "Hoje é feriado de Tiradentes. 🇧🇷\n\nUm homem que lutou por liberdade e justiça. Que acreditou que o Brasil podia ser melhor.\n\nEu acredito que Brasília pode ser melhor. Que nossos parques podem ser espaços de liberdade, de encontro, de vida.\n\nBrasília foi planejada para ser a capital mais verde do mundo. Vamos honrar esse legado.\n\nEste sábado tem Mutirão Verde no Parque Águas Claras. Venha fazer parte dessa história.\n\n#21DeAbril #BrasíliaCidadeParque",
        hashtags: ["#Tiradentes", "#21DeAbril", "#BrasíliaCidadeParque", "#LegadoVerde", "#EduardoBrandão"],
        visualDescription: "Reel contemplativo. Imagens de Brasília ao amanhecer — Congresso, Esplanada, parques. Narração em off de Eduardo com tom inspirador. Transição para imagens de parques e natureza. Final com convite para o Mutirão.",
        cta: "Compartilhe se você também acredita numa Brasília melhor 💚",
        objective: "Conectar feriado nacional com narrativa da pré campanha",
        targetReach: 2500,
        targetLikes: 85,
        targetComments: 12,
        boost: true,
        boostBudget: 100,
        storyCompanion: "3 stories: 1) Reflexão sobre Tiradentes, 2) Brasília ao amanhecer, 3) Lembrete do Mutirão",
        notes: "Aproveitar o feriado para conteúdo emocional. Tom solene mas esperançoso. NÃO ser político demais.",
      },
      {
        id: "abr-s3-qui",
        date: "23/04/2026",
        dayOfWeek: "Quinta-feira",
        time: "18:00",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        pillarColor: "#40916c",
        format: "CAROUSEL",
        formatLabel: "Carrossel (6 slides)",
        title: "Como funciona um Mutirão Verde: passo a passo",
        caption: "Sábado é dia de Mutirão Verde! Mas como funciona? 🤔\n\nPreparei um guia completo para você que vai participar:\n\n1️⃣ Chegada e acolhimento (8h)\n2️⃣ Divisão em equipes\n3️⃣ Limpeza das trilhas\n4️⃣ Plantio de mudas nativas\n5️⃣ Pintura de bancos e equipamentos\n6️⃣ Foto coletiva e encerramento (12h)\n\n📍 Parque Águas Claras\n🧤 Traga: luvas, protetor solar, água\n🌱 Nós fornecemos: mudas, ferramentas, lanche\n\nVamos transformar esse parque juntos!",
        hashtags: ["#MutirãoVerde", "#BrasíliaCidadeParque", "#ComoParticipar", "#ÁguasClaras", "#EduardoBrandão"],
        visualDescription: "Carrossel instrucional com design limpo. Cada slide é um passo com ícone, foto ilustrativa e texto curto. Cores verde e dourado. Último slide com mapa de como chegar ao parque.",
        cta: "Marque 3 amigos que vão com você! 👥",
        objective: "Informar participantes e gerar mais confirmações",
        targetReach: 1800,
        targetLikes: 55,
        targetComments: 20,
        boost: false,
        storyCompanion: "Countdown final: 'Faltam 2 dias! Já separou sua roupa confortável?'",
        notes: "Post funcional e informativo. Facilitar a participação removendo barreiras de informação.",
      },
      {
        id: "abr-s3-sab",
        date: "25/04/2026",
        dayOfWeek: "Sábado",
        time: "14:00",
        pillar: "mobilizacao",
        pillarLabel: "Conteúdo de Mobilização",
        pillarColor: "#e76f51",
        format: "REEL",
        formatLabel: "Reels (90s)",
        title: "Mutirão Verde: O Antes e Depois que Brasília precisava ver",
        caption: "ISSO ACONTECEU HOJE! 🌿💚\n\nMais de 50 pessoas se juntaram no Parque Águas Claras para o primeiro Mutirão Verde da pré campanha Brasília Cidade Parque.\n\nEm 4 horas:\n✅ 200 metros de trilha limpos\n✅ 30 mudas de árvores nativas plantadas\n✅ 15 bancos restaurados\n✅ 1 comunidade mais unida\n\nIsso é Brasília Cidade Parque na prática. Não é promessa. É ação.\n\nO próximo Mutirão já tem data. Quer saber? Segue o perfil e ativa as notificações! 🔔",
        hashtags: ["#MutirãoVerde", "#BrasíliaCidadeParque", "#AntesEDepois", "#AçãoReal", "#EduardoBrandão", "#ÁguasClaras"],
        visualDescription: "Reel épico do Mutirão. Timelapse da transformação do parque. Rostos felizes, mãos sujas de terra, crianças plantando. Split screen antes/depois. Música emotiva crescendo. Eduardo trabalhando junto com todos. Drone no final mostrando resultado.",
        cta: "Compartilhe para inspirar mais pessoas a agir! 🔄",
        objective: "Documentar resultado e viralizar com antes/depois",
        targetReach: 5000,
        targetLikes: 120,
        targetComments: 30,
        boost: true,
        boostBudget: 300,
        storyCompanion: "Stories ao vivo durante todo o evento: chegada, trabalho, resultados, depoimentos de participantes",
        notes: "POST VIRAL PRINCIPAL DO MÊS. Investir pesado em edição. Filmar com múltiplas câmeras. Este post deve ser o mais compartilhado do mês.",
      },
    ],
  },
  {
    id: "abr-s4",
    weekNumber: 4,
    label: "Semana 4",
    dateRange: "27 Abr - 03 Mai",
    month: "Abril",
    theme: "Consolidação: Resultados e Próximos Passos",
    themeDescription: "Semana de consolidação dos resultados do mês. Mostrar impacto, agradecer comunidade e preparar terreno para maio com conteúdo de transição.",
    weeklyGoal: "Consolidar crescimento do mês, agradecer comunidade e criar expectativa para maio",
    followersTarget: 2092,
    posts: [
      {
        id: "abr-s4-ter",
        date: "28/04/2026",
        dayOfWeek: "Terça-feira",
        time: "12:00",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        pillarColor: "#c9a84c",
        format: "VIDEO",
        formatLabel: "Vídeo (60s)",
        title: "Depoimento: 'O parque mudou minha rotina'",
        caption: "A Dona Maria mora há 15 anos ao lado do Parque Águas Claras. 👵\n\nEla me contou que parou de frequentar porque tinha medo. Os bancos estavam quebrados, a iluminação não funcionava.\n\nDepois do Mutirão Verde, ela voltou. E chorou.\n\n'Eu não acreditava que alguém ia se importar com esse parque. Vocês devolveram minha alegria de caminhar.'\n\nÉ por isso que fazemos o que fazemos. Brasília Cidade Parque é sobre pessoas como a Dona Maria.",
        hashtags: ["#BrasíliaCidadeParque", "#HistóriasReais", "#DonaMaria", "#ImpactoReal", "#EduardoBrandão"],
        visualDescription: "Vídeo emocional. Dona Maria contando sua história no parque revitalizado. Imagens intercaladas do antes e depois. Eduardo ouvindo com atenção. Luz natural, tom intimista. Sem música alta — deixar a emoção falar.",
        cta: "Marque alguém que precisa ouvir essa história 💛",
        objective: "Gerar conexão emocional profunda e compartilhamentos",
        targetReach: 3500,
        targetLikes: 100,
        targetComments: 20,
        boost: true,
        boostBudget: 200,
        storyCompanion: "3 stories: 1) Bastidores da gravação, 2) Mais depoimentos curtos, 3) Agradecimento à comunidade",
        notes: "Depoimento real e emocional. Potencial viral alto. Pedir autorização de imagem da Dona Maria.",
      },
      {
        id: "abr-s4-qui",
        date: "30/04/2026",
        dayOfWeek: "Quinta-feira",
        time: "18:00",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        pillarColor: "#40916c",
        format: "CAROUSEL",
        formatLabel: "Carrossel (5 slides)",
        title: "Abril em números: O que conquistamos juntos",
        caption: "Nosso primeiro mês de Brasília Cidade Parque em números! 📊\n\nAbril foi só o começo, mas os resultados já impressionam:\n\n📈 +587 novos seguidores\n🌳 30 mudas plantadas\n👥 50+ voluntários no Mutirão\n📍 12 parques mapeados\n💬 Centenas de mensagens de apoio\n\nCada número representa uma pessoa que acredita numa Brasília melhor.\n\nMaio vem com ainda mais força. Preparem-se! 🚀",
        hashtags: ["#BrasíliaCidadeParque", "#AbrilEmNúmeros", "#Resultados", "#Transparência", "#EduardoBrandão"],
        visualDescription: "Carrossel infográfico elegante. Slide 1: Título 'Abril em Números'. Slides 2-4: Métricas com ícones grandes e números em destaque. Slide 5: Prévia de maio com 'Em breve...' e CTA.",
        cta: "Ative as notificações para não perder nada em maio! 🔔",
        objective: "Mostrar transparência e resultados mensuráveis",
        targetReach: 1500,
        targetLikes: 50,
        targetComments: 8,
        boost: false,
        storyCompanion: "2 stories: 1) Agradecimento pessoal de Eduardo, 2) Teaser do tema de maio",
        notes: "Fechamento do mês com prestação de contas. Tom de gratidão e expectativa.",
      },
      {
        id: "abr-s4-sab",
        date: "02/05/2026",
        dayOfWeek: "Sábado",
        time: "10:00",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        pillarColor: "#2d6a4f",
        format: "REEL",
        formatLabel: "Reels (45s)",
        title: "Maio: Mês da Mobilidade Verde em Brasília",
        caption: "Maio chegou e com ele um novo capítulo! 🚴‍♂️🌿\n\nBrasília Cidade Parque não é só sobre parques. É sobre conectar as pessoas à natureza.\n\nEm maio, nosso foco será MOBILIDADE VERDE:\n\n🚴 Ciclovias que conectam parques\n🚶 Calçadas arborizadas\n🚌 Transporte público + áreas verdes\n\nBrasília foi feita para o carro. Vamos transformá-la para as pessoas.\n\nAcompanhe essa nova fase!",
        hashtags: ["#BrasíliaCidadeParque", "#MobilidadeVerde", "#Ciclovias", "#MaisSustentável", "#EduardoBrandão"],
        visualDescription: "Reel dinâmico. Eduardo pedalando por Brasília, passando por parques e áreas verdes. Drone acompanhando. Intercalado com infográficos animados sobre mobilidade. Energia alta, música upbeat.",
        cta: "Comente: você usa bicicleta em Brasília? 🚲",
        objective: "Transição para o tema de maio e manter engajamento",
        targetReach: 2000,
        targetLikes: 70,
        targetComments: 15,
        boost: true,
        boostBudget: 100,
        storyCompanion: "3 stories: 1) Eduardo pedalando, 2) Enquete sobre mobilidade, 3) Prévia do conteúdo de maio",
        notes: "Post de transição para maio. Manter energia alta e expectativa. Tema de maio: Mobilidade Verde.",
      },
    ],
  },
];

// Helper para determinar a semana atual
export function getCurrentWeek(): WeekPlan {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth(); // 0-indexed, abril = 3

  // Abril 2026
  if (month === 3) {
    if (day <= 12) return APRIL_WEEKS[0];
    if (day <= 19) return APRIL_WEEKS[1];
    if (day <= 26) return APRIL_WEEKS[2];
    return APRIL_WEEKS[3];
  }

  // Default: retorna semana mais próxima
  return APRIL_WEEKS[0];
}

export function getNextWeek(): WeekPlan {
  const current = getCurrentWeek();
  const idx = APRIL_WEEKS.findIndex((w) => w.id === current.id);
  if (idx < APRIL_WEEKS.length - 1) return APRIL_WEEKS[idx + 1];
  return APRIL_WEEKS[APRIL_WEEKS.length - 1];
}
