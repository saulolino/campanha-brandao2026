import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: publishedPosts, isLoading, refetch } = trpc.posts.list.useQuery({
    status: "published",
    limit: 100,
  });

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Calcular métricas agregadas
  const metrics = publishedPosts?.reduce(
    (acc: any, post: any) => {
      const likes = post.instagramMetrics?.likes || 0;
      const comments = post.instagramMetrics?.comments || 0;
      const impressions = post.instagramMetrics?.impressions || 0;
      const reach = post.instagramMetrics?.reach || 0;

      return {
        totalLikes: acc.totalLikes + likes,
        totalComments: acc.totalComments + comments,
        totalImpressions: acc.totalImpressions + impressions,
        totalReach: acc.totalReach + reach,
        avgEngagement:
          (acc.totalLikes + acc.totalComments) /
          (publishedPosts.length || 1),
      };
    },
    {
      totalLikes: 0,
      totalComments: 0,
      totalImpressions: 0,
      totalReach: 0,
      avgEngagement: 0,
    }
  ) || {
    totalLikes: 0,
    totalComments: 0,
    totalImpressions: 0,
    totalReach: 0,
    avgEngagement: 0,
  };

  // Dados para gráfico de tendência
  const trendData = publishedPosts?.map((post: any) => ({
    date: new Date(post.publishedAt || new Date()).toLocaleDateString("pt-BR"),
    likes: post.instagramMetrics?.likes || 0,
    comments: post.instagramMetrics?.comments || 0,
    reach: post.instagramMetrics?.reach || 0,
  })) || [];

  // Dados para gráfico de engajamento
  const engagementData = [
    {
      name: "Curtidas",
      value: metrics.totalLikes,
      color: "#ef4444",
    },
    {
      name: "Comentários",
      value: metrics.totalComments,
      color: "#3b82f6",
    },
  ];

  const COLORS = ["#ef4444", "#3b82f6"];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Performance de Posts
              </h1>
              <p className="text-muted-foreground mt-2">
                Análise de métricas dos posts publicados no Instagram
              </p>
            </div>
            <Button
              onClick={handleRefreshMetrics}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Atualizando..." : "Atualizar Métricas"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total de Curtidas
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.totalLikes.toLocaleString("pt-BR")}
                </p>
              </div>
              <Heart size={32} className="text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total de Comentários
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.totalComments.toLocaleString("pt-BR")}
                </p>
              </div>
              <MessageCircle size={32} className="text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Alcance Total
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(metrics.totalReach / 1000).toFixed(1)}K
                </p>
              </div>
              <Eye size={32} className="text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Impressões
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(metrics.totalImpressions / 1000).toFixed(1)}K
                </p>
              </div>
              <TrendingUp size={32} className="text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Tendência */}
          <Card className="lg:col-span-2 p-6 border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Tendência de Engajamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#ef4444"
                  name="Curtidas"
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#3b82f6"
                  name="Comentários"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Pizza */}
          <Card className="p-6 border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuição de Engajamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Lista de Posts Publicados */}
        <Card className="p-6 border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Posts Publicados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Post
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Data
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <Heart size={16} className="inline mr-1" /> Curtidas
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <MessageCircle size={16} className="inline mr-1" /> Comentários
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    <Eye size={16} className="inline mr-1" /> Alcance
                  </th>
                </tr>
              </thead>
              <tbody>
                {publishedPosts?.map((post: any) => (
                  <tr
                    key={post.id}
                    className="border-b border-border hover:bg-muted/50 transition"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {post.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {post.caption}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {post.instagramMetrics?.likes || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {post.instagramMetrics?.comments || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">
                        {(post.instagramMetrics?.reach || 0) / 1000 > 0
                          ? `${((post.instagramMetrics?.reach || 0) / 1000).toFixed(1)}K`
                          : "0"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!publishedPosts || publishedPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum post publicado ainda
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
