import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { Target, AlertTriangle, Palette, CheckCircle2, XCircle } from "lucide-react";

const pillars = [
  { title: "Crescimento Sustentável", description: "Atingir 20.000 seguidores com engajamento genuíno" },
  { title: "Transparência", description: "Comunicar progresso e resultados regularmente" },
  { title: "Comunidade", description: "Fortalecer relacionamento com apoiadores" },
  { title: "Qualidade", description: "Manter padrão alto de conteúdo" },
];

const doRules = [
  "✓ Publicar consistentemente 2+ posts por dia",
  "✓ Responder comentários em até 2 horas",
  "✓ Usar hashtags relevantes (#BrasíliaCidadeParque, #Eduardo2024)",
  "✓ Variar tipos de conteúdo (fotos, vídeos, carrosséis)",
  "✓ Engajar com conteúdo de apoiadores",
  "✓ Publicar nos horários de pico (9h, 14h, 18h, 20h)",
];

const dontRules = [
  "✗ Não postar conteúdo político polarizado",
  "✗ Não ignorar comentários negativos (responder com educação)",
  "✗ Não usar filtros excessivos que descaracterizem a imagem",
  "✗ Não publicar com erros de ortografia",
  "✗ Não fazer promoções enganosas",
  "✗ Não violar direitos autorais de conteúdo",
];

const visualReferences = [
  { color: "#10b981", name: "Verde Esperança", usage: "Crescimento, sucesso, positividade" },
  { color: "#3b82f6", name: "Azul Confiança", usage: "Transparência, profissionalismo" },
  { color: "#f59e0b", name: "Laranja Energia", usage: "Ação, entusiasmo, movimento" },
  { color: "#8b5cf6", name: "Roxo Inovação", usage: "Criatividade, transformação" },
];

export default function Estrategia() {
  return (
    <DashboardLayout activeSection="estrategia">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Estratégia</h1>
          <p className="text-muted-foreground">Defina direção e regras para a campanha</p>
        </div>

        {/* Pilares da Campanha */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Pilares da Campanha</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* O que Fazer */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">O Que Fazer</h2>
          </div>
          <div className="space-y-2">
            {doRules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-green-500/10 rounded border border-green-500/20 text-sm">
                {rule}
              </div>
            ))}
          </div>
        </Card>

        {/* O que Evitar */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">O Que Evitar</h2>
          </div>
          <div className="space-y-2">
            {dontRules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-red-500/10 rounded border border-red-500/20 text-sm">
                {rule}
              </div>
            ))}
          </div>
        </Card>

        {/* Referências Visuais */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Referências Visuais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visualReferences.map((ref, idx) => (
              <div key={idx} className="text-center">
                <div
                  className="w-full h-24 rounded-lg mb-3 border-2 border-primary/10"
                  style={{ backgroundColor: ref.color }}
                />
                <h3 className="font-semibold text-sm mb-1">{ref.name}</h3>
                <p className="text-xs text-muted-foreground">{ref.usage}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Dicas de Design */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Dicas de Design</h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-primary/5 rounded border border-primary/10">
              <p className="font-semibold mb-1">Tipografia</p>
              <p className="text-muted-foreground">Use fontes legíveis e modernas. Evite mais de 2 fontes por post.</p>
            </div>
            <div className="p-3 bg-primary/5 rounded border border-primary/10">
              <p className="font-semibold mb-1">Proporções</p>
              <p className="text-muted-foreground">Posts: 1080x1350px | Stories: 1080x1920px | Reels: 1080x1920px</p>
            </div>
            <div className="p-3 bg-primary/5 rounded border border-primary/10">
              <p className="font-semibold mb-1">Espaçamento</p>
              <p className="text-muted-foreground">Deixe espaço em branco para respiração visual. Não sobrecarregue.</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
