// ============================================================
// PROPOSTAS DE PAUTA
// Qualquer membro da equipe pode propor conteúdo ou evento de rua.
// O coordenador aprova ou rejeita, convertendo em item real.
// ============================================================
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import SidebarNav from "@/components/SidebarNav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Users,
  Tag,
  MessageSquare,
  Eye,
  Trash2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type ProposalType = "conteudo" | "evento_rua";
type ProposalStatus = "pendente" | "aprovado" | "rejeitado";

interface ContentForm {
  title: string;
  description: string;
  notes: string;
  suggestedDate: Date | undefined;
  contentTypes: string[];  // múltipla seleção
  objectives: string[];   // múltipla seleção
  caption: string;
  hashtags: string;
  referenceUrls: string;
}

interface EventForm {
  title: string;
  description: string;
  notes: string;
  suggestedDate: Date | undefined;
  eventType: "caminhada" | "reuniao" | "panfletagem" | "visita" | "debate" | "entrevista" | "show" | "outro" | "";
  location: string;
  neighborhood: string;
  city: string;
  eventTime: string;
  endTime: string;
  expectedAttendees: string;
}

const defaultContentForm: ContentForm = {
  title: "", description: "", notes: "", suggestedDate: undefined,
  contentTypes: [], objectives: [], caption: "", hashtags: "", referenceUrls: "",
};

const defaultEventForm: EventForm = {
  title: "", description: "", notes: "", suggestedDate: undefined,
  eventType: "", location: "", neighborhood: "", city: "Brasília",
  eventTime: "09:00", endTime: "", expectedAttendees: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Clock className="w-3 h-3" /> },
  aprovado: { label: "Aprovado", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  rejeitado: { label: "Rejeitado", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  reels: "Reels", carrossel: "Carrossel", video: "Vídeo", story: "Story", imagem: "Imagem",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  caminhada: "Caminhada", reuniao: "Reunião", panfletagem: "Panfletagem",
  visita: "Visita", debate: "Debate", entrevista: "Entrevista", show: "Show", outro: "Outro",
};

const OBJECTIVE_OPTIONS = [
  { value: "awareness", label: "Conscientização" },
  { value: "engajamento", label: "Engajamento" },
  { value: "humanização", label: "Humanização" },
  { value: "mobilização", label: "Mobilização" },
  { value: "prestacao_contas", label: "Prestação de Contas" },
  { value: "urgencia", label: "Urgência / Alerta" },
  { value: "comemorativo", label: "Comemorativo" },
  { value: "outro", label: "Outro" },
];

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Propostas() {
  const { user } = useAuth();
  const isCoordinator = user?.role === "coordinator" || user?.role === "superadmin";
  const isTeam = user?.role === "team" || isCoordinator;

  // Filtros da lista
  const [filterStatus, setFilterStatus] = useState<"todas" | ProposalStatus>("todas");
  const [filterType, setFilterType] = useState<"todas" | ProposalType>("todas");
  const [activeTab, setActiveTab] = useState<"lista" | "nova">("lista");

  // Modal de nova proposta
  const [proposalType, setProposalType] = useState<ProposalType>("conteudo");
  const [contentForm, setContentForm] = useState<ContentForm>(defaultContentForm);
  const [eventForm, setEventForm] = useState<EventForm>(defaultEventForm);

  // Modal de detalhe / revisão
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  // Modal de detalhe (visualização)
  const [detailId, setDetailId] = useState<number | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: proposals = [], isLoading, refetch } = trpc.proposals.list.useQuery({
    status: filterStatus,
    proposalType: filterType,
  });

  const { data: detailProposal } = trpc.proposals.getById.useQuery(
    { id: detailId! },
    { enabled: detailId !== null }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();

  const createMutation = trpc.proposals.create.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setContentForm(defaultContentForm);
      setEventForm(defaultEventForm);
      setActiveTab("lista");
      utils.proposals.list.invalidate();
      utils.proposals.countPending.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const approveMutation = trpc.proposals.approve.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setReviewModalOpen(false);
      setReviewNotes("");
      utils.proposals.list.invalidate();
      utils.proposals.countPending.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.proposals.reject.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setReviewModalOpen(false);
      setReviewNotes("");
      utils.proposals.list.invalidate();
      utils.proposals.countPending.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.proposals.delete.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.proposals.list.invalidate();
      utils.proposals.countPending.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Submit de nova proposta ──────────────────────────────────────────────────
  const handleSubmitContent = () => {
    if (!contentForm.title || !contentForm.description || !contentForm.suggestedDate ||
        contentForm.contentTypes.length === 0 || contentForm.objectives.length === 0 || !contentForm.caption) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    // Serializa arrays como string separada por vírgula
    const primaryContentType = contentForm.contentTypes[0] as "reels" | "carrossel" | "video" | "story" | "imagem";
    const objectiveStr = contentForm.objectives.join(",");
    createMutation.mutate({
      proposalType: "conteudo",
      title: contentForm.title,
      description: contentForm.description,
      notes: contentForm.notes || undefined,
      suggestedDate: contentForm.suggestedDate,
      contentType: primaryContentType,
      objective: objectiveStr,
      caption: contentForm.caption,
      hashtags: contentForm.hashtags || undefined,
      referenceUrls: contentForm.referenceUrls || undefined,
    });
  };

  const handleSubmitEvent = () => {
    if (!eventForm.title || !eventForm.description || !eventForm.suggestedDate ||
        !eventForm.eventType || !eventForm.location || !eventForm.neighborhood ||
        !eventForm.eventTime || !eventForm.expectedAttendees) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    createMutation.mutate({
      proposalType: "evento_rua",
      title: eventForm.title,
      description: eventForm.description,
      notes: eventForm.notes || undefined,
      suggestedDate: eventForm.suggestedDate,
      eventType: eventForm.eventType as "caminhada" | "reuniao" | "panfletagem" | "visita" | "debate" | "entrevista" | "show" | "outro",
      location: eventForm.location,
      neighborhood: eventForm.neighborhood,
      city: eventForm.city,
      eventTime: eventForm.eventTime,
      endTime: eventForm.endTime || undefined,
      expectedAttendees: parseInt(eventForm.expectedAttendees),
    });
  };

  // ── Revisão ──────────────────────────────────────────────────────────────────
  const openReview = (id: number, action: "approve" | "reject") => {
    setSelectedId(id);
    setReviewAction(action);
    setReviewNotes("");
    setReviewModalOpen(true);
  };

  const handleReview = () => {
    if (!selectedId || !reviewAction) return;
    if (reviewAction === "approve") {
      approveMutation.mutate({ id: selectedId, reviewNotes: reviewNotes || undefined });
    } else {
      if (!reviewNotes.trim() || reviewNotes.trim().length < 5) {
        toast.error("Informe o motivo da rejeição (mín. 5 caracteres).");
        return;
      }
      rejectMutation.mutate({ id: selectedId, reviewNotes });
    }
  };

  // ── Contadores ───────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    pendente: proposals.filter(p => p.status === "pendente").length,
    aprovado: proposals.filter(p => p.status === "aprovado").length,
    rejeitado: proposals.filter(p => p.status === "rejeitado").length,
  }), [proposals]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0f0a] text-white overflow-hidden">
      <SidebarNav activeSection="propostas" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d130d]">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4ade80]" />
              Propostas de Pauta
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              {isCoordinator
                ? "Revise e aprove propostas da equipe para transformá-las em agenda real."
                : "Proponha conteúdos ou eventos de rua para aprovação do coordenador."}
            </p>
          </div>
          {isTeam && (
            <Button
              onClick={() => setActiveTab("nova")}
              className="bg-[#4ade80] text-black hover:bg-[#22c55e] font-semibold text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Nova Proposta
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "lista" | "nova")}>
            <div className="px-6 pt-4">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="lista" className="data-[state=active]:bg-[#4ade80]/20 data-[state=active]:text-[#4ade80]">
                  Lista de Propostas
                  {counts.pendente > 0 && isCoordinator && (
                    <span className="ml-2 bg-amber-500 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {counts.pendente}
                    </span>
                  )}
                </TabsTrigger>
                {isTeam && (
                  <TabsTrigger value="nova" className="data-[state=active]:bg-[#4ade80]/20 data-[state=active]:text-[#4ade80]">
                    Nova Proposta
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* ── Aba: Lista ────────────────────────────────────────────────── */}
            <TabsContent value="lista" className="px-6 pb-6 mt-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-3 mb-5">
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2a1a] border-white/10 text-white">
                    <SelectItem value="todas">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2a1a] border-white/10 text-white">
                    <SelectItem value="todas">Todos os tipos</SelectItem>
                    <SelectItem value="conteudo">Conteúdo (Post)</SelectItem>
                    <SelectItem value="evento_rua">Evento de Rua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cards de resumo (apenas coordenador) */}
              {isCoordinator && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {(["pendente", "aprovado", "rejeitado"] as ProposalStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(filterStatus === s ? "todas" : s)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        filterStatus === s ? "ring-1 ring-[#4ade80]" : ""
                      } ${STATUS_CONFIG[s].color}`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
                        {STATUS_CONFIG[s].icon}
                        {STATUS_CONFIG[s].label}
                      </div>
                      <div className="text-2xl font-bold">{counts[s]}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Lista */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-[#4ade80]" />
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma proposta encontrada.</p>
                  {isTeam && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-white/20 text-white/60 hover:text-white"
                      onClick={() => setActiveTab("nova")}
                    >
                      Criar primeira proposta
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((p) => {
                    const status = p.status as ProposalStatus;
                    const cfg = STATUS_CONFIG[status];
                    const isContent = p.proposalType === "conteudo";
                    const isOwner = p.proposedById === user?.id;

                    return (
                      <div
                        key={p.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Tipo + Status */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                isContent
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
                                  : "bg-orange-500/15 text-orange-300 border-orange-500/25"
                              }`}>
                                {isContent ? <FileText className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {isContent ? "Conteúdo" : "Evento de Rua"}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                {cfg.icon}
                                {cfg.label}
                              </span>
                              {isContent && p.contentType && (
                                <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                  {CONTENT_TYPE_LABELS[p.contentType]}
                                </span>
                              )}
                              {!isContent && p.eventType && (
                                <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                  {EVENT_TYPE_LABELS[p.eventType]}
                                </span>
                              )}
                            </div>

                            {/* Título */}
                            <h3 className="font-semibold text-white text-sm mb-1 truncate">{p.title}</h3>

                            {/* Metadados */}
                            <div className="flex items-center gap-4 text-[11px] text-white/40 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(p.suggestedDate)}
                              </span>
                              {!isContent && p.neighborhood && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {p.neighborhood}
                                </span>
                              )}
                              {isContent && p.objective && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {OBJECTIVE_OPTIONS.find(o => o.value === p.objective)?.label ?? p.objective}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {p.proposedByName ?? "Equipe"}
                              </span>
                            </div>

                            {/* Notas de revisão */}
                            {status !== "pendente" && p.reviewNotes && (
                              <div className={`mt-2 text-[11px] px-2.5 py-1.5 rounded-lg border ${
                                status === "aprovado"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                  : "bg-red-500/10 border-red-500/20 text-red-300"
                              }`}>
                                <span className="font-medium">{p.reviewedByName}:</span> {p.reviewNotes}
                              </div>
                            )}
                            {status === "aprovado" && p.convertedItemId && (
                              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                {isContent ? `Post #${p.convertedItemId} criado` : `Evento #${p.convertedItemId} criado`}
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-white/40 hover:text-white hover:bg-white/10"
                              onClick={() => setDetailId(p.id)}
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Ações do coordenador */}
                            {isCoordinator && status === "pendente" && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                                  onClick={() => openReview(p.id, "approve")}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-medium"
                                  onClick={() => openReview(p.id, "reject")}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}

                            {/* Excluir (proponente, se pendente) */}
                            {(isOwner || isCoordinator) && status === "pendente" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => {
                                  if (confirm("Excluir esta proposta?")) {
                                    deleteMutation.mutate({ id: p.id });
                                  }
                                }}
                                title="Excluir proposta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Aba: Nova Proposta ─────────────────────────────────────────── */}
            {isTeam && (
              <TabsContent value="nova" className="px-6 pb-6 mt-4">
                <div className="max-w-2xl mx-auto">
                  {/* Seletor de tipo */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setProposalType("conteudo")}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        proposalType === "conteudo"
                          ? "border-[#4ade80] bg-[#4ade80]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <FileText className={`w-6 h-6 mb-2 ${proposalType === "conteudo" ? "text-[#4ade80]" : "text-white/40"}`} />
                      <div className="font-semibold text-sm text-white">Conteúdo</div>
                      <div className="text-[11px] text-white/40 mt-0.5">Post para o Instagram (Reels, Carrossel, Imagem...)</div>
                    </button>
                    <button
                      onClick={() => setProposalType("evento_rua")}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        proposalType === "evento_rua"
                          ? "border-orange-400 bg-orange-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <MapPin className={`w-6 h-6 mb-2 ${proposalType === "evento_rua" ? "text-orange-400" : "text-white/40"}`} />
                      <div className="font-semibold text-sm text-white">Evento de Rua</div>
                      <div className="text-[11px] text-white/40 mt-0.5">Caminhada, reunião, panfletagem, visita...</div>
                    </button>
                  </div>

                  {/* Formulário de Conteúdo */}
                  {proposalType === "conteudo" && (
                    <div className="space-y-4">
                      <SectionTitle>Identificação</SectionTitle>
                      <Field label="Título da pauta *" hint="O que é esse conteúdo?">
                        <Input
                          value={contentForm.title}
                          onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Ex: Visita ao Parque Olhos d'Água — antes e depois"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>
                      <Field label="Descrição / Contexto *" hint="Por que esse conteúdo é relevante agora?">
                        <Textarea
                          value={contentForm.description}
                          onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Explique o contexto, a oportunidade ou o fato que motivou a proposta..."
                          rows={3}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                      </Field>

                      <SectionTitle>Especificações do Post</SectionTitle>

                      {/* Seleção múltipla de formatos */}
                      <Field label="Formato(s) *" hint="Selecione um ou mais">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => {
                            const selected = contentForm.contentTypes.includes(v);
                            return (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setContentForm(f => ({
                                  ...f,
                                  contentTypes: selected
                                    ? f.contentTypes.filter(t => t !== v)
                                    : [...f.contentTypes, v],
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  selected
                                    ? "bg-[#4ade80]/20 border-[#4ade80]/60 text-[#4ade80]"
                                    : "bg-white/5 border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                {l}
                              </button>
                            );
                          })}
                        </div>
                        {contentForm.contentTypes.length === 0 && (
                          <p className="text-[11px] text-white/30 mt-1">Nenhum formato selecionado</p>
                        )}
                      </Field>

                      {/* Seleção múltipla de objetivos */}
                      <Field label="Objetivo(s) *" hint="Selecione um ou mais">
                        <div className="flex flex-wrap gap-2">
                          {OBJECTIVE_OPTIONS.map(o => {
                            const selected = contentForm.objectives.includes(o.value);
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() => setContentForm(f => ({
                                  ...f,
                                  objectives: selected
                                    ? f.objectives.filter(x => x !== o.value)
                                    : [...f.objectives, o.value],
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  selected
                                    ? "bg-blue-500/20 border-blue-400/60 text-blue-300"
                                    : "bg-white/5 border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                                }`}
                              >
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                        {contentForm.objectives.length === 0 && (
                          <p className="text-[11px] text-white/30 mt-1">Nenhum objetivo selecionado</p>
                        )}
                      </Field>

                      {/* DatePicker com calendário */}
                      <Field label="Data sugerida para publicação *">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left transition-colors ${
                                contentForm.suggestedDate
                                  ? "border-white/20 text-white bg-white/5"
                                  : "border-white/10 text-white/40 bg-white/5 hover:border-white/20"
                              }`}
                            >
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              {contentForm.suggestedDate
                                ? format(contentForm.suggestedDate, "dd/MM/yyyy", { locale: ptBR })
                                : "Selecione uma data"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#0d1a0d] border-white/15" align="start">
                            <CalendarPicker
                              mode="single"
                              selected={contentForm.suggestedDate}
                              onSelect={d => setContentForm(f => ({ ...f, suggestedDate: d }))}
                              locale={ptBR}
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>

                      <SectionTitle>Texto e Referências</SectionTitle>
                      <Field label="Sugestão de legenda *" hint="Rascunho inicial — o redator vai refinar">
                        <Textarea
                          value={contentForm.caption}
                          onChange={e => setContentForm(f => ({ ...f, caption: e.target.value }))}
                          placeholder="Escreva uma sugestão de legenda para o post..."
                          rows={4}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                      </Field>
                      <Field label="Hashtags sugeridas" hint="Opcional">
                        <Input
                          value={contentForm.hashtags}
                          onChange={e => setContentForm(f => ({ ...f, hashtags: e.target.value }))}
                          placeholder="#BrasíliaCidadeParque #EduardoBrandão #PV"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>
                      <Field label="Links de referência / inspiração" hint="Opcional — URLs separadas por vírgula">
                        <Input
                          value={contentForm.referenceUrls}
                          onChange={e => setContentForm(f => ({ ...f, referenceUrls: e.target.value }))}
                          placeholder="https://instagram.com/p/exemplo, https://..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>

                      <SectionTitle>Observações</SectionTitle>
                      <Field label="Notas adicionais" hint="Opcional — informações extras para o coordenador">
                        <Textarea
                          value={contentForm.notes}
                          onChange={e => setContentForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Alguma observação importante sobre esta proposta?"
                          rows={2}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                      </Field>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleSubmitContent}
                          disabled={createMutation.isPending}
                          className="flex-1 bg-[#4ade80] text-black hover:bg-[#22c55e] font-semibold"
                        >
                          {createMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                          ) : (
                            <><ChevronRight className="w-4 h-4 mr-1" />Enviar para Aprovação</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setContentForm(defaultContentForm); setActiveTab("lista"); }}
                          className="border-white/20 text-white/60 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Formulário de Evento de Rua */}
                  {proposalType === "evento_rua" && (
                    <div className="space-y-4">
                      <SectionTitle>Identificação</SectionTitle>
                      <Field label="Título do evento *">
                        <Input
                          value={eventForm.title}
                          onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Ex: Caminhada no Setor Noroeste"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>
                      <Field label="Descrição / Justificativa *" hint="Por que esse evento é importante agora?">
                        <Textarea
                          value={eventForm.description}
                          onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Explique o objetivo do evento, o público-alvo e a oportunidade política..."
                          rows={3}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                      </Field>

                      <SectionTitle>Tipo e Data</SectionTitle>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Tipo de evento *">
                          <Select
                            value={eventForm.eventType}
                            onValueChange={v => setEventForm(f => ({ ...f, eventType: v as EventForm["eventType"] }))}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a2a1a] border-white/10 text-white">
                              {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
                                <SelectItem key={v} value={v}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Data sugerida *">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left transition-colors ${
                                  eventForm.suggestedDate
                                    ? "border-white/20 text-white bg-white/5"
                                    : "border-white/10 text-white/40 bg-white/5 hover:border-white/20"
                                }`}
                              >
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                {eventForm.suggestedDate
                                  ? format(eventForm.suggestedDate, "dd/MM/yyyy", { locale: ptBR })
                                  : "Selecione uma data"}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#0d1a0d] border-white/15" align="start">
                              <CalendarPicker
                                mode="single"
                                selected={eventForm.suggestedDate}
                                onSelect={d => setEventForm(f => ({ ...f, suggestedDate: d }))}
                                locale={ptBR}
                                initialFocus
                                className="text-white"
                              />
                            </PopoverContent>
                          </Popover>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Horário de início *">
                          <Input
                            type="time"
                            value={eventForm.eventTime}
                            onChange={e => setEventForm(f => ({ ...f, eventTime: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </Field>
                        <Field label="Horário de término" hint="Opcional">
                          <Input
                            type="time"
                            value={eventForm.endTime}
                            onChange={e => setEventForm(f => ({ ...f, endTime: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </Field>
                      </div>

                      <SectionTitle>Local</SectionTitle>
                      <Field label="Endereço / Local *" hint="Rua, praça, equipamento público...">
                        <Input
                          value={eventForm.location}
                          onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))}
                          placeholder="Ex: Praça do Pôr do Sol, Setor Noroeste"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Bairro / RA *">
                          <Input
                            value={eventForm.neighborhood}
                            onChange={e => setEventForm(f => ({ ...f, neighborhood: e.target.value }))}
                            placeholder="Ex: Setor Noroeste"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          />
                        </Field>
                        <Field label="Cidade">
                          <Input
                            value={eventForm.city}
                            onChange={e => setEventForm(f => ({ ...f, city: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </Field>
                      </div>

                      <SectionTitle>Público e Logística</SectionTitle>
                      <Field label="Participantes esperados *" hint="Estimativa de pessoas">
                        <Input
                          type="number"
                          min="1"
                          value={eventForm.expectedAttendees}
                          onChange={e => setEventForm(f => ({ ...f, expectedAttendees: e.target.value }))}
                          placeholder="Ex: 50"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </Field>
                      <Field label="Notas adicionais" hint="Opcional — logística, materiais, contatos">
                        <Textarea
                          value={eventForm.notes}
                          onChange={e => setEventForm(f => ({ ...f, notes: e.target.value }))}
                          placeholder="Precisa de som? Panfletos? Quem é o contato local?"
                          rows={2}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                        />
                      </Field>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={handleSubmitEvent}
                          disabled={createMutation.isPending}
                          className="flex-1 bg-orange-500 text-white hover:bg-orange-400 font-semibold"
                        >
                          {createMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                          ) : (
                            <><ChevronRight className="w-4 h-4 mr-1" />Enviar para Aprovação</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setEventForm(defaultEventForm); setActiveTab("lista"); }}
                          className="border-white/20 text-white/60 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* ── Modal de Revisão (Aprovar / Rejeitar) ──────────────────────────────── */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="bg-[#0d130d] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === "approve" ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-400" />Aprovar Proposta</>
              ) : (
                <><XCircle className="w-5 h-5 text-red-400" />Rejeitar Proposta</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {reviewAction === "approve" ? (
              <>
                <p className="text-sm text-white/70">
                  Ao aprovar, esta proposta será convertida automaticamente em um item real da agenda
                  {" "}(post ou evento de rua) e o proponente será notificado.
                </p>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Comentário para o proponente (opcional)</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Ex: Ótima ideia! Vamos publicar na quinta-feira."
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/70">
                  Informe o motivo da rejeição para que o proponente possa melhorar a proposta.
                </p>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Motivo da rejeição *</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Ex: Tema já coberto recentemente. Aguardar 2 semanas para nova proposta sobre este assunto."
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              className="border-white/20 text-white/60 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReview}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className={reviewAction === "approve"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
              }
            >
              {(approveMutation.isPending || rejectMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : reviewAction === "approve" ? (
                "Confirmar Aprovação"
              ) : (
                "Confirmar Rejeição"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Detalhe ──────────────────────────────────────────────────── */}
      <Dialog open={detailId !== null} onOpenChange={(o) => { if (!o) setDetailId(null); }}>
        <DialogContent className="bg-[#0d130d] border border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#4ade80]" />
              Detalhes da Proposta
            </DialogTitle>
          </DialogHeader>
          {detailProposal && (
            <div className="space-y-4 py-2">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[detailProposal.status as ProposalStatus].color}`}>
                  {STATUS_CONFIG[detailProposal.status as ProposalStatus].icon}
                  {STATUS_CONFIG[detailProposal.status as ProposalStatus].label}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                  detailProposal.proposalType === "conteudo"
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
                    : "bg-orange-500/15 text-orange-300 border-orange-500/25"
                }`}>
                  {detailProposal.proposalType === "conteudo" ? <FileText className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {detailProposal.proposalType === "conteudo" ? "Conteúdo" : "Evento de Rua"}
                </span>
              </div>

              <DetailRow label="Título" value={detailProposal.title} />
              <DetailRow label="Descrição" value={detailProposal.description} />
              <DetailRow label="Data sugerida" value={formatDate(detailProposal.suggestedDate)} />
              <DetailRow label="Proposto por" value={detailProposal.proposedByName ?? "—"} />
              <DetailRow label="Criado em" value={formatDate(detailProposal.createdAt)} />

              {detailProposal.proposalType === "conteudo" && (
                <>
                  <DetailRow label="Formato" value={CONTENT_TYPE_LABELS[detailProposal.contentType ?? ""] ?? "—"} />
                  <DetailRow label="Objetivo" value={OBJECTIVE_OPTIONS.find(o => o.value === detailProposal.objective)?.label ?? detailProposal.objective ?? "—"} />
                  <DetailRow label="Legenda sugerida" value={detailProposal.caption} />
                  {detailProposal.hashtags && <DetailRow label="Hashtags" value={detailProposal.hashtags} />}
                  {detailProposal.referenceUrls && <DetailRow label="Referências" value={detailProposal.referenceUrls} />}
                </>
              )}

              {detailProposal.proposalType === "evento_rua" && (
                <>
                  <DetailRow label="Tipo" value={EVENT_TYPE_LABELS[detailProposal.eventType ?? ""] ?? "—"} />
                  <DetailRow label="Local" value={detailProposal.location ?? "—"} />
                  <DetailRow label="Bairro / RA" value={detailProposal.neighborhood ?? "—"} />
                  <DetailRow label="Cidade" value={detailProposal.city ?? "Brasília"} />
                  <DetailRow label="Horário" value={`${detailProposal.eventTime ?? "—"}${detailProposal.endTime ? ` → ${detailProposal.endTime}` : ""}`} />
                  <DetailRow label="Participantes esperados" value={String(detailProposal.expectedAttendees ?? 0)} />
                </>
              )}

              {detailProposal.notes && <DetailRow label="Notas do proponente" value={detailProposal.notes} />}

              {detailProposal.status !== "pendente" && (
                <div className={`p-3 rounded-lg border ${
                  detailProposal.status === "aprovado"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <div className="text-xs font-medium text-white/60 mb-1">
                    Revisado por {detailProposal.reviewedByName} em {detailProposal.reviewedAt ? formatDate(detailProposal.reviewedAt) : "—"}
                  </div>
                  {detailProposal.reviewNotes && (
                    <div className={`text-sm ${detailProposal.status === "aprovado" ? "text-emerald-300" : "text-red-300"}`}>
                      {detailProposal.reviewNotes}
                    </div>
                  )}
                  {detailProposal.convertedItemId && (
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {detailProposal.proposalType === "conteudo" ? `Post #${detailProposal.convertedItemId}` : `Evento #${detailProposal.convertedItemId}`} criado na agenda
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{children}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/70 mb-1.5 block">
        {label}
        {hint && <span className="text-white/30 font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[11px] text-white/40 mb-0.5">{label}</div>
      <div className="text-sm text-white/90 whitespace-pre-wrap">{value}</div>
    </div>
  );
}
