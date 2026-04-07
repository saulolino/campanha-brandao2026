import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Heart, MessageCircle, Share2, Eye, Download } from "lucide-react";

interface PostMetric {
  id: number;
  title: string;
  date: string;
  platform: "instagram" | "facebook" | "tiktok";
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement: number;
}

const MOCK_METRICS: PostMetric[] = [
  {
    id: 1,
    title: "Lançamento da Campanha",
    date: "2026-04-05",
    platform: "instagram",
    likes: 1250,
    comments: 89,
    shares: 45,
    views: 8500,
    engagement: 15.2,
  },
  {
    id: 2,
    title: "Dica de Sustentabilidade",
    date: "2026-04-04",
    platform: "instagram",
    likes: 890,
    comments: 56,
    shares: 32,
    views: 5200,
    engagement: 17.1,
  },
  {
    id: 3,
    title: "Entrevista com Candidato",
    date: "2026-04-03",
    platform: "facebook",
    likes: 2100,
    comments: 145,
    shares: 78,
    views: 12000,
    engagement: 18.5,
  },
  {
    id: 4,
    title: "Vídeo de Campanha",
    date: "2026-04-02",
    platform: "tiktok",
    likes: 5600,
    comments: 234,
    shares: 156,
    views: 28500,
    engagement: 20.3,
  },
];

const ENGAGEMENT_DATA = [
  { name: "Seg", engagement: 12.5 },
  { name: "Ter", engagement: 15.2 },
  { name: "Qua", engagement: 14.8 },
  { name: "Qui", engagement: 18.5 },
  { name: "Sex", engagement: 20.3 },
  { name: "Sab", engagement: 16.7 },
  { name: "Dom", engagement: 13.2 },
];

const PLATFORM_DATA = [
  { name: "Instagram", value: 35, color: "#E1306C" },
  { name: "Facebook", value: 45, color: "#1877F2" },
  { name: "TikTok", value: 20, color: "#000000" },
];

export default function PostPerformance() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<"likes" | "comments" | "engagement">("engagement");

  const filteredMetrics = selectedPlatform === "all" 
    ? MOCK_METRICS 
    : MOCK_METRICS.filter(m => m.platform === selectedPlatform);

  const totalMetrics = {
    likes: filteredMetrics.reduce((sum, m) => sum + m.likes, 0),
    comments: filteredMetrics.reduce((sum, m) => sum + m.comments, 0),
    shares: filteredMetrics.reduce((sum, m) => sum + m.shares, 0),
    views: filteredMetrics.reduce((sum, m) => sum + m.views, 0),
    avgEngagement: (filteredMetrics.reduce((sum, m) => sum + m.engagement, 0) / filteredMetrics.length).toFixed(1),
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="analise" onNavigate={() => {}} />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Performance de Posts</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho de suas publicações em tempo real
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-8">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Plataformas</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Curtidas</p>
                  <p className="text-2xl font-bold">{totalMetrics.likes.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Comentários</p>
                  <p className="text-2xl font-bold">{totalMetrics.comments.toLocaleString()}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Compartilhamentos</p>
                  <p className="text-2xl font-bold">{totalMetrics.shares.toLocaleString()}</p>
                </div>
                <Share2 className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Visualizações</p>
                  <p className="text-2xl font-bold">{totalMetrics.views.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Engajamento Médio</p>
                  <p className="text-2xl font-bold">{totalMetrics.avgEngagement}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Engajamento por Dia */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Engajamento por Dia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ENGAGEMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Distribuição por Plataforma */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Distribuição por Plataforma</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={PLATFORM_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {PLATFORM_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tabela de Posts */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Título</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Plataforma</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Curtidas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Comentários</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Compartilhamentos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Visualizações</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Engajamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMetrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{metric.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="capitalize px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                          {metric.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{metric.likes.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{metric.comments.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{metric.shares.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{metric.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-green-400 font-semibold">{metric.engagement}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
