// ============================================================
// PÁGINA DE APOIADORES — Protocolo de Engajamento
// Simplificada com 6 seções essenciais + logos da pré campanha
// ============================================================

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Eye, Heart, MessageCircle, Share2, Bookmark,
  Shield, Hash, HelpCircle, Copy, Check,
  ChevronDown, ChevronUp, Instagram,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LOGO_COLORIDA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png";

const LOGO_BRANCA =
  "https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-branca-nova_3287b1c2.png";

const PROTOCOLO_STEPS = [
  { icon: Eye,           label: "Assistir",     desc: "Assista ao vídeo ou visualize a imagem por pelo menos 3 segundos antes de interagir." },
  { icon: Heart,         label: "Curtir",       desc: "Curta o post imediatamente. Cada curtida aumenta o alcance orgânico." },
  { icon: MessageCircle, label: "Comentar",     desc: "Deixe um comentário com pelo menos 4 palavras. Comentários curtos contam menos." },
  { icon: Share2,        label: "Compartilhar", desc: "Compartilhe nos Stories ou para um amigo. Isso dobra o alcance do post." },
  { icon: Bookmark,      label: "Salvar",       desc: "Salve o post. O Instagram interpreta isso como conteúdo de alta qualidade." },
];

const ACOES_RAPIDAS = [
  { emoji: "❤️", acao: "Curtir todos os posts",             tempo: "30 seg", impacto: "Alto" },
  { emoji: "💬", acao: "Comentar nos 3 últimos posts",      tempo: "2 min",  impacto: "Muito Alto" },
  { emoji: "📤", acao: "Compartilhar 1 post nos Stories",   tempo: "1 min",  impacto: "Alto" },
  { emoji: "🔖", acao: "Salvar o post mais recente",        tempo: "10 seg", impacto: "Médio" },
  { emoji: "👥", acao: "Marcar 1 amigo nos comentários",    tempo: "1 min",  impacto: "Muito Alto" },
  { emoji: "🔔", acao: "Ativar notificações do perfil",     tempo: "30 seg", impacto: "Permanente" },
];

const REGRAS_OURO = [
  { regra: "Nunca use bots ou automações",   detalhe: "O Instagram detecta e penaliza contas que usam automação. Toda interação deve ser genuína." },
  { regra: "Interaja nas primeiras 2 horas", detalhe: "O algoritmo prioriza posts com engajamento rápido. Quanto antes você interagir, maior o alcance." },
  { regra: "Comentários com 4+ palavras",    detalhe: "Comentários de uma palavra (ex: Ótimo!) têm peso menor. Escreva algo significativo." },
  { regra: "Responda quem te marcar",        detalhe: "Se alguém te marcar num post do Eduardo, responda. Isso cria uma cadeia de engajamento." },
  { regra: "Consistência supera volume",     detalhe: "Interagir todo dia é melhor do que interagir muito em um dia e sumir por uma semana." },
  { regra: "Não compre seguidores",          detalhe: "Seguidores falsos destroem a taxa de engajamento e prejudicam o alcance orgânico real." },
];

const HASHTAGS = {
  principais:  ["#BrasíliaCidadeParque", "#EduardoBrandão", "#BrasíliaVerde", "#DF2026"],
  localizacao: ["#BrasíliaDF", "#DistritoFederal", "#Brasília", "#PoliticaDF", "#VereadorDF"],
  tematicas:   ["#MeioAmbiente", "#Sustentabilidade", "#QualidadeDeVida", "#ParquesUrbanos", "#CidadeInteligente"],
};

const INSPIRACOES = [
  "Brasília merece líderes que amam esta cidade tanto quanto nós! 🌳 #BrasíliaCidadeParque",
  "Cada árvore plantada é um futuro garantido para nossas crianças. Apoio total! 💚",
  "É isso que Brasília precisa: visão, comprometimento e amor pela cidade. Vai Eduardo! 🏙️",
  "Quem cuida do meio ambiente cuida das pessoas. Conte comigo! 🌿",
  "Brasília Cidade Parque não é só um slogan, é um projeto de vida para nossa cidade! ✊",
  "Precisamos de mais políticos que pensam no futuro. Eduardo Brandão é esse nome! 🌱",
  "Compartilhei porque acredito em uma Brasília mais verde e humana! 💙",
];

const FAQS = [
  {
    pergunta: "Com que frequência devo interagir com os posts?",
    resposta: "O ideal é interagir em todos os posts, especialmente nos primeiros 30 minutos após a publicação. Se não conseguir, priorize os 3 posts mais recentes pelo menos 3 vezes por semana.",
  },
  {
    pergunta: "Posso usar o mesmo comentário em vários posts?",
    resposta: "Não. O Instagram detecta comentários repetidos e pode marcar como spam. Varie sempre o texto, mesmo que seja uma pequena mudança.",
  },
  {
    pergunta: "Compartilhar nos Stories ajuda mesmo?",
    resposta: "Sim, muito! Compartilhar nos Stories expõe o post para toda a sua rede de seguidores, podendo multiplicar o alcance por 2 a 5 vezes.",
  },
  {
    pergunta: "Preciso ter muitos seguidores para ajudar?",
    resposta: "Não. Qualquer conta real ajuda. Uma conta com 200 seguidores engajados pode ser mais valiosa do que uma conta com 10.000 seguidores inativos.",
  },
  {
    pergunta: "O que fazer quando um post for atacado nos comentários?",
    resposta: "Não entre em discussões agressivas. Responda com fatos e educação, ou simplesmente curta os comentários positivos para dar mais visibilidade a eles.",
  },
  {
    pergunta: "Como ativar as notificações do perfil do Eduardo?",
    resposta: "Entre no perfil @eduardobrandaopv, toque nos três pontinhos (⋯) no canto superior direito e selecione 'Ativar notificações de posts'. Assim você será avisado a cada novo post.",
  },
];

export default function Apoiadores() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [openFaq,   setOpenFaq]   = useState<number | null>(null);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copiado!", { description: "Texto copiado para a área de transferência." });
  };

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
    toast.success("Hashtag copiada!");
  };

  const impactColor = (imp: string) => {
    if (imp === "Muito Alto") return "text-green-400";
    if (imp === "Alto")       return "text-yellow-400";
    if (imp === "Permanente") return "text-blue-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d1117] via-[#1a2a1a] to-[#0d1117] border-b border-green-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(74,222,128,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-12 text-center">
          <img
            src={LOGO_COLORIDA}
            alt="Brasília Cidade Parque"
            className="h-28 mx-auto mb-6 drop-shadow-lg object-contain"
          />
          <h1 className="text-3xl font-bold text-white mb-3">Protocolo de Engajamento</h1>
          <p className="text-green-300/80 text-lg max-w-2xl mx-auto">
            Guia prático para apoiadores da pré campanha{" "}
            <strong className="text-green-400">@eduardobrandaopv</strong>.
            Cada interação conta para alcançar a meta de{" "}
            <strong className="text-green-400">20.000 seguidores</strong>.
          </p>
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <Badge className="bg-green-900/50 text-green-300 border border-green-700/50 px-3 py-1">🎯 Meta: 20.000 seguidores</Badge>
            <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700/50 px-3 py-1">📱 @eduardobrandaopv</Badge>
            <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-700/50 px-3 py-1">⚡ 5 min/dia fazem diferença</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* 1 — Protocolo de Engajamento */}
        <section>
          <SectionHeader num={1} color="green" title="Protocolo de Engajamento" badge="Sequência obrigatória" />
          <div className="grid gap-3">
            {PROTOCOLO_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#161b22] border border-green-900/30 rounded-xl p-4 hover:border-green-700/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-green-500 font-mono">0{i + 1}</span>
                    <span className="font-semibold text-white">{step.label}</span>
                  </div>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2 — Ações Rápidas */}
        <section>
          <SectionHeader num={2} color="yellow" title="Ações Rápidas" badge="Faça agora" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACOES_RAPIDAS.map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-yellow-900/20 rounded-xl p-4 flex items-center gap-3 hover:border-yellow-700/40 transition-colors">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.acao}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-500">⏱ {item.tempo}</span>
                    <span className={`text-xs font-medium ${impactColor(item.impacto)}`}>↑ {item.impacto}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 — Regras de Ouro */}
        <section>
          <SectionHeader num={3} color="amber" title="Regras de Ouro" badge="Nunca ignore" />
          <div className="grid gap-3">
            {REGRAS_OURO.map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-amber-900/20 rounded-xl p-4 flex items-start gap-3 hover:border-amber-700/40 transition-colors">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{item.regra}</p>
                  <p className="text-xs text-gray-400">{item.detalhe}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — Hashtags Estratégicas */}
        <section>
          <SectionHeader num={4} color="blue" title="Hashtags Estratégicas" badge="Clique para copiar" />
          <div className="space-y-4">
            {[
              { label: "Principais",             tags: HASHTAGS.principais,  color: "green"  as const },
              { label: "Localização & Política", tags: HASHTAGS.localizacao, color: "blue"   as const },
              { label: "Temáticas",              tags: HASHTAGS.tematicas,   color: "purple" as const },
            ].map(({ label, tags, color }) => (
              <div key={label} className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => copyTag(tag)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        color === "green"
                          ? "bg-green-900/30 text-green-300 border-green-700/40 hover:bg-green-800/50"
                          : color === "blue"
                          ? "bg-blue-900/30 text-blue-300 border-blue-700/40 hover:bg-blue-800/50"
                          : "bg-purple-900/30 text-purple-300 border-purple-700/40 hover:bg-purple-800/50"
                      }`}
                    >
                      {copiedTag === tag ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                      {tag.replace("#", "")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5 — Inspiração para Comentários */}
        <section>
          <SectionHeader num={5} color="pink" title="Inspiração para Comentários" badge="Copie e adapte" />
          <div className="grid gap-3">
            {INSPIRACOES.map((texto, i) => (
              <div key={i} className="bg-[#161b22] border border-pink-900/20 rounded-xl p-4 flex items-start gap-3 hover:border-pink-700/40 transition-colors group">
                <MessageCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-gray-300 leading-relaxed">{texto}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyText(texto, i)}
                  className="flex-shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                >
                  {copiedIdx === i ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* 6 — Perguntas Frequentes */}
        <section>
          <SectionHeader num={6} color="cyan" title="Perguntas Frequentes" />
          <div className="space-y-2">
            {FAQS.map((item, i) => (
              <div key={i} className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-white">{item.pergunta}</span>
                  </div>
                  {openFaq === i
                    ? <ChevronUp   className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-gray-800/50">
                    <p className="text-sm text-gray-400 leading-relaxed pt-3">{item.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* QR Code */}
        <section className="text-center">
          <div className="inline-flex flex-col items-center gap-5 bg-[#161b22] border border-green-900/30 rounded-2xl px-10 py-8">
            <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
              <Instagram className="w-5 h-5" />
              <span>Acesse o perfil no Instagram</span>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-lg shadow-green-900/20">
              <QRCodeSVG
                value="https://www.instagram.com/eduardobrandaopv"
                size={180}
                bgColor="#ffffff"
                fgColor="#0d1117"
                level="H"
                imageSettings={{
                  src: LOGO_COLORIDA,
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
            <div>
              <p className="text-white font-bold text-xl">@eduardobrandaopv</p>
              <p className="text-gray-400 text-sm mt-1">Aponte a câmera do celular para seguir</p>
            </div>
            <a
              href="https://www.instagram.com/eduardobrandaopv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              Seguir no Instagram
            </a>
          </div>
        </section>

        {/* Rodapé */}
        <div className="text-center pt-4 pb-8 border-t border-gray-800/50">
          <img
            src={LOGO_COLORIDA}
            alt="Brasília Cidade Parque"
            className="h-20 mx-auto mb-4 opacity-80 object-contain"
          />
          <p className="text-sm text-gray-500">Pré campanha Eduardo Brandão · Brasília Cidade Parque · DF 2026</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  num, color, title, badge,
}: {
  num: number;
  color: "green" | "yellow" | "amber" | "blue" | "pink" | "cyan";
  title: string;
  badge?: string;
}) {
  const bg: Record<string, string> = {
    green: "bg-green-600", yellow: "bg-yellow-600", amber: "bg-amber-600",
    blue: "bg-blue-600", pink: "bg-pink-600", cyan: "bg-cyan-600",
  };
  const badgeCls: Record<string, string> = {
    green:  "bg-green-900/40 text-green-400 border-green-700/40",
    yellow: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
    amber:  "bg-amber-900/40 text-amber-400 border-amber-700/40",
    blue:   "bg-blue-900/40 text-blue-400 border-blue-700/40",
    pink:   "bg-pink-900/40 text-pink-400 border-pink-700/40",
    cyan:   "bg-cyan-900/40 text-cyan-400 border-cyan-700/40",
  };
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-full ${bg[color]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
        {num}
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {badge && <Badge className={`${badgeCls[color]} border text-xs`}>{badge}</Badge>}
    </div>
  );
}
