import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Users, Target, TrendingUp, BarChart3, Calendar, Lightbulb,
  Settings, RefreshCw, Heart, MessageCircle, FileText, MapPin, Clock,
  CheckCircle2, XCircle, AlertCircle, CalendarDays, Lock, Timer, Flag, Bell, BellRing,
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

// ─── Card de Contagem Regressiva para a Eleição ─────────────────────────────

function ElectionCountdownCard({ currentFollowers, targetFollowers }: { currentFollowers: number; targetFollowers: number }) {
  const electionDate = useMemo(() => new Date('2026-10-04T00:00:00'), []);
  const today = new Date();
  const msRemaining = electionDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const progressPercentage = targetFollowers > 0 ? Math.min(100, (currentFollowers / targetFollowers) * 100) : 0;

  // Classificar urgência por dias restantes
  const urgency = daysRemaining <= 30 ? 'critical' : daysRemaining <= 90 ? 'warning' : 'normal';
  const urgencyColors = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
    warning:  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    normal:   { bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary', badge: 'bg-primary/10 text-primary border-primary/20' },
  }[urgency];

  return (
    <Card className={`mb-8 border ${urgencyColors.border} ${urgencyColors.bg}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Ícone + Dias */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${urgencyColors.bg} border ${urgencyColors.border}`}>
              <Timer className={`w-7 h-7 ${urgencyColors.text}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Eleição Municipal — 1º Turno</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black ${urgencyColors.text}`}>{daysRemaining}</span>
                <span className="text-lg text-muted-foreground font-medium">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">4 de outubro de 2026</p>
            </div>
          </div>

          {/* Separador */}
          <div className="hidden md:block w-px h-16 bg-border/50" />

          {/* Progresso de Seguidores */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Meta de Seguidores</span>
              </div>
              <Badge variant="outline" className={`text-xs ${urgencyColors.badge}`}>
                {progressPercentage.toFixed(1)}% concluído
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                  urgency === 'critical' ? 'from-red-500 to-red-400' :
                  urgency === 'warning' ? 'from-orange-500 to-orange-400' :
                  'from-primary to-accent'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                <span className={`font-semibold ${urgencyColors.text}`}>{currentFollowers.toLocaleString('pt-BR')}</span> seguidores atuais
              </span>
              <span>Meta: <span className="font-semibold">{targetFollowers.toLocaleString('pt-BR')}</span></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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

// ─── Card de Alerta de Meta Mensal ─────────────────────────────────────────

function MonthlyGoalCard({ currentFollowers, baseFollowers: baseFollowersProp }: { currentFollowers: number; baseFollowers?: number }) {
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth(); // 0-indexed
  const currentYear = today.getFullYear();

  // Crescimentos mensais planejados: Abr-Out/2026
  // Índice 0 = Abril (mês 3), 1 = Maio (mês 4), ..., 6 = Outubro (mês 9)
  const MONTHLY_GROWTHS = [587, 2936, 2936, 3034, 3034, 2936, 3034];
  const MONTH_NAMES = ["Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro"];
  const MONTH_OFFSETS = [3, 4, 5, 6, 7, 8, 9]; // mês do ano (0-indexed)

  // Encontrar o mês atual no plano
  const planIdx = MONTH_OFFSETS.findIndex((m) => m === currentMonth && currentYear === 2026);

  if (planIdx === -1) {
    // Fora do período do plano — não exibir
    return null;
  }

  const plannedGrowth = MONTHLY_GROWTHS[planIdx];
  const monthStart = new Date(2026, currentMonth, 1);
  const daysInMonth = new Date(2026, currentMonth + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const monthProgress = dayOfMonth / daysInMonth; // 0..1

  // Meta esperada até hoje (proporcional)
  const expectedByToday = Math.round(plannedGrowth * monthProgress);

  // Crescimento real no mês: diferença entre hoje e início do mês
  // Usamos currentFollowers como proxy — sem histórico intra-mês, mostramos o delta
  // baseado no planejado vs atual
  const baseFollowers = baseFollowersProp ?? 1541;
  const realGrowthThisMonth = Math.max(0, currentFollowers - baseFollowers);

  const isOnTrack = realGrowthThisMonth >= expectedByToday;
  const delta = realGrowthThisMonth - expectedByToday;

  const statusColor = isOnTrack
    ? "border-green-500/30 bg-green-500/5"
    : "border-amber-500/30 bg-amber-500/5";
  const statusTextColor = isOnTrack ? "text-green-400" : "text-amber-400";
  const statusIcon = isOnTrack ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  const statusLabel = isOnTrack ? "No prazo" : "Atenção";

  return (
    <Card className={`mb-8 border ${statusColor}`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className={`flex items-center gap-2 mb-1 ${statusTextColor}`}>
              {statusIcon}
              <span className="text-sm font-semibold">{statusLabel} — Meta de {MONTH_NAMES[planIdx]}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Crescimento planejado no mês: <strong className="text-foreground">+{plannedGrowth.toLocaleString('pt-BR')} seguidores</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esperado até hoje ({dayOfMonth}/{String(currentMonth + 1).padStart(2, '0')}):
              <strong className="text-foreground ml-1">+{expectedByToday.toLocaleString('pt-BR')}</strong>
              {" "}&nbsp;·&nbsp; Real:
              <strong className={`ml-1 ${isOnTrack ? 'text-green-400' : 'text-amber-400'}`}>+{realGrowthThisMonth.toLocaleString('pt-BR')}</strong>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-2xl font-bold ${isOnTrack ? 'text-green-400' : 'text-amber-400'}`}>
              {delta >= 0 ? '+' : ''}{delta.toLocaleString('pt-BR')}
            </div>
            <div className="text-[11px] text-muted-foreground">{isOnTrack ? 'acima do esperado' : 'abaixo do esperado'}</div>
          </div>
        </div>
        {/* Barra de progresso mensal */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>0</span>
            <span>Meta: +{plannedGrowth.toLocaleString('pt-BR')}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, plannedGrowth > 0 ? (realGrowthThisMonth / plannedGrowth) * 100 : 0)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Vista da Equipe / Coordenador / Superadmin ──────────────────────────────

function TeamHome() {
  const [, navigate] = useLocation();
  const [lastSync, setLastSync] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const { isCoordinator, isSuperAdmin } = usePermissions();
  const canManageAlerts = isCoordinator || isSuperAdmin;

  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.instagram.getMetrics.useQuery(undefined, {
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // atualiza a cada 5 minutos automaticamente
  });

  // Histórico de seguidores para calcular baseFollowers dinâmico (início do mês atual)
  const { data: followersHistory = [] } = trpc.instagram.getFollowersHistory.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Facebook metrics
  const { data: fbMetrics, isLoading: fbLoading } = trpc.facebook.getMetrics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const fbSyncMutation = trpc.facebook.syncPage.useMutation({
    // Invalida TODAS as queries do app ao sincronizar Facebook
    onSuccess: () => utils.invalidate(),
  });

  // Próximas datas eleitorais
  const { data: upcomingElectoral = [] } = trpc.electoralCalendar.getUpcoming.useQuery({ limit: 5 });
  // Alertas eleitorais próximos (próximos 14 dias)
  const { data: upcomingAlerts = [] } = trpc.electoralAlerts.getUpcomingAlerts.useQuery({ days: 14 });
  // Logs de alertas já disparados
  const { data: alertLogs = [] } = trpc.electoralAlerts.getLogs.useQuery({ limit: 10 });
  // Mutation para disparar alertas manualmente
  const checkAlertsMutation = trpc.electoralAlerts.checkAndSend.useMutation({
    onSuccess: (result) => {
      utils.electoralAlerts.getLogs.invalidate();
      utils.electoralAlerts.getUpcomingAlerts.invalidate();
    },
  });

  const ELECTORAL_COLORS: Record<string, { pill: string; dot: string }> = {
    eleicao:    { pill: 'bg-red-900/40 border-red-700 text-red-300',    dot: 'bg-red-500' },
    propaganda: { pill: 'bg-amber-900/40 border-amber-700 text-amber-300', dot: 'bg-amber-500' },
    prazo:      { pill: 'bg-blue-900/40 border-blue-700 text-blue-300',   dot: 'bg-blue-500' },
    legal:      { pill: 'bg-purple-900/40 border-purple-700 text-purple-300', dot: 'bg-purple-500' },
    restricao:  { pill: 'bg-orange-900/40 border-orange-700 text-orange-300', dot: 'bg-orange-500' },
    convencao:  { pill: 'bg-green-900/40 border-green-700 text-green-300',  dot: 'bg-green-500' },
    financeiro: { pill: 'bg-teal-900/40 border-teal-700 text-teal-300',   dot: 'bg-teal-500' },
    tse:        { pill: 'bg-slate-800/40 border-slate-600 text-slate-400', dot: 'bg-slate-500' },
  };

  const syncMutation = trpc.instagram.syncFromAPI.useMutation({
    onSuccess: async (result) => {
      if (result.success) {
        // Invalida TODAS as queries do app para sincronizar todas as paginas abertas
        await utils.invalidate();
        const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastSync(now);
        setSyncError(null);
      } else {
        setSyncError(result.error || 'Erro desconhecido na sincronizacao');
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

  // baseFollowers dinâmico: snapshot mais próximo do início do mês atual no histórico
  const baseFollowers = useMemo(() => {
    if (!followersHistory || followersHistory.length === 0) return 1541; // fallback
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    // Ordenar por data e pegar o registro mais próximo do início do mês (antes ou no dia 1)
    const sorted = [...followersHistory].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // Pegar o último registro antes ou no dia 1 do mês atual
    const beforeMonthStart = sorted.filter(h => new Date(h.date) <= monthStart);
    if (beforeMonthStart.length > 0) {
      return beforeMonthStart[beforeMonthStart.length - 1].followers;
    }
    // Se não houver registro antes do início do mês, usar o mais antigo disponível
    return sorted[0]?.followers ?? 1541;
  }, [followersHistory]);
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
            {/* Instagram Seguidores */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seguidores Instagram
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {metricsLoading ? '...' : currentFollowers.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Seguindo: {metricsLoading ? '...' : (metrics?.following || 0).toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>

            {/* Facebook Card */}
            <Card className="border border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.073h2.54V9.845c0-2.503 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.988C20.343 21.201 24 17.064 24 12.073z"/></svg>
                    Facebook
                  </span>
                  <button
                    onClick={() => fbSyncMutation.mutate()}
                    disabled={fbSyncMutation.isPending}
                    className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title={fbSyncMutation.isPending ? 'Sincronizando via Apify...' : 'Sincronizar dados do Facebook (até 2 min)'}
                  >
                    <RefreshCw className={`w-3 h-3 ${fbSyncMutation.isPending ? 'animate-spin' : ''}`} />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fbLoading ? (
                  <div className="text-3xl font-bold text-blue-400">...</div>
                ) : fbMetrics?.followers ? (
                  <>
                    <div className="text-3xl font-bold text-blue-400">{fbMetrics.followers.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fbMetrics.likes ? `${fbMetrics.likes.toLocaleString('pt-BR')} curtidas` : 'Seguidores na página'}
                  {fbMetrics.pageName && <span className="block text-xs text-muted-foreground/60 truncate">{fbMetrics.pageName}</span>}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">{fbSyncMutation.isPending ? 'Buscando via Apify...' : 'Sem dados'}</div>
                    {!fbSyncMutation.isPending && (
                      <button
                        onClick={() => fbSyncMutation.mutate()}
                        className="text-xs text-blue-400 hover:underline mt-1"
                      >
                        Sincronizar agora
                      </button>
                    )}
                  </>
                )}
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

          {/* Contagem Regressiva para a Eleição */}
          <ElectionCountdownCard currentFollowers={currentFollowers} targetFollowers={targetFollowers} />

          {/* Próximos Marcos Eleitorais */}
          {upcomingElectoral.length > 0 && (
            <Card className="mb-8 border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Próximos Marcos Eleitorais
                </CardTitle>
                <CardDescription>Datas do Calendário Eleitoral TSE 2026</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(upcomingElectoral as any[]).map((ed) => {
                    const today = new Date();
                    const edDate = new Date(ed.date + 'T12:00:00');
                    const daysUntil = Math.ceil((edDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const colors = ELECTORAL_COLORS[ed.category] || ELECTORAL_COLORS.tse;
                    return (
                      <div key={ed.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colors.pill}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{ed.title}</p>
                          <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{ed.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold">{new Date(ed.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                          <p className="text-[10px] opacity-60">{daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil}d`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertas Eleitorais Automáticos */}
          {(upcomingAlerts.length > 0 || alertLogs.length > 0) && (
            <Card className="mb-8 border border-amber-800/40 bg-amber-950/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-400" />
                    Alertas Eleitorais Automáticos
                    {upcomingAlerts.filter((a: any) => !a.alreadySent).length > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-600 text-[10px]">
                        {upcomingAlerts.filter((a: any) => !a.alreadySent).length} pendentes
                      </Badge>
                    )}
                  </CardTitle>
                  {canManageAlerts && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-amber-700 text-amber-300 hover:bg-amber-900/30"
                      onClick={() => checkAlertsMutation.mutate()}
                      disabled={checkAlertsMutation.isPending}
                    >
                      {checkAlertsMutation.isPending ? (
                        <><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Verificando...</>
                      ) : (
                        <><Bell className="w-3 h-3 mr-1" /> Verificar Agora</>
                      )}
                    </Button>
                  )}
                </div>
                <CardDescription>Notificações automáticas 7, 3 e 1 dia antes de marcos críticos</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Alertas pendentes (a disparar nos próximos 14 dias) */}
                {upcomingAlerts.filter((a: any) => !a.alreadySent).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Próximos alertas a disparar</p>
                    <div className="space-y-2">
                      {(upcomingAlerts as any[]).filter((a) => !a.alreadySent).map((alert, idx) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        const alertDate = new Date(alert.alertDate + 'T12:00:00');
                        alertDate.setHours(0,0,0,0);
                        const daysUntil = Math.ceil((alertDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        const urgency = alert.daysBeforeEvent === 1 ? 'border-red-700 bg-red-950/20' :
                          alert.daysBeforeEvent === 3 ? 'border-orange-700 bg-orange-950/20' :
                          'border-amber-700 bg-amber-950/20';
                        const urgencyText = alert.daysBeforeEvent === 1 ? 'text-red-300' :
                          alert.daysBeforeEvent === 3 ? 'text-orange-300' : 'text-amber-300';
                        return (
                          <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${urgency}`}>
                            <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${urgencyText}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{alert.electoralDate.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Alerta {alert.daysBeforeEvent}d antes • Evento em {new Date(alert.electoralDate.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-xs font-bold ${urgencyText}`}>
                                {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil}d`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Alertas já disparados */}
                {alertLogs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alertas disparados recentemente</p>
                    <div className="space-y-1.5">
                      {(alertLogs as any[]).slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{log.electoralTitle}</p>
                            <p className="text-[10px] text-muted-foreground">{log.daysBeforeEvent}d antes • {new Date(log.sentAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <Badge className={`text-[10px] ${log.notificationSent ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-red-900/30 text-red-400 border-red-700'}`}>
                            {log.notificationSent ? 'Enviado' : 'Erro'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {upcomingAlerts.length === 0 && alertLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum alerta nos próximos 14 dias.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
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

          {/* Alerta de Meta Mensal */}
          <MonthlyGoalCard currentFollowers={currentFollowers} baseFollowers={baseFollowers} />

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
