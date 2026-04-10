// ============================================================
// DESIGN: Command Center Militar Verde
// Briefing Criativo — Gerador de briefings para posts
// ============================================================

export interface BriefingTemplate {
  id: string;
  postType: "carrossel" | "video" | "reels" | "stories";
  contentPillar: "causa" | "explicacao" | "humano" | "mobilizacao";
  title: string;
  objective: string;
  targetAudience: string;
  keyMessage: string;
  toneOfVoice: string;
  visualDirection: VisualDirection;
  copyStructure: CopyStructure;
  productionChecklist: string[];
  references: string[];
  kpis: KPI[];
  estimatedTime: string;
  budget: string;
}

export interface VisualDirection {
  style: string;
  colorPalette: string[];
  typography: string;
  imageStyle: string;
  doList: string[];
  dontList: string[];
}

export interface CopyStructure {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  emojis: string[];
}

export interface KPI {
  metric: string;
  target: string;
  benchmark: string;
}

export interface WeeklyBriefing {
  weekId: string;
  weekLabel: string;
  theme: string;
  posts: PostBriefing[];
}

export interface PostBriefing {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  type: "carrossel" | "video" | "reels";
  pillar: "causa" | "explicacao" | "humano" | "mobilizacao";
  pillarLabel: string;
  objective: string;
  targetAudience: string;
  keyMessage: string;
  toneOfVoice: string;
  hook: string;
  bodyScript: string;
  cta: string;
  hashtags: string[];
  visualDirection: string;
  colorNotes: string;
  imageRefs: string[];
  doList: string[];
  dontList: string[];
  productionSteps: ProductionStep[];
  kpis: { metric: string; target: string }[];
  estimatedProductionTime: string;
  adBudget: string;
  notes: string;
}

export interface ProductionStep {
  step: string;
  responsible: string;
  deadline: string;
  status: "pendente" | "em_andamento" | "concluido";
}

// Briefings detalhados para Semana 1 de Abril
export const WEEKLY_BRIEFINGS: WeeklyBriefing[] = [
  {
    weekId: "w1-apr",
    weekLabel: "Semana 1 — 06 a 12 de Abril",
    theme: "Lançamento: Brasília Merece Mais Verde",
    posts: [
      {
        id: "brief-w1-1",
        day: "Terça-feira",
        date: "07/04/2026",
        time: "18:00",
        title: "Brasília tem 42% menos áreas verdes do que deveria",
        type: "carrossel",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        objective: "Gerar awareness sobre o déficit de áreas verdes em Brasília e posicionar Eduardo como voz ativa na causa ambiental",
        targetAudience: "Moradores de Brasília entre 25-55 anos, preocupados com qualidade de vida e meio ambiente",
        keyMessage: "Brasília foi planejada para ser uma cidade verde, mas estamos perdendo esse legado. É hora de agir.",
        toneOfVoice: "Informativo com urgência moderada. Dados concretos + emoção controlada. Evitar tom alarmista, preferir tom propositivo.",
        hook: "📊 Você sabia que Brasília tem 42% MENOS áreas verdes do que o recomendado pela OMS?",
        bodyScript: "Slide 1: Dado impactante (42% menos áreas verdes)\nSlide 2: Mapa comparativo — Brasília planejada vs. Brasília atual\nSlide 3: O que isso significa para sua saúde (dados OMS)\nSlide 4: Regiões mais afetadas (Ceilândia, Samambaia, Recanto)\nSlide 5: O que já foi feito (legado de Eduardo)\nSlide 6: O que ainda precisa ser feito (proposta)\nSlide 7: CTA — Compartilhe e marque alguém que precisa saber",
        cta: "Compartilhe esse dado com alguém que ama Brasília. Juntos, podemos mudar essa realidade. 💚",
        hashtags: ["#BrasíliaCidadeParque", "#MaisVerdeParaBrasília", "#EduardoBrandão", "#MeioAmbienteBSB", "#ÁreasVerdes"],
        visualDirection: "Carrossel com design editorial. Fundo escuro (verde-floresta #1a3a2a) com tipografia bold branca. Dados em destaque com cor accent (#c9a84c). Fotos reais de Brasília intercaladas com infográficos limpos.",
        colorNotes: "Primário: #2d6a4f (verde floresta) | Accent: #c9a84c (dourado) | Texto: #ffffff | Fundo: #0a1a12",
        imageRefs: [
          "Foto aérea de Brasília mostrando áreas sem vegetação",
          "Infográfico comparativo com ícones de árvores",
          "Foto de parque revitalizado (antes/depois)",
        ],
        doList: [
          "Usar dados reais e fontes verificáveis",
          "Incluir fonte dos dados no último slide",
          "Manter identidade visual consistente em todos os slides",
          "Usar tipografia legível (mínimo 24pt para corpo)",
          "Incluir logo da pré campanha no canto inferior",
        ],
        dontList: [
          "Não usar tom catastrofista ou alarmista",
          "Não atacar adversários diretamente",
          "Não usar imagens genéricas de banco de imagem",
          "Não exceder 7 slides no carrossel",
          "Não usar mais de 2 fontes diferentes",
        ],
        productionSteps: [
          { step: "Pesquisa de dados e fontes", responsible: "Analista de Dados", deadline: "04/04", status: "pendente" },
          { step: "Redação do texto e legendas", responsible: "Redator", deadline: "05/04", status: "pendente" },
          { step: "Design dos slides", responsible: "Designer", deadline: "06/04", status: "pendente" },
          { step: "Revisão e aprovação", responsible: "Coordenador", deadline: "06/04", status: "pendente" },
          { step: "Agendamento e publicação", responsible: "Social Media", deadline: "07/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "2.000+" },
          { metric: "Curtidas", target: "80+" },
          { metric: "Comentários", target: "15+" },
          { metric: "Compartilhamentos", target: "20+" },
          { metric: "Salvamentos", target: "10+" },
        ],
        estimatedProductionTime: "4-6 horas",
        adBudget: "R$ 150",
        notes: "Post de abertura da pré campanha digital. Impulsionar com R$ 150 focando em Brasília e entorno. Segmentação: 25-55 anos, interesses em meio ambiente, política local, qualidade de vida.",
      },
      {
        id: "brief-w1-2",
        day: "Quinta-feira",
        date: "09/04/2026",
        time: "10:00",
        title: "O que é o projeto Brasília Cidade Parque?",
        type: "video",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        objective: "Apresentar o conceito 'Brasília Cidade Parque' de forma clara e acessível, posicionando Eduardo como idealizador",
        targetAudience: "Público geral de Brasília, especialmente quem ainda não conhece o projeto",
        keyMessage: "Brasília Cidade Parque é um projeto que transforma espaços abandonados em áreas de convivência verde para todos.",
        toneOfVoice: "Didático e inspirador. Tom de professor apaixonado pelo tema. Linguagem simples, sem jargões técnicos.",
        hook: "🌳 Imagine uma Brasília onde cada bairro tem um parque a 10 minutos de caminhada...",
        bodyScript: "0-5s: Hook visual — drone sobrevoando parque bonito de Brasília\n5-15s: Eduardo aparece e faz a pergunta: 'Você já imaginou uma Brasília onde cada bairro tem um parque?'\n15-30s: Explicação do conceito com imagens de parques existentes\n30-50s: Mostrar exemplos de cidades que já fizeram isso (Curitiba, Medellín)\n50-70s: O que já foi conquistado (parques criados no mandato)\n70-85s: Próximos passos e visão de futuro\n85-90s: CTA — 'Siga para acompanhar essa transformação'",
        cta: "Siga @eduardobrandaopv para acompanhar cada passo dessa transformação. Brasília merece ser uma Cidade Parque! 🌿",
        hashtags: ["#BrasíliaCidadeParque", "#EduardoBrandão", "#ParquesUrbanos", "#BrasíliaMaisVerde", "#QualidadeDeVida"],
        visualDirection: "Vídeo com narração de Eduardo. Intercalar fala direta para câmera com imagens de drone de parques. Legendas em branco com sombra. Transições suaves. Música ambiente calma e inspiradora.",
        colorNotes: "Legendas: branco com sombra preta | Lower third: verde #2d6a4f com texto branco | Thumbnails: fundo verde com texto dourado",
        imageRefs: [
          "Eduardo falando para câmera em um parque",
          "Imagens de drone de parques de Brasília",
          "Comparativo visual de espaços antes e depois",
        ],
        doList: [
          "Gravar em parque real de Brasília (Parque da Cidade ou Olhos d'Água)",
          "Usar microfone lapela para áudio limpo",
          "Incluir legendas em todas as falas",
          "Manter duração entre 60-90 segundos",
          "Thumbnail atrativa com texto grande",
        ],
        dontList: [
          "Não gravar em ambiente com muito ruído",
          "Não usar linguagem técnica ou burocrática",
          "Não fazer o vídeo parecer propaganda eleitoral",
          "Não ultrapassar 90 segundos",
          "Não esquecer de incluir CTA no final",
        ],
        productionSteps: [
          { step: "Roteiro e storyboard", responsible: "Redator", deadline: "05/04", status: "pendente" },
          { step: "Gravação com Eduardo", responsible: "Videomaker", deadline: "07/04", status: "pendente" },
          { step: "Captação de imagens de drone", responsible: "Videomaker", deadline: "07/04", status: "pendente" },
          { step: "Edição e legendagem", responsible: "Editor", deadline: "08/04", status: "pendente" },
          { step: "Revisão e aprovação", responsible: "Coordenador", deadline: "08/04", status: "pendente" },
          { step: "Publicação", responsible: "Social Media", deadline: "09/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "1.500+" },
          { metric: "Curtidas", target: "60+" },
          { metric: "Comentários", target: "10+" },
          { metric: "Visualizações completas", target: "500+" },
          { metric: "Novos seguidores", target: "15+" },
        ],
        estimatedProductionTime: "8-12 horas",
        adBudget: "R$ 0 (orgânico)",
        notes: "Vídeo institucional do projeto. Não impulsionar — testar alcance orgânico primeiro. Se alcançar 1.000+ views em 24h, considerar impulsionamento posterior.",
      },
      {
        id: "brief-w1-3",
        day: "Sábado",
        date: "11/04/2026",
        time: "12:00",
        title: "Um sábado no Parque da Cidade com a família",
        type: "reels",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        objective: "Humanizar Eduardo mostrando seu lado familiar e sua conexão pessoal com os parques de Brasília",
        targetAudience: "Famílias de Brasília, mulheres 30-50 anos, pais com filhos pequenos",
        keyMessage: "Eduardo não é só político — é pai, marido e cidadão que vive e ama Brasília como você.",
        toneOfVoice: "Leve, autêntico e emocional. Tom de conversa entre amigos. Sem formalidade política.",
        hook: "🎬 POV: Seu sábado perfeito começa no Parque da Cidade...",
        bodyScript: "0-3s: Texto na tela 'POV: Sábado perfeito em Brasília'\n3-8s: Eduardo chegando ao parque com a família\n8-15s: Crianças brincando, cachorro correndo\n15-25s: Eduardo caminhando e comentando sobre o parque\n25-35s: Família fazendo piquenique\n35-45s: Eduardo fala direto para câmera: 'Esse é o tipo de Brasília que eu quero para todos'\n45-50s: Montagem rápida de momentos felizes\n50-55s: Texto final + CTA\n55-60s: Logo da pré campanha",
        cta: "Qual é o seu parque favorito em Brasília? Conta aqui nos comentários! 👇💚",
        hashtags: ["#BrasíliaCidadeParque", "#SábadoEmFamília", "#ParqueDaCidade", "#EduardoBrandão", "#VidaEmBrasília"],
        visualDirection: "Reels estilo vlog casual. Câmera na mão com estabilização. Filtro quente e natural. Música trending do momento (verificar trends do Reels). Edição dinâmica com cortes rápidos.",
        colorNotes: "Tons naturais e quentes | Texto overlay: branco com sombra | Sem filtros pesados — manter naturalidade",
        imageRefs: [
          "Eduardo com família no parque (fotos espontâneas)",
          "Crianças brincando em playground",
          "Vista do Parque da Cidade com céu de Brasília",
        ],
        doList: [
          "Gravar no Parque da Cidade em horário com boa luz (manhã)",
          "Capturar momentos espontâneos (não posados)",
          "Usar música trending do Reels",
          "Incluir texto overlay nos primeiros 3 segundos",
          "Manter entre 45-60 segundos",
          "Pedir para a família participar naturalmente",
        ],
        dontList: [
          "Não parecer ensaiado ou artificial",
          "Não usar roupas formais (casual e acessível)",
          "Não mencionar partido ou eleição",
          "Não usar trilha sonora triste ou dramática",
          "Não fazer propaganda explícita",
        ],
        productionSteps: [
          { step: "Planejamento do roteiro leve", responsible: "Redator", deadline: "08/04", status: "pendente" },
          { step: "Gravação no Parque da Cidade", responsible: "Videomaker + Eduardo", deadline: "10/04", status: "pendente" },
          { step: "Seleção de música trending", responsible: "Social Media", deadline: "10/04", status: "pendente" },
          { step: "Edição do Reels", responsible: "Editor", deadline: "10/04", status: "pendente" },
          { step: "Aprovação e publicação", responsible: "Coordenador", deadline: "11/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "1.800+" },
          { metric: "Curtidas", target: "70+" },
          { metric: "Comentários", target: "12+" },
          { metric: "Compartilhamentos", target: "15+" },
          { metric: "Novos seguidores", target: "20+" },
        ],
        estimatedProductionTime: "4-6 horas",
        adBudget: "R$ 100",
        notes: "Conteúdo humanizador. Impulsionar com R$ 100 focando em mulheres 25-50 anos em Brasília. Esse tipo de conteúdo costuma ter alto engajamento orgânico — monitorar e ajustar ads conforme desempenho.",
      },
    ],
  },
  {
    weekId: "w2-apr",
    weekLabel: "Semana 2 — 13 a 19 de Abril",
    theme: "Transformação Urbana: Antes e Depois",
    posts: [
      {
        id: "brief-w2-1",
        day: "Terça-feira",
        date: "14/04/2026",
        time: "18:00",
        title: "Antes e depois: Praça revitalizada no Gama",
        type: "carrossel",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        objective: "Mostrar resultados concretos de revitalização urbana e reforçar o legado de Eduardo",
        targetAudience: "Moradores do Gama e entorno, interessados em melhorias urbanas",
        keyMessage: "Transformação real acontece quando alguém se importa. Veja o que já fizemos no Gama.",
        toneOfVoice: "Orgulhoso mas humilde. Mostrar resultados sem arrogância. Tom de 'olha o que conseguimos juntos'.",
        hook: "📸 Deslize para ver a transformação que ninguém acreditava ser possível...",
        bodyScript: "Slide 1: Foto ANTES (praça abandonada, suja)\nSlide 2: Foto DEPOIS (praça revitalizada, verde)\nSlide 3: Detalhes da transformação (playground, bancos, iluminação)\nSlide 4: Depoimento de morador\nSlide 5: Dados do investimento e impacto\nSlide 6: Próximas praças a serem revitalizadas\nSlide 7: CTA — Qual praça do seu bairro precisa disso?",
        cta: "Qual praça do seu bairro precisa de uma transformação dessas? Marca a gente e conta! 📍",
        hashtags: ["#BrasíliaCidadeParque", "#AntesEDepois", "#Gama", "#TransformaçãoUrbana", "#EduardoBrandão"],
        visualDirection: "Antes/depois com slider visual. Fotos reais de alta qualidade. Tipografia bold. Cores da pré campanha.",
        colorNotes: "Antes: tons dessaturados | Depois: cores vibrantes e verdes | Texto: branco sobre fundo escuro",
        imageRefs: ["Fotos reais da praça antes e depois", "Moradores usando o espaço", "Detalhes da revitalização"],
        doList: ["Usar fotos reais do mesmo ângulo", "Incluir depoimento real de morador", "Mostrar dados de investimento"],
        dontList: ["Não inventar dados", "Não usar fotos de outro local", "Não exagerar nos resultados"],
        productionSteps: [
          { step: "Visita ao local para fotos atuais", responsible: "Fotógrafo", deadline: "11/04", status: "pendente" },
          { step: "Coleta de depoimento de morador", responsible: "Redator", deadline: "12/04", status: "pendente" },
          { step: "Design do carrossel", responsible: "Designer", deadline: "13/04", status: "pendente" },
          { step: "Revisão e aprovação", responsible: "Coordenador", deadline: "13/04", status: "pendente" },
          { step: "Publicação", responsible: "Social Media", deadline: "14/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "2.500+" },
          { metric: "Curtidas", target: "90+" },
          { metric: "Compartilhamentos", target: "25+" },
        ],
        estimatedProductionTime: "6-8 horas",
        adBudget: "R$ 200",
        notes: "Conteúdo com alto potencial viral. Antes/depois sempre performa bem. Impulsionar com foco geográfico no Gama.",
      },
      {
        id: "brief-w2-2",
        day: "Quinta-feira",
        date: "16/04/2026",
        time: "10:00",
        title: "5 parques que Brasília precisa urgentemente",
        type: "video",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        objective: "Educar sobre a necessidade de novos parques e apresentar propostas concretas",
        targetAudience: "Público engajado com meio ambiente e urbanismo em Brasília",
        keyMessage: "Brasília precisa de pelo menos 5 novos parques em regiões que hoje não têm nenhum.",
        toneOfVoice: "Técnico acessível. Dados + proposta. Tom de quem conhece o problema e tem a solução.",
        hook: "🏙️ 5 regiões de Brasília que NÃO TÊM nenhum parque público...",
        bodyScript: "0-5s: Mapa de Brasília com áreas sem parques destacadas\n5-20s: Eduardo apresenta o problema\n20-40s: Lista as 5 regiões e por que precisam\n40-60s: Propostas concretas para cada região\n60-75s: Como isso impacta a vida das pessoas\n75-90s: CTA e encerramento",
        cta: "Você mora em alguma dessas regiões? Conta nos comentários como é viver sem um parque perto! 🗣️",
        hashtags: ["#BrasíliaCidadeParque", "#ParquesUrbanos", "#EduardoBrandão", "#UrbanismoBSB", "#CidadeVerde"],
        visualDirection: "Vídeo com mapas animados e dados na tela. Eduardo em estúdio ou escritório. Infográficos sobrepostos.",
        colorNotes: "Mapas: verde sobre fundo escuro | Dados: dourado accent | Texto: branco",
        imageRefs: ["Mapa de Brasília com zonas sem parques", "Fotos das regiões mencionadas", "Referências de parques modelo"],
        doList: ["Usar dados reais do GDF", "Incluir mapas visuais", "Propor soluções concretas"],
        dontList: ["Não criticar gestão atual diretamente", "Não usar linguagem técnica demais", "Não ultrapassar 90s"],
        productionSteps: [
          { step: "Pesquisa de dados e mapeamento", responsible: "Analista", deadline: "13/04", status: "pendente" },
          { step: "Roteiro e infográficos", responsible: "Redator + Designer", deadline: "14/04", status: "pendente" },
          { step: "Gravação", responsible: "Videomaker", deadline: "15/04", status: "pendente" },
          { step: "Edição com animações", responsible: "Editor", deadline: "15/04", status: "pendente" },
          { step: "Publicação", responsible: "Social Media", deadline: "16/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "2.000+" },
          { metric: "Curtidas", target: "70+" },
          { metric: "Salvamentos", target: "15+" },
        ],
        estimatedProductionTime: "10-14 horas",
        adBudget: "R$ 0 (orgânico)",
        notes: "Conteúdo educativo de alto valor. Testar organicamente primeiro. Se performar bem, impulsionar na semana seguinte.",
      },
      {
        id: "brief-w2-3",
        day: "Sábado",
        date: "18/04/2026",
        time: "12:00",
        title: "Eduardo visita comunidade em Ceilândia",
        type: "reels",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        objective: "Mostrar Eduardo presente na comunidade, ouvindo as pessoas e entendendo suas necessidades",
        targetAudience: "Moradores de Ceilândia e periferia de Brasília",
        keyMessage: "Política de verdade se faz na rua, ouvindo quem mais precisa.",
        toneOfVoice: "Empático e próximo. Tom de quem está ali para ouvir, não para discursar.",
        hook: "🎥 Um dia em Ceilândia: ouvindo quem realmente importa...",
        bodyScript: "0-3s: Texto 'Um dia em Ceilândia'\n3-10s: Eduardo chegando na comunidade\n10-25s: Conversando com moradores\n25-40s: Ouvindo demandas e anotando\n40-50s: Momento emocional com morador\n50-55s: Eduardo reflete sobre o que ouviu\n55-60s: CTA + logo",
        cta: "Política se faz ouvindo. Qual é a maior necessidade do seu bairro? 💬",
        hashtags: ["#BrasíliaCidadeParque", "#Ceilândia", "#EduardoBrandão", "#PolíticaDeVerdade", "#NaRua"],
        visualDirection: "Estilo documental. Câmera na mão. Cores naturais. Sem filtros pesados. Música suave de fundo.",
        colorNotes: "Tons naturais | Texto: branco com sombra | Sem filtros artificiais",
        imageRefs: ["Eduardo conversando com moradores", "Ruas e espaços de Ceilândia", "Momentos de escuta"],
        doList: ["Gravar interações reais", "Pedir autorização dos moradores", "Capturar emoção genuína"],
        dontList: ["Não encenar situações", "Não usar roupas formais", "Não fazer promessas específicas no vídeo"],
        productionSteps: [
          { step: "Agendamento da visita", responsible: "Assessoria", deadline: "14/04", status: "pendente" },
          { step: "Gravação em campo", responsible: "Videomaker + Eduardo", deadline: "17/04", status: "pendente" },
          { step: "Edição do Reels", responsible: "Editor", deadline: "17/04", status: "pendente" },
          { step: "Aprovação e publicação", responsible: "Coordenador", deadline: "18/04", status: "pendente" },
        ],
        kpis: [
          { metric: "Alcance", target: "2.200+" },
          { metric: "Curtidas", target: "75+" },
          { metric: "Comentários", target: "15+" },
        ],
        estimatedProductionTime: "6-8 horas",
        adBudget: "R$ 150",
        notes: "Conteúdo territorial. Impulsionar com foco geográfico em Ceilândia e entorno. Alto potencial de engajamento local.",
      },
    ],
  },
  {
    weekId: "w3-apr",
    weekLabel: "Semana 3 — 20 a 26 de Abril",
    theme: "Mobilização: Brasília em Ação",
    posts: [
      {
        id: "brief-w3-1",
        day: "Terça-feira",
        date: "21/04/2026",
        time: "18:00",
        title: "Por que Brasília precisa de mais árvores?",
        type: "carrossel",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        objective: "Conscientizar sobre a importância da arborização urbana com dados científicos",
        targetAudience: "Público ambientalmente consciente, 20-45 anos",
        keyMessage: "Cada árvore plantada em Brasília reduz a temperatura em até 2°C na região ao redor.",
        toneOfVoice: "Científico acessível. Dados que impressionam + soluções práticas.",
        hook: "🌡️ Sabia que uma única árvore pode reduzir a temperatura ao redor em até 2°C?",
        bodyScript: "7 slides com dados sobre arborização urbana, benefícios para saúde, economia e qualidade de vida",
        cta: "Plante uma árvore, mude um bairro. Marque alguém que precisa ver isso! 🌳",
        hashtags: ["#BrasíliaCidadeParque", "#PlanteUmaÁrvore", "#ArborizaçãoUrbana", "#EduardoBrandão"],
        visualDirection: "Infográfico editorial com dados visuais impactantes",
        colorNotes: "Verde floresta + dourado accent",
        imageRefs: ["Infográficos de temperatura", "Fotos de ruas arborizadas vs. sem árvores"],
        doList: ["Citar fontes científicas", "Usar dados locais de Brasília"],
        dontList: ["Não ser catastrofista", "Não usar dados sem fonte"],
        productionSteps: [
          { step: "Pesquisa científica", responsible: "Analista", deadline: "18/04", status: "pendente" },
          { step: "Redação e design", responsible: "Redator + Designer", deadline: "20/04", status: "pendente" },
          { step: "Aprovação e publicação", responsible: "Coordenador", deadline: "21/04", status: "pendente" },
        ],
        kpis: [{ metric: "Alcance", target: "2.000+" }, { metric: "Salvamentos", target: "20+" }],
        estimatedProductionTime: "5-7 horas",
        adBudget: "R$ 0",
        notes: "Conteúdo educativo de alto valor de salvamento. Ideal para crescimento orgânico.",
      },
      {
        id: "brief-w3-2",
        day: "Quinta-feira",
        date: "23/04/2026",
        time: "10:00",
        title: "Depoimento: moradora conta como parque mudou sua vida",
        type: "video",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        objective: "Usar storytelling emocional para mostrar impacto real dos parques na vida das pessoas",
        targetAudience: "Público geral, especialmente mulheres 30-55 anos",
        keyMessage: "Parques mudam vidas. Essa é a história real de uma moradora de Brasília.",
        toneOfVoice: "Emocional e autêntico. Deixar a moradora contar sua história. Mínima intervenção.",
        hook: "😢 'Antes eu não tinha onde levar meus filhos para brincar...'",
        bodyScript: "Depoimento real de moradora + imagens do parque + reflexão de Eduardo",
        cta: "Você tem uma história assim? Compartilhe nos comentários! 💚",
        hashtags: ["#BrasíliaCidadeParque", "#HistóriasReais", "#ParquesTransformam", "#EduardoBrandão"],
        visualDirection: "Documentário íntimo. Close na moradora. Luz natural. Música emocional suave.",
        colorNotes: "Tons quentes e naturais | Legendas brancas",
        imageRefs: ["Moradora no parque", "Crianças brincando", "Antes e depois do espaço"],
        doList: ["Gravar depoimento real", "Pedir autorização por escrito", "Capturar emoção genuína"],
        dontList: ["Não encenar", "Não editar para parecer propaganda", "Não forçar emoção"],
        productionSteps: [
          { step: "Identificar moradora", responsible: "Assessoria", deadline: "20/04", status: "pendente" },
          { step: "Gravação", responsible: "Videomaker", deadline: "22/04", status: "pendente" },
          { step: "Edição e publicação", responsible: "Editor", deadline: "23/04", status: "pendente" },
        ],
        kpis: [{ metric: "Alcance", target: "2.500+" }, { metric: "Compartilhamentos", target: "30+" }],
        estimatedProductionTime: "8-10 horas",
        adBudget: "R$ 200",
        notes: "Alto potencial viral. Depoimentos emocionais são os conteúdos com maior taxa de compartilhamento.",
      },
      {
        id: "brief-w3-3",
        day: "Sábado",
        date: "25/04/2026",
        time: "12:00",
        title: "Venha para o mutirão de plantio no Lago Sul",
        type: "reels",
        pillar: "mobilizacao",
        pillarLabel: "Conteúdo de Mobilização",
        objective: "Convocar a comunidade para ação prática e gerar engajamento presencial",
        targetAudience: "Moradores do Lago Sul e ativistas ambientais de Brasília",
        keyMessage: "Não basta falar — é hora de agir. Venha plantar o futuro de Brasília com a gente!",
        toneOfVoice: "Energético e mobilizador. Tom de convocação positiva. Urgência sem pressão.",
        hook: "🌱 CONVOCAÇÃO: Mutirão de Plantio no Lago Sul — Dia 26/04!",
        bodyScript: "Vídeo convite com Eduardo + imagens de mutirões anteriores + informações práticas",
        cta: "Confirme presença nos comentários! Vamos juntos transformar Brasília! 🌳💚",
        hashtags: ["#BrasíliaCidadeParque", "#MutirãoDePlantio", "#LagoSul", "#EduardoBrandão", "#PlanteFuturo"],
        visualDirection: "Reels energético com cortes rápidos. Música motivacional. Texto grande na tela.",
        colorNotes: "Verde vibrante + dourado | Texto bold branco",
        imageRefs: ["Mutirões anteriores", "Eduardo plantando", "Comunidade reunida"],
        doList: ["Incluir data, hora e local", "Mostrar mutirões anteriores", "Criar senso de comunidade"],
        dontList: ["Não parecer obrigação", "Não esquecer informações práticas", "Não ser longo demais"],
        productionSteps: [
          { step: "Organização do evento", responsible: "Assessoria", deadline: "20/04", status: "pendente" },
          { step: "Gravação do convite", responsible: "Videomaker", deadline: "23/04", status: "pendente" },
          { step: "Edição e publicação", responsible: "Editor", deadline: "24/04", status: "pendente" },
        ],
        kpis: [{ metric: "Alcance", target: "3.000+" }, { metric: "Comentários", target: "25+" }],
        estimatedProductionTime: "3-4 horas",
        adBudget: "R$ 250",
        notes: "Post de mobilização. Impulsionar fortemente para garantir presença no evento. Segmentar Lago Sul + 10km.",
      },
    ],
  },
  {
    weekId: "w4-apr",
    weekLabel: "Semana 4 — 27 de Abril a 03 de Maio",
    theme: "Consolidação: Dados e Resultados",
    posts: [
      {
        id: "brief-w4-1",
        day: "Terça-feira",
        date: "28/04/2026",
        time: "18:00",
        title: "Dados chocantes: orçamento de parques vs. publicidade",
        type: "carrossel",
        pillar: "causa",
        pillarLabel: "Conteúdo de Causa",
        objective: "Provocar reflexão sobre prioridades orçamentárias do GDF",
        targetAudience: "Público politicamente engajado, 25-55 anos",
        keyMessage: "O GDF gasta X vezes mais em publicidade do que em manutenção de parques.",
        toneOfVoice: "Provocativo mas factual. Dados que falam por si. Sem ataques pessoais.",
        hook: "💰 O GDF gasta mais em publicidade do que em TODOS os parques de Brasília juntos...",
        bodyScript: "7 slides com comparativo orçamentário, infográficos e proposta de redistribuição",
        cta: "Você concorda que precisamos mudar essas prioridades? Compartilhe! 📊",
        hashtags: ["#BrasíliaCidadeParque", "#OrçamentoPúblico", "#Transparência", "#EduardoBrandão"],
        visualDirection: "Infográfico editorial com dados impactantes. Contraste visual forte.",
        colorNotes: "Vermelho para gastos ruins | Verde para investimentos bons | Fundo escuro",
        imageRefs: ["Infográficos comparativos", "Gráficos de barras", "Fotos de parques abandonados"],
        doList: ["Usar dados oficiais do portal da transparência", "Citar fontes", "Propor solução"],
        dontList: ["Não atacar pessoas", "Não inventar dados", "Não ser panfletário"],
        productionSteps: [
          { step: "Pesquisa orçamentária", responsible: "Analista", deadline: "25/04", status: "pendente" },
          { step: "Design e redação", responsible: "Designer + Redator", deadline: "27/04", status: "pendente" },
          { step: "Aprovação e publicação", responsible: "Coordenador", deadline: "28/04", status: "pendente" },
        ],
        kpis: [{ metric: "Alcance", target: "3.000+" }, { metric: "Compartilhamentos", target: "40+" }],
        estimatedProductionTime: "6-8 horas",
        adBudget: "R$ 200",
        notes: "Post polêmico controlado. Alto potencial viral. Monitorar comentários de perto.",
      },
      {
        id: "brief-w4-2",
        day: "Quinta-feira",
        date: "30/04/2026",
        time: "10:00",
        title: "Como funciona a compensação ambiental?",
        type: "video",
        pillar: "explicacao",
        pillarLabel: "Conteúdo de Explicação",
        objective: "Educar sobre mecanismos legais de proteção ambiental e posicionar Eduardo como especialista",
        targetAudience: "Público interessado em meio ambiente e legislação",
        keyMessage: "A compensação ambiental é uma ferramenta poderosa que poucos conhecem.",
        toneOfVoice: "Didático e acessível. Professor que simplifica o complexo.",
        hook: "📚 Você sabe o que é compensação ambiental? Deveria saber...",
        bodyScript: "Vídeo explicativo com Eduardo + animações + exemplos reais de Brasília",
        cta: "Salve esse vídeo para consultar depois! E compartilhe com quem precisa saber. 📌",
        hashtags: ["#BrasíliaCidadeParque", "#CompensaçãoAmbiental", "#MeioAmbiente", "#EduardoBrandão"],
        visualDirection: "Vídeo educativo com infográficos animados sobrepostos à fala de Eduardo",
        colorNotes: "Verde institucional + branco | Animações em dourado",
        imageRefs: ["Eduardo em escritório", "Animações de processos", "Exemplos visuais"],
        doList: ["Simplificar linguagem jurídica", "Usar exemplos reais", "Incluir legendas"],
        dontList: ["Não ser técnico demais", "Não ultrapassar 90s", "Não parecer aula"],
        productionSteps: [
          { step: "Pesquisa e roteiro", responsible: "Redator", deadline: "27/04", status: "pendente" },
          { step: "Gravação", responsible: "Videomaker", deadline: "29/04", status: "pendente" },
          { step: "Edição com animações", responsible: "Editor", deadline: "29/04", status: "pendente" },
          { step: "Publicação", responsible: "Social Media", deadline: "30/04", status: "pendente" },
        ],
        kpis: [{ metric: "Salvamentos", target: "25+" }, { metric: "Alcance", target: "1.800+" }],
        estimatedProductionTime: "10-12 horas",
        adBudget: "R$ 0",
        notes: "Conteúdo evergreen. Alto valor de salvamento. Pode ser repostado futuramente.",
      },
      {
        id: "brief-w4-3",
        day: "Sábado",
        date: "02/05/2026",
        time: "12:00",
        title: "Bastidores: um dia na Câmara Legislativa",
        type: "reels",
        pillar: "humano",
        pillarLabel: "Conteúdo Humano",
        objective: "Desmistificar o trabalho legislativo e mostrar Eduardo em ação",
        targetAudience: "Público geral curioso sobre política",
        keyMessage: "O trabalho de um deputado vai muito além do que você vê na TV.",
        toneOfVoice: "Informal e revelador. Estilo 'day in the life'. Autêntico.",
        hook: "🎬 POV: Um dia na vida de um Deputado Distrital...",
        bodyScript: "Reels estilo vlog: Eduardo mostrando sua rotina na Câmara, reuniões, votações, bastidores",
        cta: "Quer ver mais bastidores? Comenta 'SIM' aqui embaixo! 👇",
        hashtags: ["#BrasíliaCidadeParque", "#Bastidores", "#CâmaraLegislativa", "#EduardoBrandão", "#DayInTheLife"],
        visualDirection: "Vlog casual. Câmera na mão. Cortes rápidos. Música trending.",
        colorNotes: "Tons naturais | Texto overlay branco | Sem filtros pesados",
        imageRefs: ["Eduardo na Câmara", "Reuniões", "Corredores e plenário"],
        doList: ["Mostrar rotina real", "Incluir momentos leves", "Ser autêntico"],
        dontList: ["Não parecer ensaiado", "Não mostrar documentos confidenciais", "Não criticar colegas"],
        productionSteps: [
          { step: "Planejamento do dia de gravação", responsible: "Assessoria", deadline: "28/04", status: "pendente" },
          { step: "Gravação na Câmara", responsible: "Videomaker", deadline: "01/05", status: "pendente" },
          { step: "Edição e publicação", responsible: "Editor", deadline: "02/05", status: "pendente" },
        ],
        kpis: [{ metric: "Visualizações", target: "2.000+" }, { metric: "Comentários", target: "20+" }],
        estimatedProductionTime: "5-7 horas",
        adBudget: "R$ 100",
        notes: "Conteúdo de bastidores sempre gera curiosidade. Potencial alto de engajamento nos comentários.",
      },
    ],
  },
];

// Tone of voice guide
export const TONE_GUIDE = {
  general: "Próximo, autêntico e propositivo. Nunca arrogante ou agressivo.",
  pillars: {
    causa: "Informativo com urgência moderada. Dados + emoção controlada.",
    explicacao: "Didático e inspirador. Simplificar sem simplificar demais.",
    humano: "Leve, autêntico e emocional. Conversa entre amigos.",
    mobilizacao: "Energético e mobilizador. Convocação positiva.",
  },
  forbidden: [
    "Ataques pessoais a adversários",
    "Promessas impossíveis de cumprir",
    "Linguagem burocrática ou técnica demais",
    "Tom de superioridade ou arrogância",
    "Vitimismo ou reclamação excessiva",
  ],
  encouraged: [
    "Dados concretos com fontes",
    "Histórias reais de moradores",
    "Perguntas que geram discussão",
    "Humor leve e inteligente",
    "Referências à cultura de Brasília",
  ],
};
