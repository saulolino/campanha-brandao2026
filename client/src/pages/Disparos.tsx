/**
 * Página de Disparos WhatsApp
 *
 * Permite que membros da equipe selecionem itens de agenda (posts Instagram
 * e eventos de rua), visualizem a mensagem formatada e disparem para um ou
 * mais grupos de WhatsApp via Whapi.Cloud.
 *
 * Fix: checkboxes usam apenas onCheckedChange; o div pai NÃO tem onClick
 * para evitar duplo disparo (Radix Checkbox já propaga o evento).
 */
import { useState } from "react";
import SidebarNav from "@/components/SidebarNav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Clock,
  Users,
  Calendar,
  MapPin,
  Instagram,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type DispatchType = "diario" | "semanal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Data a definir";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const POST_TYPE_LABELS: Record<string, string> = {
  reels: "Reels",
  carrossel: "Carrossel",
  video: "Vídeo",
  story: "Story",
  imagem: "Imagem",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  caminhada: "Caminhada",
  reuniao: "Reunião",
  panfletagem: "Panfletagem",
  visita: "Visita",
  debate: "Debate",
  entrevista: "Entrevista",
  show: "Show",
  outro: "Evento",
};

const STATUS_COLORS: Record<string, string> = {
  enviado: "bg-green-500/20 text-green-400 border-green-500/30",
  erro: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Disparos() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Estado do formulário
  const [dispatchType, setDispatchType] = useState<DispatchType>("diario");
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  // Múltiplos grupos selecionados: array de { id, name }
  const [selectedGroups, setSelectedGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Estado para controlar envio multi-grupo
  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number } | null>(null);

  // Queries
  const agendaQuery = trpc.whatsapp.getAgendaItems.useQuery({ dispatchType });
  // Apenas grupos favoritos salvos nas Configurações (não todos os grupos da conta)
  const favoriteGroupsQuery = trpc.whatsappSettings.getFavoriteGroups.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const historicoQuery = trpc.whatsapp.getHistorico.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  // Pré-selecionar todos os grupos favoritos automaticamente ao carregar
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const favoriteGroups = favoriteGroupsQuery.data?.groups ?? [];
  if (!favoritesLoaded && favoriteGroups.length > 0 && selectedGroups.length === 0) {
    setSelectedGroups(favoriteGroups);
    setFavoritesLoaded(true);
  }

  // Preview da mensagem — ativado mesmo sem itens selecionados para mostrar template
  const previewQuery = trpc.whatsapp.previewMessage.useQuery(
    {
      dispatchType,
      postIds: selectedPostIds,
      eventIds: selectedEventIds,
    },
    {
      placeholderData: (prev: any) => prev,
    }
  );

  // Mutation de envio (um grupo por vez)
  const sendMutation = trpc.whatsapp.sendDisparo.useMutation({
    onSuccess: () => {
      historicoQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao enviar: ${err.message}`);
    },
  });

  // Verificação de role
  const isTeamOrAbove =
    user?.role === "team" ||
    user?.role === "coordinator" ||
    user?.role === "superadmin";

  if (!isTeamOrAbove) {
    return (
      <div className="flex h-screen bg-[#0a0f0a]">
        <SidebarNav activeSection="disparos" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500">Apenas membros da equipe podem acessar os disparos.</p>
          </div>
        </div>
      </div>
    );
  }

  const posts = agendaQuery.data?.posts ?? [];
  const events = agendaQuery.data?.events ?? [];
  const groups = favoriteGroups; // apenas grupos favoritos salvos nas Configurações
  const historico = historicoQuery.data ?? [];

  const totalSelected = selectedPostIds.length + selectedEventIds.length;
  const previewMessage = previewQuery.data?.message ?? "";
  const canSend = totalSelected > 0 && selectedGroups.length > 0 && !!previewMessage;

  // ── Handlers de seleção ──────────────────────────────────────────────────────
  function togglePost(id: number) {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleEvent(id: number) {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleGroup(group: { id: string; name: string }) {
    setSelectedGroups((prev) => {
      const exists = prev.some((g) => g.id === group.id);
      if (exists) return prev.filter((g) => g.id !== group.id);
      return [...prev, group];
    });
  }

  // ── Envio para múltiplos grupos ──────────────────────────────────────────────
  async function handleSend() {
    if (!canSend) return;
    setSendingProgress({ current: 0, total: selectedGroups.length });
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedGroups.length; i++) {
      const group = selectedGroups[i];
      setSendingProgress({ current: i + 1, total: selectedGroups.length });
      try {
        await sendMutation.mutateAsync({
          dispatchType,
          groupId: group.id,
          groupName: group.name,
          postIds: selectedPostIds,
          eventIds: selectedEventIds,
          message: previewMessage,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setSendingProgress(null);
    setConfirmOpen(false);

    if (errorCount === 0) {
      toast.success(
        `Disparo realizado com sucesso para ${successCount} grupo${successCount > 1 ? "s" : ""}!`
      );
    } else if (successCount > 0) {
      toast.warning(
        `${successCount} enviado${successCount > 1 ? "s" : ""}, ${errorCount} com erro.`
      );
    } else {
      toast.error("Falha ao enviar para todos os grupos.");
    }

    // Reset seleção
    setSelectedPostIds([]);
    setSelectedEventIds([]);
    setSelectedGroups([]);
    historicoQuery.refetch();
  }

  return (
    <div className="flex h-screen bg-[#0a0f0a] overflow-hidden">
      <SidebarNav activeSection="disparos" />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0f0a]/95 backdrop-blur border-b border-[#1a2f1a] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <MessageSquare className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Disparos WhatsApp</h1>
                <p className="text-xs text-gray-400">
                  Selecione itens da agenda e envie para grupos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Seletor de tipo */}
              <div className="flex rounded-lg border border-[#1a2f1a] overflow-hidden">
                <button
                  onClick={() => {
                    setDispatchType("diario");
                    setSelectedPostIds([]);
                    setSelectedEventIds([]);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dispatchType === "diario"
                      ? "bg-green-600 text-white"
                      : "bg-[#0d1a0d] text-gray-400 hover:text-white"
                  }`}
                >
                  Agenda do Dia
                </button>
                <button
                  onClick={() => {
                    setDispatchType("semanal");
                    setSelectedPostIds([]);
                    setSelectedEventIds([]);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dispatchType === "semanal"
                      ? "bg-green-600 text-white"
                      : "bg-[#0d1a0d] text-gray-400 hover:text-white"
                  }`}
                >
                  Agenda da Semana
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => agendaQuery.refetch()}
                className="text-gray-400 hover:text-white"
                disabled={agendaQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${agendaQuery.isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/configuracoes?tab=whatsapp")}
                className="text-gray-400 hover:text-white"
                title="Configurações WhatsApp"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Coluna esquerda: seleção de itens */}
            <div className="xl:col-span-2 space-y-4">
              {/* Posts Instagram */}
              <Card className="bg-[#0d1a0d] border-[#1a2f1a]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-400" />
                    Conteúdo Instagram
                    {selectedPostIds.length > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                        {selectedPostIds.length} selecionado{selectedPostIds.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agendaQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  ) : posts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum post programado para o período selecionado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {posts.map((post) => {
                        const isChecked = selectedPostIds.includes(post.id);
                        return (
                          <label
                            key={post.id}
                            htmlFor={`post-${post.id}`}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                              isChecked
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-[#111a11] border-[#1a2f1a] hover:border-green-500/20"
                            }`}
                          >
                            <Checkbox
                              id={`post-${post.id}`}
                              checked={isChecked}
                              onCheckedChange={() => togglePost(post.id)}
                              className="mt-0.5 border-gray-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white truncate">
                                  {post.title}
                                </span>
                                <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30 text-xs shrink-0">
                                  {POST_TYPE_LABELS[post.type] ?? post.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(post.scheduledDate)}
                                  {post.scheduledTime ? ` às ${post.scheduledTime}` : ""}
                                </span>
                                {post.objective && (
                                  <span className="truncate">🎯 {post.objective}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Eventos de Rua */}
              <Card className="bg-[#0d1a0d] border-[#1a2f1a]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    Agenda de Rua
                    {selectedEventIds.length > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
                        {selectedEventIds.length} selecionado{selectedEventIds.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agendaQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  ) : events.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum evento programado para o período selecionado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event) => {
                        const isChecked = selectedEventIds.includes(event.id);
                        return (
                          <label
                            key={event.id}
                            htmlFor={`event-${event.id}`}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                              isChecked
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-[#111a11] border-[#1a2f1a] hover:border-green-500/20"
                            }`}
                          >
                            <Checkbox
                              id={`event-${event.id}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleEvent(event.id)}
                              className="mt-0.5 border-gray-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white truncate">
                                  {event.title}
                                </span>
                                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs shrink-0">
                                  {EVENT_TYPE_LABELS[event.type] ?? event.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(event.eventDate)}
                                  {event.eventTime ? ` às ${event.eventTime}` : ""}
                                </span>
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {event.location}
                                  {event.neighborhood ? ` — ${event.neighborhood}` : ""}
                                </span>
                                {event.expectedAttendees ? (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.expectedAttendees} pessoas
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita: preview e envio */}
            <div className="space-y-4">
              {/* Preview da mensagem */}
              <Card className="bg-[#0d1a0d] border-[#1a2f1a]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                    Preview da Mensagem
                    {totalSelected > 0 && (
                      <Badge className="bg-gray-700 text-gray-300 border-gray-600 ml-auto text-xs">
                        {totalSelected} item{totalSelected > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewQuery.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    <ScrollArea className="h-56">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {previewMessage || "Selecione itens para visualizar a mensagem."}
                      </pre>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Seletor de grupos — múltipla seleção */}
              <Card className="bg-[#0d1a0d] border-[#1a2f1a]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      Grupos de Destino
                    </CardTitle>
                    {selectedGroups.length > 0 && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {selectedGroups.length} selecionado{selectedGroups.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {favoriteGroupsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                      <span className="ml-2 text-sm text-gray-500">Carregando grupos favoritos...</span>
                    </div>
                  ) : favoriteGroupsQuery.isError ? (
                    <div className="text-center py-4">
                      <XCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                      <p className="text-xs text-red-400">Erro ao carregar grupos favoritos</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Configure os grupos em{"\ "}
                        <button
                          onClick={() => navigate("/configuracoes?tab=whatsapp")}
                          className="text-green-400 underline"
                        >
                          Configurações → WhatsApp
                        </button>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => favoriteGroupsQuery.refetch()}
                        className="mt-2 text-gray-400 hover:text-white"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="text-center py-4">
                      <Users className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Nenhum grupo favorito cadastrado.</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Selecione os grupos em{"\ "}
                        <button
                          onClick={() => navigate("/configuracoes?tab=whatsapp")}
                          className="text-green-400 underline"
                        >
                          Configurações → WhatsApp → Grupos Favoritos
                        </button>
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-48">
                      <div className="space-y-1 pr-2">
                        {groups.map((group: { id: string; name: string; participantsCount: number }) => {
                          const isSelected = selectedGroups.some((g) => g.id === group.id);
                          return (
                            <label
                              key={group.id}
                              htmlFor={`group-${group.id}`}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors select-none ${
                                isSelected
                                  ? "bg-blue-500/10 border-blue-500/30"
                                  : "bg-[#111a11] border-[#1a2f1a] hover:border-blue-500/20"
                              }`}
                            >
                              <Checkbox
                                id={`group-${group.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleGroup(group)}
                                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{group.name}</p>
                                {group.participantsCount > 0 && (
                                  <p className="text-xs text-gray-400">
                                    {group.participantsCount} participantes
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Botão de disparo */}
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    disabled={!canSend || sendMutation.isPending}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {sendMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {sendingProgress
                          ? `Enviando ${sendingProgress.current}/${sendingProgress.total}...`
                          : "Enviando..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {selectedGroups.length > 1
                          ? `Disparar para ${selectedGroups.length} grupos`
                          : "Disparar Mensagem"}
                      </>
                    )}
                  </Button>

                  {!canSend && (
                    <p className="text-xs text-gray-500 text-center">
                      {totalSelected === 0
                        ? "Selecione ao menos um item de agenda"
                        : selectedGroups.length === 0
                        ? "Selecione ao menos um grupo de destino"
                        : "Aguardando preview da mensagem..."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Histórico de disparos */}
          <Card className="bg-[#0d1a0d] border-[#1a2f1a]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Histórico de Disparos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicoQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : historico.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum disparo realizado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {historico.map((item) => {
                    const postIds = JSON.parse(item.includedPostIds ?? "[]") as number[];
                    const eventIds = JSON.parse(item.includedEventIds ?? "[]") as number[];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-[#111a11] border border-[#1a2f1a]"
                      >
                        <div className="mt-0.5">
                          {item.status === "enviado" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">
                              {item.groupName}
                            </span>
                            <Badge
                              className={`text-xs border ${STATUS_COLORS[item.status] ?? ""}`}
                            >
                              {item.status}
                            </Badge>
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 text-xs">
                              {item.dispatchType === "diario" ? "Diário" : "Semanal"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span>{formatDateTime(item.createdAt)}</span>
                            {item.sentByName && <span>por {item.sentByName}</span>}
                            <span>
                              {postIds.length} post{postIds.length !== 1 ? "s" : ""} +{" "}
                              {eventIds.length} evento{eventIds.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {item.errorMessage && (
                            <p className="text-xs text-red-400 mt-1">{item.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-[#0d1a0d] border-[#1a2f1a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-400" />
              Confirmar Disparo
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Revise os detalhes antes de enviar a mensagem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <span className="text-xs text-gray-400">Grupos de destino</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedGroups.map((g) => (
                  <Badge key={g.id} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Tipo de disparo</span>
              <span className="font-medium text-white">
                {dispatchType === "diario" ? "Agenda do Dia" : "Agenda da Semana"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Itens selecionados</span>
              <span className="font-medium text-white">
                {selectedPostIds.length} post{selectedPostIds.length !== 1 ? "s" : ""} +{" "}
                {selectedEventIds.length} evento{selectedEventIds.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Separator className="bg-[#1a2f1a]" />
            <div>
              <p className="text-xs text-gray-400 mb-2">Prévia da mensagem:</p>
              <ScrollArea className="h-40 rounded-md bg-[#111a11] border border-[#1a2f1a] p-3">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {previewMessage}
                </pre>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-[#1a2f1a] text-gray-400 hover:text-white bg-transparent"
              disabled={sendMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {sendingProgress
                    ? `${sendingProgress.current}/${sendingProgress.total}...`
                    : "Enviando..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {selectedGroups.length > 1
                    ? `Enviar para ${selectedGroups.length} grupos`
                    : "Confirmar Envio"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
