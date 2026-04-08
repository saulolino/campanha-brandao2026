import { useState } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Heart, MessageCircle, Share2, TrendingUp, Filter } from "lucide-react";

export default function Metricas() {
  const { animationClass } = usePageTransition();
  const [period, setPeriod] = useState("semanal");
  const [contentType, setContentType] = useState("todos");

  // Dados por período
  const dataByPeriod = {
    semanal: [
      { day: "Seg", curtidas: 234, comentarios: 45, compartilhamentos: 12 },
      { day: "Ter", curtidas: 456, comentarios: 78, compartilhamentos: 23 },
      { day: "Qua", curtidas: 345, comentarios: 56, compartilhamentos: 18 },
      { day: "Qui", curtidas: 567, comentarios: 89, compartilhamentos: 34 },
      { day: "Sex", curtidas: 678, comentarios: 102, compartilhamentos: 45 },
      { day: "Sab", curtidas: 789, comentarios: 125, compartilhamentos: 56 },
      { day: "Dom", curtidas: 456, comentarios: 67, compartilhamentos: 28 },
    ],
    mensal: [
      { week: "Sem 1", curtidas: 2100, comentarios: 350, compartilhamentos: 180 },
      { week: "Sem 2", curtidas: 2800, comentarios: 420, compartilhamentos: 240 },
      { week: "Sem 3", curtidas: 3200, comentarios: 480, compartilhamentos: 290 },
      { week: "Sem 4", curtidas: 3567, comentarios: 510, compartilhamentos: 340 },
    ],
  };

  // Dados por tipo de conteúdo
  const contentTypeData = {
    todos: [
      { name: "Curtidas", value: 65, color: "#ef4444" },
      { name: "Comentários", value: 25, color: "#3b82f6" },
      { name: "Compartilhamentos", value: 10, color: "#10b981" },
    ],
    reels: [
      { name: "Curtidas", value: 72, color: "#ef4444" },
      { name: "Comentários", value: 18, color: "#3b82f6" },
      { name: "Compartilhamentos", value: 10, color: "#10b981" },
    ],
    carrossel: [
      { name: "Curtidas", value: 58, color: "#ef4444" },
      { name: "Comentários", value: 32, color: "#3b82f6" },
      { name: "Compartilhamentos", value: 10, color: "#10b981" },
    ],
    stories: [
      { name: "Curtidas", value: 45, color: "#ef4444" },
      { name: "Comentários", value: 35, color: "#3b82f6" },
      { name: "Compartilhamentos", value: 20, color: "#10b981" },
    ],
  };

  const topPostsByType = {
    todos: [
      { id: 1, title: "Reels - Qualidade de Vida", type: "Reel", curtidas: 2345, comentarios: 234, compartilhamentos: 156 },
      { id: 2, title: "Carrossel - Infraestrutura", type: "Carrossel", curtidas: 1890, comentarios: 167, compartilhamentos: 89 },
      { id: 3, title: "Stories - Comunidade", type: "Story", curtidas: 1567, comentarios: 145, compartilhamentos: 67 },
    ],
    reels: [
      { id: 1, title: "Qualidade de Vida em BCP", type: "Reel", curtidas: 2345, comentarios: 234, compartilhamentos: 156 },
      { id: 4, title: "Segurança e Bem-estar", type: "Reel", curtidas: 1876, comentarios: 198, compartilhamentos: 145 },
    ],
    carrossel: [
      { id: 2, title: "Infraestrutura do Bairro", type: "Carrossel", curtidas: 1890, comentarios: 167, compartilhamentos: 89 },
      { id: 5, title: "Depoimentos de Moradores", type: "Carrossel", curtidas: 1654, comentarios: 142, compartilhamentos: 78 },
    ],
    stories: [
      { id: 3, title: "Comunidade em Ação", type: "Story", curtidas: 1567, comentarios: 145, compartilhamentos: 67 },
      { id: 6, title: "Domingo em Família", type: "Story", curtidas: 1234, comentarios: 98, compartilhamentos: 45 },
    ],
  };

  const engagementData = period === "semanal" ? dataByPeriod.semanal : dataByPeriod.mensal;
  const breakdownData = contentTypeData[contentType as keyof typeof contentTypeData] || contentTypeData.todos;
  const topPosts = topPostsByType[contentType as keyof typeof topPostsByType] || topPostsByType.todos;

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="metricas" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Métricas</h1>
            </div>
            <p className="text-muted-foreground mb-6">Engajamento, performance e indicadores da campanha</p>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-2 block">Período</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo de Conteúdo</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="carrossel">Carrossel</SelectItem>
                    <SelectItem value="stories">Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Total de Curtidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {engagementData.reduce((sum: number, item: any) => sum + item.curtidas, 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-500 mt-1">+8% vs período anterior</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Total de Comentários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  {engagementData.reduce((sum: number, item: any) => sum + item.comentarios, 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-500 mt-1">+12% vs período anterior</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-green-500" />
                  Total de Compartilhamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {engagementData.reduce((sum: number, item: any) => sum + item.compartilhamentos, 0).toLocaleString()}
                </div>
                <p className="text-xs text-green-500 mt-1">+15% vs período anterior</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="engajamento" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
              <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
              <TabsTrigger value="topPosts">Top Posts</TabsTrigger>
            </TabsList>

            {/* Engajamento */}
            <TabsContent value="engajamento" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engajamento por {period === "semanal" ? "Dia" : "Semana"}</CardTitle>
                  <CardDescription>Curtidas, comentários e compartilhamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={period === "semanal" ? "day" : "week"} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="curtidas" fill="#ef4444" name="Curtidas" />
                      <Bar dataKey="comentarios" fill="#3b82f6" name="Comentários" />
                      <Bar dataKey="compartilhamentos" fill="#10b981" name="Compartilhamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Distribuição */}
            <TabsContent value="distribuicao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Engajamento</CardTitle>
                  <CardDescription>Proporção de curtidas, comentários e compartilhamentos</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {breakdownData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Posts */}
            <TabsContent value="topPosts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Posts</CardTitle>
                  <CardDescription>Posts com melhor performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPosts.map((post: any) => (
                      <div key={post.id} className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{post.title}</h4>
                            <p className="text-xs text-muted-foreground">{post.type}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm">{post.curtidas.toLocaleString()} curtidas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{post.comentarios.toLocaleString()} comentários</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{post.compartilhamentos.toLocaleString()} compartilhamentos</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
