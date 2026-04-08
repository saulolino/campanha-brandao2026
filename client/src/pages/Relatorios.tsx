import { useState } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Mail, TrendingUp } from "lucide-react";

export default function Relatorios() {
  const { animationClass } = usePageTransition();
  const [selectedMonth, setSelectedMonth] = useState("abril");

  // Dados de crescimento semanal
  const growthData = [
    { week: "Sem 1", followers: 14500, engagement: 7.2 },
    { week: "Sem 2", followers: 14750, engagement: 7.8 },
    { week: "Sem 3", followers: 15000, engagement: 8.3 },
    { week: "Sem 4", followers: 15234, engagement: 8.5 },
  ];

  // Dados de engajamento por tipo
  const contentPerformance = [
    { type: "Reels", posts: 8, avgEngagement: 9.2, totalReach: 12500 },
    { type: "Carrossel", posts: 6, avgEngagement: 7.8, totalReach: 9800 },
    { type: "Stories", posts: 14, avgEngagement: 6.5, totalReach: 8200 },
  ];

  // Dados de distribuição
  const distributionData = [
    { name: "Reels", value: 40, color: "#ef4444" },
    { name: "Carrossel", value: 30, color: "#3b82f6" },
    { name: "Stories", value: 30, color: "#10b981" },
  ];

  const handleDownloadPDF = () => {
    alert("Exportando relatório em PDF...\n\nEm produção, isso geraria um PDF com:\n- Resumo executivo\n- Gráficos de crescimento\n- Análise de engajamento\n- Top posts\n- Recomendações");
  };

  const handleSendEmail = () => {
    alert("Enviando relatório por email...\n\nEm produção, isso enviaria o relatório em PDF para o email configurado.");
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="relatorios" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            </div>
            <p className="text-muted-foreground mb-6">Análise completa da campanha com gráficos e métricas</p>

            {/* Ações */}
            <div className="flex flex-col md:flex-row gap-3">
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar PDF
              </Button>
              <Button variant="outline" onClick={handleSendEmail} className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Enviar por Email
              </Button>
            </div>
          </div>

          <Tabs defaultValue="crescimento" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
            </TabsList>

            {/* Crescimento */}
            <TabsContent value="crescimento" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Seguidores</CardTitle>
                  <CardDescription>Evolução semanal de seguidores e engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="followers" stroke="#3b82f6" name="Seguidores" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#10b981" name="Engajamento (%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Crescimento Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">+734</div>
                    <p className="text-xs text-green-500 mt-1">+5.2% este mês</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Crescimento Médio Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">+183</div>
                    <p className="text-xs text-green-500 mt-1">Por semana</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">1.3%</div>
                    <p className="text-xs text-green-500 mt-1">Semanal</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Projeção Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">+732</div>
                    <p className="text-xs text-green-500 mt-1">Estimado</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Conteúdo</CardTitle>
                    <CardDescription>Proporção de posts por tipo</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance por Tipo</CardTitle>
                    <CardDescription>Engajamento médio e alcance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contentPerformance.map((item) => (
                        <div key={item.type} className="border border-border/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">{item.type}</h4>
                            <span className="text-xs text-muted-foreground">{item.posts} posts</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Engajamento Médio</p>
                              <p className="font-semibold text-primary">{item.avgEngagement}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Alcance Total</p>
                              <p className="font-semibold text-primary">{item.totalReach.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Engajamento por Tipo</CardTitle>
                  <CardDescription>Comparação de performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgEngagement" fill="#3b82f6" name="Engajamento Médio (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resumo Executivo */}
            <TabsContent value="resumo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Executivo - Abril 2026</CardTitle>
                  <CardDescription>Análise consolidada da campanha</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">📊 Métricas Principais</h4>
                      <ul className="space-y-2 text-sm">
                        <li><span className="text-muted-foreground">Seguidores Atuais:</span> <span className="font-semibold">15.234</span></li>
                        <li><span className="text-muted-foreground">Meta Final:</span> <span className="font-semibold">20.000</span></li>
                        <li><span className="text-muted-foreground">Crescimento Necessário:</span> <span className="font-semibold">4.766</span></li>
                        <li><span className="text-muted-foreground">Progresso:</span> <span className="font-semibold">76.2%</span></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">📈 Engajamento</h4>
                      <ul className="space-y-2 text-sm">
                        <li><span className="text-muted-foreground">Taxa de Engajamento:</span> <span className="font-semibold">8.1%</span></li>
                        <li><span className="text-muted-foreground">Total de Curtidas:</span> <span className="font-semibold">12.667</span></li>
                        <li><span className="text-muted-foreground">Total de Comentários:</span> <span className="font-semibold">1.683</span></li>
                        <li><span className="text-muted-foreground">Total de Compartilhamentos:</span> <span className="font-semibold">663</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-semibold mb-3">💡 Recomendações</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>Aumentar frequência de Reels - melhor engajamento (9.2%)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>Manter consistência de posts - 28 posts este mês</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>Focar em conteúdo de qualidade de vida - maior alcance</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">✓</span>
                        <span>Continuar crescimento semanal de ~183 seguidores</span>
                      </li>
                    </ul>
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
