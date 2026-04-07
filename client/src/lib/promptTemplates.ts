/**
 * Templates de prompts pré-definidos para Brasília e campanha
 * Usuários podem usar como base ou customizar
 */

export const PROMPT_TEMPLATES = [
  {
    category: "Brasília - Pontos Turísticos",
    templates: [
      "Pôr do sol em Brasília com vista do Palácio do Planalto",
      "Catedral Metropolitana de Brasília com iluminação noturna",
      "Palácio da Alvorada refletido em lago ao amanhecer",
      "Congresso Nacional de Brasília com arquitetura moderna",
      "Torre de TV de Brasília ao entardecer com cores vibrantes",
      "Esplanada dos Ministérios com céu azul e nuvens brancas",
    ],
  },
  {
    category: "Campanha - Eduardo Brandão",
    templates: [
      "Brasília Cidade Parque - verde, sustentável e moderno",
      "Comunidade unida por Brasília Cidade Parque",
      "Futuro sustentável para Brasília com Eduardo Brandão",
      "Desenvolvimento urbano com respeito à natureza",
      "Brasília verde - parques, áreas verdes e qualidade de vida",
      "Inovação e tradição em Brasília Cidade Parque",
    ],
  },
  {
    category: "Brasília - Natureza",
    templates: [
      "Paisagem verde de Brasília com céu azul",
      "Parques de Brasília com áreas verdes e pessoas",
      "Natureza e arquitetura moderna em harmonia",
      "Lago Paranoá ao entardecer com reflexos dourados",
      "Vegetação do Cerrado de Brasília em cores vibrantes",
    ],
  },
  {
    category: "Brasília - Pessoas e Comunidade",
    templates: [
      "Comunidade de Brasília unida e feliz",
      "Famílias em parques de Brasília",
      "Pessoas celebrando em Brasília",
      "Diversidade e inclusão em Brasília",
      "Vizinhos se conhecendo em Brasília Cidade Parque",
    ],
  },
  {
    category: "Brasília - Arquitetura",
    templates: [
      "Arquitetura moderna de Brasília com linhas geométricas",
      "Edifícios icônicos de Brasília ao amanhecer",
      "Design contemporâneo em Brasília",
      "Estruturas modernas com toque de natureza",
      "Brasília - capital moderna do Brasil",
    ],
  },
  {
    category: "Brasília - Eventos e Celebrações",
    templates: [
      "Festa em Brasília com cores e alegria",
      "Celebração comunitária em Brasília",
      "Evento ao ar livre em Brasília com muitas pessoas",
      "Brasília em festa - cores, luzes e energia",
      "Encontro comunitário em parque de Brasília",
    ],
  },
];

export function getPromptTemplates() {
  return PROMPT_TEMPLATES;
}

export function getTemplatesByCategory(category: string) {
  const categoryData = PROMPT_TEMPLATES.find((c) => c.category === category);
  return categoryData?.templates || [];
}

export function getAllTemplates() {
  return PROMPT_TEMPLATES.flatMap((c) => c.templates);
}
