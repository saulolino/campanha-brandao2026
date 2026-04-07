import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { FolderOpen, TreePine, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const contentItems = [
  {
    id: 1,
    title: "Modelo de Carrossel",
    description: "Template para posts em carrossel com até 10 imagens",
    type: "template",
    icon: Copy,
  },
  {
    id: 2,
    title: "Legendas Inspiradoras",
    description: "Banco de legendas motivacionais e engajadoras",
    type: "template",
    icon: Copy,
  },
  {
    id: 3,
    title: "Hashtags Principais",
    description: "#BrasíliaCidadeParque #Eduardo2024 #Crescimento",
    type: "template",
    icon: Copy,
  },
];

const pillars = [
  { title: "Crescimento", description: "Foco em atingir 20.000 seguidores", color: "bg-green-500/20" },
  { title: "Engajamento", description: "Aumentar interação com a comunidade", color: "bg-blue-500/20" },
  { title: "Transparência", description: "Mostrar progresso e resultados", color: "bg-purple-500/20" },
  { title: "Comunidade", description: "Fortalecer relacionamento com apoiadores", color: "bg-orange-500/20" },
];

export default function Conteudo() {
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout activeSection="conteudo">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conteúdo</h1>
          <p className="text-muted-foreground">Crie e organize materiais para a campanha</p>
        </div>

        {/* Banco de Conteúdo */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Banco de Conteúdo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentItems.map((item) => (
              <div key={item.id} className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{item.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleCopy(item.id, item.description)}
                >
                  {copied === item.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Pilares de Conteúdo */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <TreePine className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Pilares de Conteúdo</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Temas principais que devem guiar todos os posts da campanha
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => (
              <div key={idx} className={`p-4 rounded-lg border border-primary/10 ${pillar.color}`}>
                <h3 className="font-semibold mb-1">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Briefing Criativo */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Briefing Criativo</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Objetivo Principal</h3>
              <p className="text-sm text-muted-foreground">
                Atingir 20.000 seguidores no Instagram com conteúdo de qualidade, engajador e alinhado com os valores da campanha.
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Tom de Voz</h3>
              <p className="text-sm text-muted-foreground">
                Profissional, inspirador, acessível e engajador. Falar diretamente com a comunidade, valorizando a participação de todos.
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Frequência de Posts</h3>
              <p className="text-sm text-muted-foreground">
                Mínimo 2 posts por dia, distribuídos em horários de pico (9h, 14h, 18h e 20h).
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
