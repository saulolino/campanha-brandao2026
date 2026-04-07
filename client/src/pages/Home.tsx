import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Users, Heart, MessageCircle, Eye, Share2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Dados de exemplo para gráficos
const FOLLOWERS_DATA = [
  { date: "Seg", followers: 1200, engagement: 45 },
  { date: "Ter", followers: 1350, engagement: 52 },
  { date: "Qua", followers: 1450, engagement: 48 },
  { date: "Qui", followers: 1580, engagement: 61 },
  { date: "Sex", followers: 1750, engagement: 55 },
  { date: "Sab", followers: 1900, engagement: 72 },
  { date: "Dom", followers: 2050, engagement: 68 },
];

const POSTS_DATA = [
  { name: "Carrossel", value: 35, color: "#10b981" },
  { name: "Vídeo", value: 28, color: "#3b82f6" },
  { name: "Foto", value: 22, color: "#f59e0b" },
  { name: "Story", value: 15, color: "#8b5cf6" },
];

const ENGAGEMENT_DATA = [
  { type: "Curtidas", value: 2450, icon: Heart, color: "text-red-500" },
  { type: "Comentários", value: 380, icon: MessageCircle, color: "text-blue-500" },
  { type: "Compartilhamentos", value: 156, icon: Share2, color: "text-green-500" },
  { type: "Visualizações", value: 12500, icon: Eye, color: "text-purple-500" },
];

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    followers: 2050,
    growth: 12.5,
    posts: 127,
    avgEngagement: 62,
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold">Brasília Cidade Parque</h1>
              <p className="text-xs text-muted-foreground">Painel de Campanha</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bem-vindo, {user.name}! 👋</h2>
          <p className="text-muted-foreground">Acompanhe o desempenho da sua campanha em tempo real</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Seguidores</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-2">{stats.followers.toLocaleString()}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats.growth}% esta semana
            </p>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Posts Publicados</h3>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mb-2">{stats.posts}</p>
            <p className="text-xs text-muted-foreground">Total de publicações</p>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Engajamento Médio</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold mb-2">{stats.avgEngagement}%</p>
            <p className="text-xs text-muted-foreground">Taxa de engajamento</p>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Próxima Semana</h3>
              <MessageCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold mb-2">8</p>
            <p className="text-xs text-muted-foreground">Posts agendados</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Growth Chart */}
          <Card className="lg:col-span-2 p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Crescimento de Seguidores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={FOLLOWERS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Seguidores"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Posts Distribution */}
          <Card className="p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Posts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={POSTS_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {POSTS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Métricas de Engajamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENGAGEMENT_DATA.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.type} className="p-6 border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground">{metric.type}</h4>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Engagement Over Time */}
        <Card className="p-6 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Engajamento ao Longo da Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FOLLOWERS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="engagement" fill="#3b82f6" name="Engajamento (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
}
