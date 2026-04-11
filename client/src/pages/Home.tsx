import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Users, Target, TrendingUp, BarChart3, Calendar, Lightbulb,
  Settings, RefreshCw, Heart, MessageCircle, FileText, MapPin, Clock,
  CheckCircle2, XCircle, AlertCircle, CalendarDays, Lock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { InstagramErrorAlert } from "@/components/InstagramErrorAlert";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocalAuth } from "@/hooks/useLocalAuth";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  planejado:  { label: "Planejado",  color: "bg-blue-500/20 text-blue-300 border-blue-500/30",   icon: Clock },
  confirmado: { label: "Confirmado", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle2 },
  realizado:  { label: "Realizado",  color: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: CheckCircle2 },
  cancelado:  { label: "Cancelado",  color: "bg-red-500/20 text-red-300 border-red-500/30",       icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  caminhada: "Caminhada",
  reuniao: "Reunião",
  panfletagem: "Panfletagem",
  visita: "Visita",
  debate: "Debate",
  entrevista: "Entrevista",
  show: "Show",
  outro: "Outro",
};

function formatEventDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

// ─── Vista do Visitante ──────────────────────────────────────────────────────

function VisitorHome() {
  const { user } = useLocalAuth();
  const displayName = user?.nome || user?.name || "Visitante";

  // Buscar próximos eventos (confirmados e planejados)
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 60); // próximos 60 dias

  const { data: events, isLoading } = trpc.streetEvents.list.useQuery({
    limit: 50,
    startDate: now,
    endDate,
  });

  // Filtrar apenas planejados e confirmados (não cancelados)
  const upcomingEvents = (events || []).filter(
    (e) => e.status !== "cancelado"
  ).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const confirmedCount = upcomingEvents.filter((e) => e.status === "confirmado").length;
  const plannedCount = upcomingEvents.filter((e) => e.status === "planejado").length;

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="home" />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">

          {/* Cabeçalho de boas-vindas */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Olá, {displayName.split(" ")[0]}!</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo(a) ao painel da pré campanha Eduardo Brandão</p>
              </div>
            </div>

            {/* Banner de acesso limitado */}
            <div className="mt-4 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Lock size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">Acesso de visitante</p>
                <p className="text-xs text-amber-400/80 mt-0.5">
                  Você está visualizando a agenda de eventos em modo somente leitura.
                  Para acesso completo ao painel, solicite ao administrador que eleve seu nível de acesso.
                </p>
              </div>
            </div>
          </div>

          {/* KPIs resumidos */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : confirmedCount}</p>
                    <p className="text-xs text-muted-foreground">Eventos confirmados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : plannedCount}</p>
                    <p className="text-xs text-muted-foreground">Eventos planejados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de próximos eventos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-green-400" />
              <h2 className="text-lg font-semibold text-foreground">Próximos eventos de rua</h2>
              <span className="text-xs text-muted-foreground">(próximos 60 dias)</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <Card className="border border-border/50">
                <CardContent className="py-12 text-center">
                  <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">Nenhum evento nos próximos 60 dias</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.planejado;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <Card key={event.id} className="border border-border/50 hover:border-border transition-colors">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{event.title}</span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusCfg.color}`}>
                                <StatusIcon size={10} />
                                {statusCfg.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                                {TYPE_LABELS[event.type] || event.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {formatEventDate(event.eventDate)} às {event.eventTime || "09:00"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                {event.neighborhood ? `${event.neighborhood} — ` : ""}{event.location}
                              </span>
                              {(event.expectedAttendees ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users size={11} />
                                  {event.expectedAttendees} esperados
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Vista da Equipe / Coordenador / Superadmin ──────────────────────────────

function TeamHome() {
  const [, navigate] = useLocation();
  const [lastSync, setLastSync] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery(undefined, {
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // atualiza a cada 5 minutos automaticamente
  });

  const syncMutation = trpc.instagram.syncFromAPI.useMutation({
    onSuccess: async (result) => {
      if (result.success) {
        await utils.instagram.getMetrics.invalidate();
        await utils.instagram.getPosts.invalidate();
        await utils.instagram.getGrowth.invalidate();
        await utils.instagram.getEngagementByType.invalidate();
        await utils.instagram.getTopPosts.invalidate();
        const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSync(now);
        setSyncError(null);
      } else {
        setSyncError(result.error || 'Erro desconhecido na sincronização');
      }
    },
    onError: (err) => {
      setSyncError(err.message);
    },
  });

  const handleRefresh = () => {
    setSyncError(null);
    syncMutation.mutate();
  };

  const targetFollowers = 20000;
  const currentFollowers = metrics?.followers || 0;
  const requiredGrowth = Math.max(0, targetFollowers - currentFollowers);
  const totalPosts = metrics?.posts || 0;
  const totalLikes = metrics?.likes || 0;
  const totalComments = metrics?.comments || 0;
  const avgEngagement = totalPosts > 0 ? Math.round((totalLikes + totalComments) / Math.min(totalPosts, 20)) : 0;
  const progressPercentage = (currentFollowers / targetFollowers) * 100;

  useEffect(() => {
    if (metrics) {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSync(now);
    }
  }, [metrics]);

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="home" />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {metricsError && <InstagramErrorAlert error={metricsError as unknown as Error} />}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Painel Principal</h1>
              {metrics?.username ? (
                <p className="text-muted-foreground">
                  <span className="text-primary font-medium">@{metrics.username}</span> — {metrics.name || 'Eduardo Brandão'}
                </p>
              ) : (
                <p className="text-muted-foreground">Visão executiva da pré campanha Eduardo Brandão — Brasília Cidade Parque</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={syncMutation.isPending || metricsLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>

          {/* Status de Sincronização */}
          {syncError && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-400">Erro na sincronização: {syncError}</span>
            </div>
          )}
          {lastSync && !syncError && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-green-600">Dados sincronizados diretamente do Instagram às {lastSync}</span>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : currentFollowers.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Seguindo: {metricsLoading ? '...' : (metrics?.following || 0).toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Meta Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{targetFollowers.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground mt-1">Faltam {requiredGrowth.toLocaleString('pt-BR')} seguidores</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Engajamento Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {metricsLoading ? '...' : avgEngagement.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por post (últimos 20)</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total de Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {metricsLoading ? '...' : totalPosts.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Publicações no perfil</p>
              </CardContent>
            </Card>
          </div>

          {/* Engajamento detalhado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : totalLikes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Curtidas (últimos 20 posts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : totalComments.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">Comentários (últimos 20 posts)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {metricsLoading ? '...' : currentFollowers > 0 ? ((avgEngagement / currentFollowers) * 100).toFixed(2) + '%' : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Taxa de engajamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 border border-border/50">
            <CardHeader>
              <CardTitle>Progresso da Pré campanha</CardTitle>
              <CardDescription>
                {currentFollowers.toLocaleString('pt-BR')} de {targetFollowers.toLocaleString('pt-BR')} seguidores ({progressPercentage.toFixed(1)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>0</span>
                <span>{(targetFollowers / 2).toLocaleString('pt-BR')}</span>
                <span>{targetFollowers.toLocaleString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido aos Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/conteudo")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Conteúdo
                  </CardTitle>
                  <CardDescription>Calendário e cronograma de posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/estrategia")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Estratégia
                  </CardTitle>
                  <CardDescription>Direção e narrativa da pré campanha</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/metricas")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Métricas
                  </CardTitle>
                  <CardDescription>Engajamento e performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/projecoes")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Projeções
                  </CardTitle>
                  <CardDescription>Crescimento e metas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/agenda-rua")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Agenda de Rua
                  </CardTitle>
                  <CardDescription>Eventos e ações presenciais</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/configuracoes")}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações
                  </CardTitle>
                  <CardDescription>Credenciais e preferências</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Acessar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Componente principal — bifurca por role ─────────────────────────────────

export default function Home() {
  const { isVisitor } = usePermissions();
  return isVisitor ? <VisitorHome /> : <TeamHome />;
}
