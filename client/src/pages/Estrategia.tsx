import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Target, MessageSquare, Zap } from "lucide-react";

export default function Estrategia() {
  const { animationClass } = usePageTransition();

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="estrategia" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Estratégia</h1>
            </div>
            <p className="text-muted-foreground">Direção estratégica, narrativa e objetivos da campanha</p>
          </div>

          <Tabs defaultValue="tema" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tema" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Tema</span>
              </TabsTrigger>
              <TabsTrigger value="narrativa" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Narrativa</span>
              </TabsTrigger>
              <TabsTrigger value="objetivos" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Objetivos</span>
              </TabsTrigger>
            </TabsList>

            {/* Tema da Semana */}
            <TabsContent value="tema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tema da Semana</CardTitle>
                  <CardDescription>Foco principal de comunicação estratégica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">Brasília Cidade Parque: Qualidade de Vida</h3>
                    <p className="text-foreground mb-4">
                      Esta semana destacamos os benefícios de morar em um bairro planejado com infraestrutura completa, áreas verdes e segurança.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-background/50 p-4 rounded">
                        <h4 className="font-semibold text-sm mb-2">Pilares</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Segurança</li>
                          <li>• Infraestrutura</li>
                          <li>• Qualidade de Vida</li>
                        </ul>
                      </div>
                      <div className="bg-background/50 p-4 rounded">
                        <h4 className="font-semibold text-sm mb-2">Público-alvo</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Famílias</li>
                          <li>• Profissionais</li>
                          <li>• Apoiadores</li>
                        </ul>
                      </div>
                      <div className="bg-background/50 p-4 rounded">
                        <h4 className="font-semibold text-sm mb-2">Formato</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Reels</li>
                          <li>• Carrossel</li>
                          <li>• Stories</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Narrativa */}
            <TabsContent value="narrativa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Narrativa da Campanha</CardTitle>
                  <CardDescription>Mensagem central e tom de comunicação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-2">Mensagem Central</h4>
                      <p className="text-muted-foreground">
                        "Brasília Cidade Parque é mais que um endereço, é um estilo de vida pensado para quem valoriza qualidade, segurança e comunidade."
                      </p>
                    </div>

                    <div className="border-l-4 border-accent pl-4">
                      <h4 className="font-semibold mb-2">Tom de Comunicação</h4>
                      <p className="text-muted-foreground">
                        Inspirador, acessível e comunitário. Falamos sobre benefícios reais sem exageros, sempre conectando com as aspirações do público.
                      </p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold mb-2">Diferencial</h4>
                      <p className="text-muted-foreground">
                        Foco em histórias reais de moradores e apoiadores, mostrando como Brasília Cidade Parque melhora a vida das pessoas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Objetivos Estratégicos */}
            <TabsContent value="objetivos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Objetivos Estratégicos</CardTitle>
                  <CardDescription>Metas e direcionamento de comunicação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Aumentar Engajamento</h4>
                        <p className="text-sm text-muted-foreground">Atingir 15% de taxa de engajamento através de conteúdo relevante</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Crescimento de Seguidores</h4>
                        <p className="text-sm text-muted-foreground">Atingir 20.000 seguidores até o final da campanha</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Fortalecer Comunidade</h4>
                        <p className="text-sm text-muted-foreground">Aumentar participação de apoiadores e voluntários</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Viralidade Controlada</h4>
                        <p className="text-sm text-muted-foreground">Criar conteúdo que gere compartilhamentos orgânicos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
