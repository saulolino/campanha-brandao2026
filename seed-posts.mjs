/**
 * Seed: popula o banco com os posts do plano de comunicação
 * Eduardo Brandão - Brasília Cidade Parque
 *
 * Inclui:
 * 1. Posts históricos de 2026 (já publicados)
 * 2. Posts futuros planejados (abril a outubro 2026)
 */

import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDate(str) {
  return new Date(str + "T12:00:00Z");
}

function nextDayOfWeek(fromDate, dayIndex, hour = "12:00") {
  // dayIndex: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  const d = new Date(fromDate);
  const diff = (dayIndex - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

// ─── Posts históricos (já publicados) ───────────────────────────────────────

const historicalPosts = [
  {
    title: "Feliz Páscoa! Renascimento e esperança",
    scheduledDate: toDate("2026-04-05"),
    scheduledTime: "10:00",
    type: "reels",
    status: "published",
    objective: "Conteúdo Humano — Conexão emocional com o público",
    description: "Post de Páscoa com mensagem de renascimento e esperança para Brasília",
    expectedReach: 500,
    expectedLikes: 80,
    expectedComments: 15,
    caption: "Feliz Páscoa! Que este dia de renascimento traga esperança para Brasília 🌿 #BrasíliaCidadeParque #Páscoa2026",
    hashtags: "#BrasíliaCidadeParque #EduardoBrandão #Páscoa2026 #Esperança",
    notes: "Publicado com 50 curtidas, 7 comentários, alcance 142",
  },
  {
    title: "Causa animal: Hospital Veterinário Público",
    scheduledDate: toDate("2026-04-03"),
    scheduledTime: "14:00",
    type: "carrossel",
    status: "published",
    objective: "Conteúdo de Causa — Mostrar problemas reais de Brasília",
    description: "Carrossel sobre a necessidade de um hospital veterinário público em Brasília",
    expectedReach: 400,
    expectedLikes: 60,
    expectedComments: 10,
    caption: "Brasília precisa de um Hospital Veterinário Público! 🐾 Nossos animais merecem cuidado acessível.",
    hashtags: "#CausaAnimal #BrasíliaCidadeParque #HospitalVeterinário #EduardoBrandão",
    notes: "Publicado com 23 curtidas, 3 comentários, alcance 192",
  },
  {
    title: "Você lembra do seu voto para Deputado Distrital?",
    scheduledDate: toDate("2026-04-03"),
    scheduledTime: "18:00",
    type: "reels",
    status: "published",
    objective: "Conteúdo de Mobilização — Engajamento e chamadas para ação",
    description: "Reels questionando o eleitor sobre seu voto e a importância da escolha certa",
    expectedReach: 800,
    expectedLikes: 100,
    expectedComments: 20,
    caption: "Você lembra do seu voto para Deputado Distrital? Cada voto é uma escolha pelo futuro de Brasília 🗳️",
    hashtags: "#DeputadoDistrital #BrasíliaCidadeParque #EduardoBrandão #Eleições2026",
    notes: "Publicado com 53 curtidas, 4 comentários, alcance 481",
  },
  {
    title: "Defesa do Meio Ambiente é inegociável - PV",
    scheduledDate: toDate("2026-03-27"),
    scheduledTime: "12:00",
    type: "imagem",
    status: "published",
    objective: "Conteúdo de Causa — Posicionamento ambiental",
    description: "Imagem com posicionamento firme do Partido Verde sobre meio ambiente",
    expectedReach: 1000,
    expectedLikes: 50,
    expectedComments: 5,
    caption: "Defesa do Meio Ambiente é inegociável! 🌳 O PV sempre esteve na linha de frente. #PartidoVerde",
    hashtags: "#MeioAmbiente #PartidoVerde #BrasíliaCidadeParque #EduardoBrandão",
    notes: "Publicado com 25 curtidas, 1 comentário, alcance 650, 43 compartilhamentos",
  },
  {
    title: "Boas-vindas ao deputado Bandeira de Mello",
    scheduledDate: toDate("2026-03-27"),
    scheduledTime: "16:00",
    type: "imagem",
    status: "published",
    objective: "Conteúdo Humano — Parcerias e alianças",
    description: "Post de boas-vindas ao novo deputado aliado",
    expectedReach: 400,
    expectedLikes: 40,
    expectedComments: 10,
    caption: "Bem-vindo, deputado Bandeira de Mello! Juntos pelo futuro de Brasília 🤝",
    hashtags: "#BrasíliaCidadeParque #EduardoBrandão #Aliança #CLDF",
    notes: "Publicado com 32 curtidas, 9 comentários, alcance 217",
  },
  {
    title: "Master x BRB - Escândalo",
    scheduledDate: toDate("2026-03-15"),
    scheduledTime: "19:00",
    type: "reels",
    status: "published",
    objective: "Conteúdo de Causa — Denúncia e transparência",
    description: "Reels sobre o escândalo Master x BRB com posicionamento do candidato",
    expectedReach: 1500,
    expectedLikes: 100,
    expectedComments: 25,
    caption: "O escândalo Master x BRB precisa de resposta! A população de Brasília merece transparência 🔍",
    hashtags: "#MasterBRB #Transparência #BrasíliaCidadeParque #EduardoBrandão",
    notes: "Publicado com 85 curtidas, 19 comentários, alcance 717 — POST VIRAL",
  },
  {
    title: "Deputado Israel Batista — Parceria estratégica",
    scheduledDate: toDate("2026-03-14"),
    scheduledTime: "14:00",
    type: "carrossel",
    status: "published",
    objective: "Conteúdo Humano — Parcerias estratégicas",
    description: "Carrossel sobre parceria com deputado Israel Batista",
    expectedReach: 900,
    expectedLikes: 120,
    expectedComments: 12,
    caption: "Juntos pelo Distrito Federal! Parceria com o deputado Israel Batista para um Brasília melhor 💪",
    hashtags: "#IsraelBatista #BrasíliaCidadeParque #EduardoBrandão #CLDF",
    notes: "Publicado com 107 curtidas, 10 comentários, alcance 573 — MELHOR POST",
  },
  {
    title: "Convidando Marina Silva para o PV",
    scheduledDate: toDate("2026-01-31"),
    scheduledTime: "12:00",
    type: "imagem",
    status: "published",
    objective: "Conteúdo de Causa — Posicionamento ambiental nacional",
    description: "Post convidando Marina Silva para o Partido Verde",
    expectedReach: 800,
    expectedLikes: 90,
    expectedComments: 10,
    caption: "Marina Silva, o Partido Verde tem um lugar para você! 🌿 Juntos pelo meio ambiente do Brasil.",
    hashtags: "#MarinaSilva #PartidoVerde #MeioAmbiente #EduardoBrandão",
    notes: "Publicado com 83 curtidas, 7 comentários",
  },
];

// ─── Posts futuros planejados (abr-out 2026) ────────────────────────────────
// Baseados no cronograma semanal: Ter=Viral, Qui=Estratégico, Sab=Mobilização
// + pilares de conteúdo: 40% Causa, 25% Explicação, 20% Humano, 15% Mobilização

const today = new Date("2026-04-08");

const futurePosts = [
  // ── Semana 1 (08-12 abr) ──
  {
    title: "Brasília Cidade Parque: O que significa esse projeto?",
    scheduledDate: new Date("2026-04-09"),
    scheduledTime: "18:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo de Explicação — Apresentar o projeto central da campanha",
    description: "Reels explicando o conceito de Brasília Cidade Parque e o que o candidato propõe",
    expectedReach: 1200,
    expectedLikes: 90,
    expectedComments: 20,
    notes: "POST VIRAL — Usar pergunta provocadora. Horário: terça 18h",
  },
  {
    title: "Áreas verdes de Brasília: dados que você precisa saber",
    scheduledDate: new Date("2026-04-11"),
    scheduledTime: "12:00",
    type: "carrossel",
    status: "scheduled",
    objective: "Conteúdo de Causa — Estatística chocante sobre meio ambiente",
    description: "Carrossel com dados sobre desmatamento e áreas verdes no DF",
    expectedReach: 800,
    expectedLikes: 70,
    expectedComments: 15,
    notes: "Horário: quinta 12h. Usar dados do GDF.",
  },
  {
    title: "Mobilização: Assine a petição pelas áreas verdes",
    scheduledDate: new Date("2026-04-12"),
    scheduledTime: "10:00",
    type: "story",
    status: "scheduled",
    objective: "Conteúdo de Mobilização — Chamada para ação",
    description: "Story com link para petição sobre preservação de áreas verdes no DF",
    expectedReach: 600,
    expectedLikes: 50,
    expectedComments: 10,
    notes: "Horário: sábado 10h. Incluir link na bio.",
  },

  // ── Semana 2 (14-19 abr) ──
  {
    title: "Antes e depois: Parque Olhos D'Água — transformação real",
    scheduledDate: new Date("2026-04-14"),
    scheduledTime: "18:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo Viral — Antes/Depois de espaço público",
    description: "Reels mostrando transformação de parque público com intervenção do candidato",
    expectedReach: 2000,
    expectedLikes: 150,
    expectedComments: 30,
    notes: "ALTO POTENCIAL VIRAL. Horário: terça 18h.",
  },
  {
    title: "Compensação ambiental: como funciona na prática?",
    scheduledDate: new Date("2026-04-16"),
    scheduledTime: "12:00",
    type: "carrossel",
    status: "scheduled",
    objective: "Conteúdo de Explicação — Demonstrar experiência legislativa",
    description: "Carrossel explicando o mecanismo de compensação ambiental e o papel do deputado",
    expectedReach: 700,
    expectedLikes: 60,
    expectedComments: 12,
    notes: "Horário: quinta 12h. Usar linguagem acessível.",
  },
  {
    title: "Eduardo no campo: visita ao Parque Nacional de Brasília",
    scheduledDate: new Date("2026-04-18"),
    scheduledTime: "09:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo Humano — Conexão emocional, candidato em ação",
    description: "Reels mostrando o candidato visitando o Parque Nacional e conversando com moradores",
    expectedReach: 900,
    expectedLikes: 80,
    expectedComments: 18,
    notes: "Horário: sábado 9h. Mostrar lado humano do candidato.",
  },

  // ── Semana 3 (21-26 abr) ──
  {
    title: "Pergunta: Brasília tem parques suficientes?",
    scheduledDate: new Date("2026-04-22"),
    scheduledTime: "18:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo Viral — Pergunta provocadora",
    description: "Reels com pergunta provocadora sobre a quantidade de parques em Brasília",
    expectedReach: 2500,
    expectedLikes: 180,
    expectedComments: 45,
    notes: "MUITO ALTO POTENCIAL VIRAL. Horário: terça 18h. Incentivar comentários.",
  },
  {
    title: "Projeto de lei: Corredor Verde do Eixo Monumental",
    scheduledDate: new Date("2026-04-24"),
    scheduledTime: "12:00",
    type: "carrossel",
    status: "scheduled",
    objective: "Conteúdo de Explicação — Apresentar projeto legislativo concreto",
    description: "Carrossel sobre o projeto de lei do Corredor Verde com detalhes e benefícios",
    expectedReach: 800,
    expectedLikes: 65,
    expectedComments: 14,
    notes: "Horário: quinta 12h. Incluir mapa do corredor.",
  },
  {
    title: "Depoimento: moradora do Lago Sul sobre qualidade de vida",
    scheduledDate: new Date("2026-04-26"),
    scheduledTime: "10:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo Viral — Depoimento emocional",
    description: "Reels com depoimento de moradora sobre como as áreas verdes melhoraram sua vida",
    expectedReach: 1800,
    expectedLikes: 140,
    expectedComments: 35,
    notes: "ALTO POTENCIAL VIRAL. Horário: sábado 10h.",
  },

  // ── Semana 4 (28 abr - 03 mai) ──
  {
    title: "Lançamento oficial: Campanha Brasília Cidade Parque 2026",
    scheduledDate: new Date("2026-04-28"),
    scheduledTime: "18:00",
    type: "reels",
    status: "scheduled",
    objective: "Conteúdo de Mobilização — Lançamento da campanha",
    description: "Reels oficial de lançamento da campanha com manifesto do candidato",
    expectedReach: 3000,
    expectedLikes: 200,
    expectedComments: 50,
    notes: "POST ESTRATÉGICO CRUCIAL. Horário: terça 18h. Impulsionar com R$ 500.",
  },
  {
    title: "Plano de governo: 5 propostas para o meio ambiente do DF",
    scheduledDate: new Date("2026-04-30"),
    scheduledTime: "12:00",
    type: "carrossel",
    status: "scheduled",
    objective: "Conteúdo de Explicação — Plano de governo",
    description: "Carrossel com as 5 principais propostas ambientais do candidato",
    expectedReach: 1000,
    expectedLikes: 85,
    expectedComments: 20,
    notes: "Horário: quinta 12h. Salvar para referência futura.",
  },

  // ── Maio 2026 ──
  {
    title: "Estatística: 60% dos brasilienses querem mais parques",
    scheduledDate: new Date("2026-05-05"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Viral — Estatística chocante",
    description: "Reels com dado de pesquisa sobre demanda por áreas verdes em Brasília",
    expectedReach: 2200,
    expectedLikes: 160,
    expectedComments: 40,
    notes: "Horário: terça 18h. Citar fonte da pesquisa.",
  },
  {
    title: "Behind the scenes: como preparamos um projeto de lei",
    scheduledDate: new Date("2026-05-07"),
    scheduledTime: "12:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Humano — Transparência e processo legislativo",
    description: "Reels mostrando os bastidores do trabalho legislativo do candidato",
    expectedReach: 900,
    expectedLikes: 75,
    expectedComments: 18,
    notes: "Horário: quinta 12h. Mostrar equipe e processo.",
  },
  {
    title: "Desafio: Plante uma árvore por Brasília 🌳",
    scheduledDate: new Date("2026-05-10"),
    scheduledTime: "10:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Viral — Desafio/Trend",
    description: "Reels lançando desafio de plantar árvores e marcar o candidato",
    expectedReach: 3000,
    expectedLikes: 220,
    expectedComments: 60,
    notes: "MUITO ALTO POTENCIAL VIRAL. Horário: sábado 10h. Usar trend.",
  },
  {
    title: "Parceria com influenciador ambiental de Brasília",
    scheduledDate: new Date("2026-05-12"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Humano — Parceria estratégica",
    description: "Reels em parceria com influenciador local sobre meio ambiente",
    expectedReach: 4000,
    expectedLikes: 300,
    expectedComments: 80,
    notes: "Horário: terça 18h. Confirmar parceria com influenciador.",
  },
  {
    title: "Fiscalização: Eduardo visita obra irregular no Lago Norte",
    scheduledDate: new Date("2026-05-19"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Causa — Fiscalização e transparência",
    description: "Reels mostrando o candidato fiscalizando obra irregular em área de preservação",
    expectedReach: 2500,
    expectedLikes: 190,
    expectedComments: 55,
    notes: "Horário: terça 18h. Verificar legalidade antes de publicar.",
  },
  {
    title: "Proposta: Corredor Verde conectando parques do DF",
    scheduledDate: new Date("2026-05-26"),
    scheduledTime: "18:00",
    type: "carrossel",
    status: "draft",
    objective: "Conteúdo de Explicação — Proposta legislativa detalhada",
    description: "Carrossel com mapa e detalhes do projeto Corredor Verde",
    expectedReach: 1200,
    expectedLikes: 95,
    expectedComments: 22,
    notes: "Horário: terça 18h. Incluir infográfico.",
  },

  // ── Junho 2026 ──
  {
    title: "Dia do Meio Ambiente: Brasília, capital verde do Brasil",
    scheduledDate: new Date("2026-06-05"),
    scheduledTime: "08:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Causa — Data comemorativa",
    description: "Reels especial para o Dia Mundial do Meio Ambiente",
    expectedReach: 3500,
    expectedLikes: 250,
    expectedComments: 70,
    notes: "DATA ESTRATÉGICA. Horário: sexta 8h. Impulsionar com R$ 300.",
  },
  {
    title: "Live: Perguntas e respostas sobre o plano de governo",
    scheduledDate: new Date("2026-06-13"),
    scheduledTime: "19:00",
    type: "story",
    status: "draft",
    objective: "Conteúdo de Mobilização — Engajamento direto",
    description: "Live no Instagram para responder perguntas dos seguidores sobre as propostas",
    expectedReach: 1500,
    expectedLikes: 100,
    expectedComments: 200,
    notes: "Horário: sábado 19h. Divulgar com antecedência.",
  },
  {
    title: "Parceria com Partido Verde Nacional: Eduardo e liderança nacional",
    scheduledDate: new Date("2026-06-23"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Humano — Legitimidade e apoio nacional",
    description: "Reels com liderança nacional do PV apoiando a candidatura",
    expectedReach: 2000,
    expectedLikes: 150,
    expectedComments: 35,
    notes: "Horário: terça 18h. Confirmar disponibilidade da liderança.",
  },

  // ── Julho 2026 ──
  {
    title: "Relatório: 3 meses de campanha — resultados reais",
    scheduledDate: new Date("2026-07-07"),
    scheduledTime: "12:00",
    type: "carrossel",
    status: "draft",
    objective: "Conteúdo de Explicação — Prestação de contas",
    description: "Carrossel com balanço dos primeiros 3 meses de campanha",
    expectedReach: 1000,
    expectedLikes: 80,
    expectedComments: 20,
    notes: "Horário: terça 12h. Mostrar crescimento real.",
  },
  {
    title: "Evento presencial: Caminhada pelo Parque da Cidade",
    scheduledDate: new Date("2026-07-19"),
    scheduledTime: "08:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Mobilização — Evento presencial",
    description: "Reels divulgando caminhada pelo Parque da Cidade com o candidato",
    expectedReach: 2000,
    expectedLikes: 160,
    expectedComments: 45,
    notes: "Horário: domingo 8h. Confirmar data e local.",
  },

  // ── Agosto 2026 ──
  {
    title: "100 dias de campanha: Obrigado, Brasília!",
    scheduledDate: new Date("2026-08-04"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo Humano — Marco de campanha",
    description: "Reels comemorando 100 dias de campanha com agradecimento aos seguidores",
    expectedReach: 2500,
    expectedLikes: 200,
    expectedComments: 60,
    notes: "Horário: terça 18h. Marco importante — impulsionar.",
  },
  {
    title: "Debate: Eduardo Brandão vs proposta do adversário",
    scheduledDate: new Date("2026-08-18"),
    scheduledTime: "18:00",
    type: "carrossel",
    status: "draft",
    objective: "Conteúdo de Explicação — Diferenciação",
    description: "Carrossel comparando propostas do candidato com as do adversário",
    expectedReach: 1500,
    expectedLikes: 120,
    expectedComments: 40,
    notes: "Horário: terça 18h. Verificar com assessoria jurídica.",
  },

  // ── Setembro 2026 ──
  {
    title: "Reta final: Faltam 30 dias para as eleições!",
    scheduledDate: new Date("2026-09-06"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Mobilização — Urgência eleitoral",
    description: "Reels marcando a contagem regressiva para as eleições",
    expectedReach: 3000,
    expectedLikes: 220,
    expectedComments: 65,
    notes: "Horário: domingo 18h. IMPULSIONAR com R$ 500.",
  },
  {
    title: "Manifesto final: Brasília Cidade Parque é possível",
    scheduledDate: new Date("2026-09-29"),
    scheduledTime: "18:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Mobilização — Chamada final ao voto",
    description: "Reels manifesto com a visão final do candidato para Brasília",
    expectedReach: 4000,
    expectedLikes: 300,
    expectedComments: 90,
    notes: "Horário: terça 18h. POST MAIS IMPORTANTE DA CAMPANHA. Máximo investimento.",
  },

  // ── Outubro 2026 ──
  {
    title: "Último post antes das eleições: Vote com consciência",
    scheduledDate: new Date("2026-10-03"),
    scheduledTime: "08:00",
    type: "reels",
    status: "draft",
    objective: "Conteúdo de Mobilização — Chamada final ao voto",
    description: "Reels final pedindo voto consciente para Brasília Cidade Parque",
    expectedReach: 5000,
    expectedLikes: 400,
    expectedComments: 120,
    notes: "Horário: sábado 8h. IMPULSIONAR com R$ 1.000.",
  },
];

// ─── Inserção no banco ───────────────────────────────────────────────────────

const allPosts = [...historicalPosts, ...futurePosts];

console.log(`\n🌱 Inserindo ${allPosts.length} posts no banco de dados...\n`);

let inserted = 0;
let errors = 0;

for (const post of allPosts) {
  try {
    await conn.execute(
      `INSERT INTO instagram_posts 
        (title, scheduledDate, scheduledTime, type, status, objective, description,
         expectedReach, expectedLikes, expectedComments, caption, hashtags, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.title,
        post.scheduledDate,
        post.scheduledTime || "12:00",
        post.type || "imagem",
        post.status || "draft",
        post.objective || null,
        post.description || null,
        post.expectedReach || 0,
        post.expectedLikes || 0,
        post.expectedComments || 0,
        post.caption || null,
        post.hashtags || null,
        post.notes || null,
      ]
    );
    console.log(`  ✅ ${post.status.padEnd(12)} | ${post.scheduledDate.toISOString().split("T")[0]} | ${post.title.substring(0, 60)}`);
    inserted++;
  } catch (err) {
    console.error(`  ❌ Erro ao inserir "${post.title}":`, err.message);
    errors++;
  }
}

console.log(`\n✅ Seed concluído: ${inserted} posts inseridos, ${errors} erros.\n`);

await conn.end();
