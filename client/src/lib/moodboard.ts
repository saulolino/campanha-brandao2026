// ============================================================
// DESIGN: Command Center Militar Verde
// Moodboard — Referências Visuais de Campanhas de Sucesso
// ============================================================

export interface MoodboardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  whyItWorks: string[];
  metrics: string;
  source: string;
  tags: string[];
  format: string;
  color: string;
  lesson: string;
}

export interface MoodboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: MoodboardItem[];
}

export const MOODBOARD_CATEGORIES: MoodboardCategory[] = [
  {
    id: "viral",
    name: "Posts Virais",
    description: "Conteúdos que ultrapassaram 10x o alcance médio",
    icon: "🔥",
    items: [
      {
        id: "v1",
        title: "Antes e Depois de Praça Revitalizada",
        category: "viral",
        description: "Split-screen mostrando praça abandonada vs. revitalizada. Texto overlay com dados de investimento. Transição suave com música emocional.",
        whyItWorks: [
          "Contraste visual imediato gera impacto",
          "Dados concretos dão credibilidade",
          "Formato salvável e compartilhável",
          "Apelo emocional + racional"
        ],
        metrics: "45K views, 3.2K curtidas, 890 compartilhamentos",
        source: "Referência: Campanha de prefeito em Curitiba",
        tags: ["antes-depois", "transformação", "dados"],
        format: "Reels (30s)",
        color: "#2d6a4f",
        lesson: "O formato antes/depois é um dos mais poderosos para mostrar resultados concretos. Use sempre com dados reais."
      },
      {
        id: "v2",
        title: "Pergunta Provocadora com Estatística",
        category: "viral",
        description: "'Você sabia que sua cidade gasta mais com publicidade do que com parques?' — Texto grande, fundo escuro, dado chocante, CTA no final.",
        whyItWorks: [
          "Pergunta gera curiosidade e parada no scroll",
          "Estatística chocante provoca indignação",
          "Formato simples e replicável",
          "Alto potencial de comentários"
        ],
        metrics: "28K views, 2.1K curtidas, 1.2K comentários",
        source: "Referência: Perfis de ativismo ambiental",
        tags: ["pergunta", "estatística", "engajamento"],
        format: "Imagem estática",
        color: "#c9a84c",
        lesson: "Perguntas provocadoras geram 3x mais comentários. Sempre termine com CTA que convide à discussão."
      },
      {
        id: "v3",
        title: "Depoimento Emocional de Morador",
        category: "viral",
        description: "Vídeo de 60s com morador idoso contando como o parque mudou sua vida. Filmagem close, luz natural, sem edição pesada.",
        whyItWorks: [
          "Autenticidade gera conexão emocional",
          "Histórias pessoais são mais memoráveis",
          "Formato humanizado quebra barreira política",
          "Compartilhamento orgânico alto"
        ],
        metrics: "52K views, 4.8K curtidas, 2.1K compartilhamentos",
        source: "Referência: Campanhas de impacto social",
        tags: ["depoimento", "emoção", "autenticidade"],
        format: "Vídeo (60s)",
        color: "#40916c",
        lesson: "Depoimentos reais são o conteúdo mais poderoso. Filme com celular para manter autenticidade."
      },
    ],
  },
  {
    id: "carrossel",
    name: "Carrosséis de Sucesso",
    description: "Carrosséis com alta taxa de salvamento e compartilhamento",
    icon: "📊",
    items: [
      {
        id: "c1",
        title: "Infográfico: 7 Parques que Brasília Precisa",
        category: "carrossel",
        description: "7 slides com foto + mapa + dados de cada parque proposto. Design limpo com ícones e cores consistentes. Último slide com CTA.",
        whyItWorks: [
          "Conteúdo educativo gera salvamentos",
          "Cada slide é autossuficiente",
          "Mapa dá contexto geográfico",
          "CTA no final converte"
        ],
        metrics: "8.5K alcance, 620 salvamentos, 340 compartilhamentos",
        source: "Referência: Perfis de urbanismo",
        tags: ["infográfico", "educativo", "salvável"],
        format: "Carrossel (7 slides)",
        color: "#2d6a4f",
        lesson: "Carrosséis educativos têm 2x mais salvamentos. Cada slide deve funcionar sozinho."
      },
      {
        id: "c2",
        title: "Prestação de Contas Visual",
        category: "carrossel",
        description: "6 slides mostrando resultados do mandato com números grandes, ícones e fotos reais. Fundo escuro, texto claro, dados destacados.",
        whyItWorks: [
          "Transparência gera confiança",
          "Números grandes são impactantes",
          "Fotos reais comprovam ações",
          "Formato profissional"
        ],
        metrics: "12K alcance, 890 curtidas, 45 comentários positivos",
        source: "Referência: Deputados com alta aprovação",
        tags: ["prestação-de-contas", "transparência", "dados"],
        format: "Carrossel (6 slides)",
        color: "#c9a84c",
        lesson: "Prestação de contas visual é essencial para credibilidade. Use números reais e fotos comprobatórias."
      },
      {
        id: "c3",
        title: "Comparativo: Brasília vs. Outras Capitais",
        category: "carrossel",
        description: "5 slides comparando áreas verdes per capita entre capitais brasileiras. Gráficos simples, cores contrastantes, Brasília em destaque.",
        whyItWorks: [
          "Comparação gera debate",
          "Dados visuais são mais impactantes",
          "Posiciona Brasília no contexto nacional",
          "Alto potencial de compartilhamento"
        ],
        metrics: "15K alcance, 1.1K curtidas, 320 comentários",
        source: "Referência: Perfis de dados públicos",
        tags: ["comparativo", "dados", "debate"],
        format: "Carrossel (5 slides)",
        color: "#40916c",
        lesson: "Comparativos entre cidades geram debate e posicionam o candidato como conhecedor do tema."
      },
    ],
  },
  {
    id: "stories",
    name: "Stories Interativos",
    description: "Modelos de stories que geram alta interação",
    icon: "📱",
    items: [
      {
        id: "s1",
        title: "Enquete: Qual Parque Precisa de Mais Atenção?",
        category: "stories",
        description: "Sequência de 5 stories com fotos de parques + enquete em cada. Resultado no dia seguinte com agradecimento.",
        whyItWorks: [
          "Enquetes geram interação direta",
          "Sequência mantém engajamento",
          "Resultado gera expectativa",
          "Dados coletados são úteis"
        ],
        metrics: "85% de participação, 2.3K votos totais",
        source: "Referência: Perfis de engajamento comunitário",
        tags: ["enquete", "interação", "dados"],
        format: "Stories (5 sequência)",
        color: "#2d6a4f",
        lesson: "Enquetes são a ferramenta mais poderosa dos stories. Use para coletar dados e gerar engajamento."
      },
      {
        id: "s2",
        title: "Quiz: Você Conhece os Parques de Brasília?",
        category: "stories",
        description: "8 stories com quiz sobre parques. Cada pergunta com foto e 2 opções. Resposta correta no story seguinte.",
        whyItWorks: [
          "Gamificação prende atenção",
          "Educativo de forma divertida",
          "Alto tempo de permanência",
          "Compartilhamento entre amigos"
        ],
        metrics: "92% de conclusão, 1.8K participantes",
        source: "Referência: Perfis educativos",
        tags: ["quiz", "gamificação", "educativo"],
        format: "Stories (8 sequência)",
        color: "#c9a84c",
        lesson: "Quizzes nos stories têm taxa de conclusão 3x maior que stories normais."
      },
      {
        id: "s3",
        title: "Bastidores: Um Dia na Câmara",
        category: "stories",
        description: "Sequência de stories mostrando rotina real. Desde o café da manhã até votação. Tom casual, sem roteiro.",
        whyItWorks: [
          "Humaniza o político",
          "Mostra trabalho real",
          "Tom casual gera identificação",
          "Cria hábito de acompanhar"
        ],
        metrics: "78% de retenção, 450 respostas diretas",
        source: "Referência: Políticos com alta aprovação digital",
        tags: ["bastidores", "humanização", "rotina"],
        format: "Stories (10+ sequência)",
        color: "#40916c",
        lesson: "Bastidores autênticos geram mais respostas diretas do que qualquer outro formato de stories."
      },
    ],
  },
  {
    id: "tom",
    name: "Tom e Linguagem",
    description: "Exemplos de tom de voz que conectam com o público",
    icon: "💬",
    items: [
      {
        id: "t1",
        title: "Tom Indignado Construtivo",
        category: "tom",
        description: "'Isso não pode continuar assim. Brasília merece mais. E eu sei como mudar.' — Indignação seguida de proposta concreta.",
        whyItWorks: [
          "Indignação gera identificação",
          "Proposta concreta mostra competência",
          "Equilíbrio entre emoção e razão",
          "Posiciona como líder"
        ],
        metrics: "3x mais compartilhamentos que tom neutro",
        source: "Referência: Análise de linguagem política",
        tags: ["tom", "indignação", "proposta"],
        format: "Texto / Legenda",
        color: "#e76f51",
        lesson: "Indignação sem proposta é reclamação. Indignação com proposta é liderança."
      },
      {
        id: "t2",
        title: "Tom Próximo e Acessível",
        category: "tom",
        description: "'Ontem fui ao Parque da Cidade e encontrei a Dona Maria. Ela me contou...' — Narrativa pessoal que conecta.",
        whyItWorks: [
          "Narrativa pessoal gera empatia",
          "Nome próprio humaniza",
          "Tom de conversa, não de discurso",
          "Leitor se sente incluído"
        ],
        metrics: "2x mais comentários que tom formal",
        source: "Referência: Comunicação política moderna",
        tags: ["tom", "proximidade", "narrativa"],
        format: "Texto / Legenda",
        color: "#40916c",
        lesson: "Fale como se estivesse contando para um amigo. Nomes próprios e histórias reais conectam."
      },
      {
        id: "t3",
        title: "Tom Técnico Acessível",
        category: "tom",
        description: "'Em termos simples: para cada R$100 do orçamento, apenas R$0,50 vai para parques.' — Dado complexo simplificado.",
        whyItWorks: [
          "Simplifica sem infantilizar",
          "Dado concreto é memorável",
          "Mostra conhecimento técnico",
          "Fácil de compartilhar"
        ],
        metrics: "4x mais salvamentos que explicação técnica pura",
        source: "Referência: Comunicação de dados públicos",
        tags: ["tom", "técnico", "acessível"],
        format: "Texto / Legenda",
        color: "#2d6a4f",
        lesson: "Traduza dados complexos em analogias do cotidiano. 'Para cada R$100...' é mais poderoso que percentuais."
      },
    ],
  },
];
