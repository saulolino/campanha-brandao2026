import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";

export default function Metricas() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();

  const handleNavigate = (itemId: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "conteudo": "/conteudo",
      "estrategia": "/estrategia",
      "metricas": "/metricas",
      "projecoes": "/projecoes",
      "configuracoes": "/configuracoes",
    };
    const route = routeMap[itemId] || "/dashboard";
    navigate(route);
  };

  // Mock data
  const engagementData = [
    { day: "Seg", curtidas: 234, comentarios: 45, compartilhamentos: 12 },
    { day: "Ter", curtidas: 456, comentarios: 78, compartilhamentos: 23 },
    { day: "Qua", curtidas: 345, comentarios: 56, compartilhamentos: 18 },
    { day: "Qui", curtidas: 567, comentarios: 89, compartilhamentos: 34 },
    { day: "Sex", curtidas: 678, comentarios: 102, compartilhamentos: 45 },
    { day: "Sab", curtidas: 789, comentarios: 125, compartilhamentos: 56 },
    { day: "Dom", curtidas: 456, comentarios: 67, compartilhamentos: 28 },
  ];

  const growthData = [
    { week: "Sem 1", followers: 14500 },
    { week: "Sem 2", followers: 14750 },
    { week: "Sem 3", followers: 15000 },
    { week: "Sem 4", followers: 15234 },
  ];

  const engagementBreakdown = [
    { name: "Curtidas", value: 65, color: "#ef4444" },
    { name: "Comentários", value: 25, color: "#3b82f6" },
    { name: "Compartilhamentos", value: 10, color: "#10b981" },
  ];

  const topPosts = [
    { id: 1, title: "Reels - Qualidade de Vida", curtidas: 2345, comentarios: 234, compartilhamentos: 156 },
    { id: 2, title: "Carrossel - Infraestrutura", curtidas: 1890, comentarios: 167, compartilhamentos: 89 },
    { id: 3, title: "Stories - Comunidade", curtidas: 1567, comentarios: 145, compartilhamentos: 67 },
  ];

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="metricas" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Métricas</h1>
            </div>
            <p className="text-muted-foreground">Engajamento, performance e indicadores da campanha</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Curtidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.567</div>
                <p className="text-xs text-green-500 mt-1">+12% vs semana anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Comentários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">562</div>
                <p className="text-xs text-green-500 mt-1">+8% vs semana anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  Visualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.456</div>
                <p className="text-xs text-green-500 mt-1">+15% vs semana anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.2%</div>
                <p className="text-xs text-green-500 mt-1">Acima da média</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Engajamento por Dia */}
            <Card>
              <CardHeader>
                <CardTitle>Engajamento por Dia</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="curtidas" fill="#ef4444" />
                    <Bar dataKey="comentarios" fill="#3b82f6" />
                    <Bar dataKey="compartilhamentos" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Crescimento de Seguidores */}
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Seguidores</CardTitle>
                <CardDescription>Últimas 4 semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="followers" stroke="#55c12e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown and Top Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engajamento Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Engajamento</CardTitle>
                <CardDescription>Proporção de interações</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={engagementBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {engagementBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Posts com Melhor Performance</CardTitle>
                <CardDescription>Top 3 da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPosts.map((post) => (
                    <div key={post.id} className="border-b border-border/50 pb-4 last:border-0">
                      <h4 className="font-semibold text-sm mb-2">{post.title}</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>{post.curtidas}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-blue-500" />
                          <span>{post.comentarios}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-purple-500" />
                          <span>{post.compartilhamentos}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
