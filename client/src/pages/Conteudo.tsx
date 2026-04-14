import { useState, useMemo, useEffect, useRef } from "react";
import SidebarNav from "@/components/SidebarNav";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Film,
  Image,
  LayoutGrid,
  Video,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  CalendarDays,
  Upload,
  Sparkles,
  Wand2,
  Hash,
  ImageIcon,
  FileVideo,
  Loader2,
  Copy,
  Check,
  Trash,
  Send,
  ExternalLink,
  ShieldAlert,
  Instagram,
  Zap,
  GripVertical,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

// Tipos
type PostType = "reels" | "carrossel" | "video" | "story" | "imagem";
type PostStatus = "draft" | "design" | "caption" | "review" | "scheduled" | "published" | "failed";
type ViewMode = "semanal" | "mensal" | "kanban";
type ContentCategory = "autoridade" | "bastidor" | "opiniao" | "vida_pessoal" | "proposta";
type TrafficType = "organico" | "teste_pago" | "escala";
type ConversionGoal = "engajamento" | "crescimento" | "conversao";
type CtaType = "grupo_whatsapp" | "whatsapp_direto" | "formulario" | "link_bio" | "nenhum";

const CATEGORY_CONFIG: Record<ContentCategory, { label: string; color: string; bg: string; emoji: string }> = {
  autoridade:   { label: "Autoridade",    color: "text-blue-400",   bg: "bg-blue-500/20 border-blue-500/40",   emoji: "🎓" },
  bastidor:     { label: "Bastidor",      color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/40", emoji: "🎬" },
  opiniao:      { label: "Opinião",       color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/40", emoji: "💬" },
  vida_pessoal: { label: "Vida Pessoal",  color: "text-pink-400",   bg: "bg-pink-500/20 border-pink-500/40",   emoji: "❤️" },
  proposta:     { label: "Proposta",      color: "text-green-400",  bg: "bg-green-500/20 border-green-500/40",  emoji: "📋" },
};

interface PostForm {
  title: string;
  description: string;
  type: PostType;
  status: PostStatus;
  scheduledDate: string;
  scheduledTime: string;
  objective: string;
  expectedReach: number;
  expectedLikes: number;
  expectedComments: number;
  budget: string;
  notes: string;
  caption: string;
  hashtags: string;
  mediaUrls: string; // JSON array de URLs
  slideCount: number; // Número de slides (carrossel)
  scheduledPublishAt: string; // ISO string para agendamento automático
  // Metodologia
  contentCategory: ContentCategory | "";
  trafficType: TrafficType;
  isABTest: number;
  conversionGoal: ConversionGoal | "";
  ctaType: CtaType;
  ctaLink: string;
}

const defaultForm: PostForm = {
  title: "",
  description: "",
  type: "reels",
  status: "draft",
  scheduledDate: "",
  scheduledTime: "12:00",
  objective: "",
  expectedReach: 0,
  expectedLikes: 0,
  expectedComments: 0,
  budget: "",
  notes: "",
  caption: "",
  slideCount: 5,
  hashtags: "",
  mediaUrls: "",
  scheduledPublishAt: "",
  // Metodologia
  contentCategory: "",
  trafficType: "organico",
  isABTest: 0,
  conversionGoal: "",
  ctaType: "nenhum",
  ctaLink: "",
};

// Helpers
const TYPE_CONFIG: Record<PostType, { label: string; icon: any; color: string; bg: string }> = {
  reels: { label: "Reels", icon: Film, color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/40" },
  carrossel: { label: "Carrossel", icon: LayoutGrid, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/40" },
  video: { label: "Vídeo", icon: Video, color: "text-red-400", bg: "bg-red-500/20 border-red-500/40" },
  story: { label: "Story", icon: BookOpen, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  imagem: { label: "Imagem", icon: Image, color: "text-green-400", bg: "bg-green-500/20 border-green-500/40" },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; step: number }> = {
  draft:     { label: "Rascunho", color: "bg-gray-500/20 text-gray-400 border-gray-500/30",     step: 1 },
  design:    { label: "Design",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30",     step: 2 },
  caption:   { label: "Legenda",  color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", step: 3 },
  review:    { label: "Revisão",  color: "bg-orange-500/20 text-orange-400 border-orange-500/30", step: 4 },
  scheduled: { label: "Agendado", color: "bg-green-500/20 text-green-400 border-green-500/30",  step: 5 },
  published: { label: "Publicado",color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", step: 6 },
  failed:    { label: "Falhou",   color: "bg-red-500/20 text-red-400 border-red-500/30",        step: 0 },
};

const PRODUCTION_STATUSES: PostStatus[] = ["draft", "design", "caption", "review", "scheduled"];

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay(); // 0=Dom
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  // pad to complete last row
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Conteudo() {
  const [, navigate] = useLocation();

  // Verificar autenticação via localStorage (sistema local)
  const localUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  // Permissões do usuário
  const { permissions, user: authUser } = usePermissions();
  // Visitante pode visualizar mas não editar
  const canEditContent = permissions.canEditPost;

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!localUser) {
      navigate("/login");
    }
  }, [localUser, navigate]);

  // Pré-preencher modal a partir de parâmetros de URL (ex: vindo da Agenda de Rua)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("prefill") === "1") {
      const title = params.get("title") || "";
      const date = params.get("date") || formatDateForInput(new Date());
      const description = params.get("description") || "";
      const type = (params.get("type") as any) || "imagem";
      const mediaUrl = params.get("mediaUrl") || "";
      setEditingPost(null);
      setForm({
        ...defaultForm,
        title,
        scheduledDate: date,
        description,
        type,
        mediaUrls: mediaUrl ? JSON.stringify([mediaUrl]) : "",
      });
      if (mediaUrl) setMediaPreviewUrls([mediaUrl]);
      setModalOpen(true);
      // Limpar params da URL sem recarregar
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>("semanal");
  const [currentWeekRef, setCurrentWeekRef] = useState(() => new Date());
  const [monthRef, setMonthRef] = useState(() => new Date());
  const weekDays = useMemo(() => getWeekDays(currentWeekRef), [currentWeekRef]);
  const monthGrid = useMemo(() => getMonthGrid(monthRef.getFullYear(), monthRef.getMonth()), [monthRef]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [form, setForm] = useState<PostForm>(defaultForm);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [modalTab, setModalTab] = useState("info");

  // Upload de mídia
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Modal de publicação
  const [publishModalPost, setPublishModalPost] = useState<any | null>(null);
  const [publishResult, setPublishResult] = useState<{ success: boolean; permalink?: string; error?: string } | null>(null);

  // Mutations de IA
  const uploadMediaMutation = trpc.posts.uploadMedia.useMutation({
    onError: (err) => toast.error(`Erro no upload: ${err.message}`),
  });

  const generateCaptionMutation = trpc.posts.generateCaption.useMutation({
    onSuccess: (data) => {
      setForm(f => ({ ...f, caption: data.caption, hashtags: data.hashtags }));
      setModalTab("midia");
      toast.success("Legenda gerada pela IA!");
    },
    onError: (err) => toast.error(`Erro ao gerar legenda: ${err.message}`),
  });

  const generateImageMutation = trpc.posts.generateMediaImage.useMutation({
    onSuccess: (data) => {
      const current = form.mediaUrls ? JSON.parse(form.mediaUrls) : [];
      const updated = [...current, data.url];
      setForm(f => ({ ...f, mediaUrls: JSON.stringify(updated) }));
      setMediaPreviewUrls(prev => [...prev, data.url ?? ""]);
      setModalTab("midia");
      toast.success("Imagem gerada pela IA!");
    },
    onError: (err) => toast.error(`Erro ao gerar imagem: ${err.message}`),
  });

  const [carouselProgress, setCarouselProgress] = useState<{ current: number; total: number } | null>(null);

  const generateCarouselMutation = trpc.posts.generateCarousel.useMutation({
    onMutate: () => {
      setCarouselProgress({ current: 0, total: form.slideCount });
      toast.loading(`Gerando ${form.slideCount} slides do carrossel...`, { id: "carousel-gen" });
    },
    onSuccess: (data) => {
      const urls = data.urls.filter(Boolean);
      setMediaPreviewUrls(urls);
      setForm(f => ({ ...f, mediaUrls: JSON.stringify(urls) }));
      setCarouselProgress(null);
      toast.dismiss("carousel-gen");
      toast.success(`${urls.length} slides gerados com consistência visual!`);
      // Gerar legenda adaptada para carrossel automaticamente
      generateCaptionMutation.mutate({
        title: form.title,
        description: form.description,
        type: form.type,
        objective: form.objective,
        mediaUrl: urls[0],
      });
    },
    onError: (err) => {
      setCarouselProgress(null);
      toast.dismiss("carousel-gen");
      toast.error(`Erro ao gerar carrossel: ${err.message}`);
    },
  });

  // Sincronizar previews quando editar post existente
  useEffect(() => {
    if (modalOpen && form.mediaUrls) {
      try {
        const urls = JSON.parse(form.mediaUrls);
        setMediaPreviewUrls(Array.isArray(urls) ? urls : []);
      } catch {
        setMediaPreviewUrls([]);
      }
    } else if (!modalOpen) {
      setMediaPreviewUrls([]);
      setModalTab("info");
    }
  }, [modalOpen, editingPost]);

  const utils = trpc.useUtils();

  const publishMutation = trpc.posts.publish.useMutation({
    onSuccess: (data) => {
      utils.posts.list.invalidate();
      setPublishResult({ success: true, permalink: data.permalink });
      toast.success("Post publicado no Instagram!");
    },
    onError: (err) => {
      setPublishResult({ success: false, error: err.message });
      toast.error(`Erro ao publicar: ${err.message}`);
    },
  });

  const schedulePublishMutation = trpc.posts.schedulePublish.useMutation({
    onSuccess: (data) => {
      utils.posts.list.invalidate();
      if (data.scheduledPublishAt) {
        toast.success(`Publicação agendada para ${new Date(data.scheduledPublishAt).toLocaleString("pt-BR")}`);
      } else {
        toast.success("Agendamento cancelado.");
      }
    },
    onError: (err) => toast.error(`Erro ao agendar: ${err.message}`),
  });

  const { data: postsData, isLoading } = trpc.posts.list.useQuery(
    { limit: 500, offset: 0 },
    { enabled: !!localUser } // Só busca posts quando autenticado localmente
  );
  const posts: any[] = postsData || [];

  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      setModalOpen(false);
      setForm(defaultForm);
      toast.success("Post criado! O post foi adicionado ao calendário.");
    },
    onError: (err) => {
      toast.error(`Erro ao criar post: ${err.message}`);
    },
  });

  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      setModalOpen(false);
      setEditingPost(null);
      setForm(defaultForm);
      toast.success("Post atualizado! As alterações foram salvas.");
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar post: ${err.message}`);
    },
  });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      toast.success("Post removido.");
    },
    onError: (err) => {
      toast.error(`Erro ao remover post: ${err.message}`);
    },
  });

  // Notificações: posts agendados nas próximas 24h com status pendente (não publicado)
  const pendingAlerts = useMemo(() => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return posts.filter((p: any) => {
      if (dismissedAlerts.includes(p.id)) return false;
      const scheduled = new Date(p.scheduledDate);
      const status: PostStatus = p.status || "draft";
      const isPending = ["draft", "design", "caption", "review"].includes(status);
      return isPending && scheduled >= now && scheduled <= in24h;
    });
  }, [posts, dismissedAlerts]);

  function prevWeek() {
    const d = new Date(currentWeekRef);
    d.setDate(d.getDate() - 7);
    setCurrentWeekRef(d);
  }

  function nextWeek() {
    const d = new Date(currentWeekRef);
    d.setDate(d.getDate() + 7);
    setCurrentWeekRef(d);
  }

  function prevMonth() {
    const d = new Date(monthRef);
    d.setMonth(d.getMonth() - 1);
    setMonthRef(d);
  }

  function nextMonth() {
    const d = new Date(monthRef);
    d.setMonth(d.getMonth() + 1);
    setMonthRef(d);
  }

  function openNewPost(day?: Date) {
    setEditingPost(null);
    setForm({ ...defaultForm, scheduledDate: day ? formatDateForInput(day) : formatDateForInput(new Date()) });
    setModalOpen(true);
  }

  function openEditPost(post: any) {
    setEditingPost(post);
    const d = new Date(post.scheduledDate);
    setForm({
      title: post.title || "",
      description: post.description || "",
      type: (post.type as PostType) || "imagem",
      status: (post.status as PostStatus) || "draft",
      scheduledDate: formatDateForInput(d),
      scheduledTime: post.scheduledTime || "12:00",
      objective: post.objective || "",
      expectedReach: post.expectedReach || 0,
      expectedLikes: post.expectedLikes || 0,
      expectedComments: post.expectedComments || 0,
      budget: post.budget || "",
      notes: post.notes || "",
      caption: post.caption || "",
      hashtags: post.hashtags || "",
      mediaUrls: post.mediaUrls || "",
      slideCount: post.slideCount || 5,
      scheduledPublishAt: post.scheduledPublishAt ? new Date(post.scheduledPublishAt).toISOString().slice(0, 16) : "",
      contentCategory: (post.contentCategory as ContentCategory) || "",
      trafficType: (post.trafficType as TrafficType) || "organico",
      isABTest: post.isABTest || 0,
      conversionGoal: (post.conversionGoal as ConversionGoal) || "",
      ctaType: (post.ctaType as CtaType) || "nenhum",
      ctaLink: post.ctaLink || "",
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Título obrigatório."); return; }
    if (!form.scheduledDate) { toast.error("Data obrigatória."); return; }
    const scheduledDate = new Date(form.scheduledDate + "T" + form.scheduledTime + ":00");
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      scheduledDate,
      scheduledTime: form.scheduledTime,
      objective: form.objective,
      expectedReach: form.expectedReach,
      expectedLikes: form.expectedLikes,
      expectedComments: form.expectedComments,
      budget: form.budget || undefined,
      notes: form.notes,
      caption: form.caption || undefined,
      hashtags: form.hashtags || undefined,
      mediaUrls: form.mediaUrls || undefined,
      slideCount: form.type === "carrossel" ? form.slideCount : undefined,
      // Metodologia
      contentCategory: form.contentCategory || undefined,
      trafficType: form.trafficType,
      isABTest: form.isABTest,
      conversionGoal: form.conversionGoal || undefined,
      ctaType: form.ctaType,
      ctaLink: form.ctaLink || undefined,
    };
    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, ...payload, status: form.status });
    } else {
      createPost.mutate(payload);
    }
  }

  function getPostsForDay(day: Date) {
    return posts
      .filter((p: any) => isSameDay(new Date(p.scheduledDate), day))
      .sort((a: any, b: any) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));
  }

  const today = new Date();
  const weekLabel = `${weekDays[0].getDate()} ${MONTHS_PT[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS_PT[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;
  const monthLabel = `${MONTHS_PT[monthRef.getMonth()]} ${monthRef.getFullYear()}`;

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p: any) => { const t = p.type || "imagem"; counts[t] = (counts[t] || 0) + 1; });
    return counts;
  }, [posts]);

  const weekPosts = useMemo(() => weekDays.flatMap(d => getPostsForDay(d)), [weekDays, posts]);

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-white overflow-hidden">
      <SidebarNav activeSection="conteudo" />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0f1a]/95 backdrop-blur border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#4ade80]" />
              <div>
                <h1 className="text-lg font-bold text-white">Agenda de Conteúdo</h1>
                <p className="text-xs text-white/50">Planejamento e agendamento de posts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle Semanal / Mensal / Kanban */}
              <div className="flex bg-white/10 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setViewMode("semanal")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "semanal" ? "bg-[#4ade80] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Semanal
                </button>
                <button
                  onClick={() => setViewMode("mensal")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "mensal" ? "bg-[#4ade80] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Mensal
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "kanban" ? "bg-[#4ade80] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Kanban
                </button>
              </div>
              {canEditContent && (
                <Button
                  onClick={() => openNewPost()}
                  className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-semibold gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo Post
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Banner de alertas: posts pendentes nas próximas 24h */}
          {pendingAlerts.length > 0 && (
            <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-300 mb-2">
                    {pendingAlerts.length} post{pendingAlerts.length > 1 ? "s" : ""} agendado{pendingAlerts.length > 1 ? "s" : ""} nas próximas 24h com produção pendente
                  </p>
                  <div className="space-y-1.5">
                    {pendingAlerts.map((p: any) => {
                      const d = new Date(p.scheduledDate);
                      const statusCfg = STATUS_CONFIG[(p.status as PostStatus) || "draft"];
                      return (
                        <div key={p.id} className="flex items-center justify-between bg-yellow-500/10 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-yellow-200 font-medium">{p.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-yellow-400/70">
                              {DAYS_PT[d.getDay()]} {d.getDate()}/{d.getMonth() + 1} às {p.scheduledTime || "12:00"}
                            </span>
                            {canEditContent && (
                              <button
                                onClick={() => openEditPost(p)}
                                className="text-[10px] text-yellow-300 hover:underline"
                              >
                                Editar
                              </button>
                            )}
                            <button
                              onClick={() => setDismissedAlerts(prev => [...prev, p.id])}
                              className="p-0.5 hover:bg-yellow-500/20 rounded"
                            >
                              <X className="w-3 h-3 text-yellow-400/60" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumo de tipos */}
          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(TYPE_CONFIG) as PostType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;
              return (
                <div key={type} className={`rounded-lg border p-3 flex items-center gap-3 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                  <div>
                    <p className="text-xs text-white/60">{cfg.label}</p>
                    <p className="text-lg font-bold text-white">{typeCounts[type] || 0}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== VISUALIZAÇÃO SEMANAL ===== */}
          {viewMode === "semanal" && (
            <>
              {/* Navegação de semana */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/70" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{weekLabel}</p>
                  <button onClick={() => setCurrentWeekRef(new Date())} className="text-xs text-[#4ade80] hover:underline mt-0.5">
                    Semana atual
                  </button>
                </div>
                <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Calendário semanal */}
              {isLoading ? (
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-3 h-48 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-3">
                  {weekDays.map((day) => {
                    const dayPosts = getPostsForDay(day);
                    const isToday = isSameDay(day, today);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`rounded-xl border p-3 min-h-[180px] flex flex-col gap-2 transition-colors ${
                          isToday ? "border-[#4ade80]/50 bg-[#4ade80]/5" : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/50 uppercase tracking-wide">{DAYS_PT[day.getDay()]}</p>
                            <p className={`text-lg font-bold ${isToday ? "text-[#4ade80]" : "text-white"}`}>{day.getDate()}</p>
                          </div>
                          {canEditContent && (
                            <button
                              onClick={() => openNewPost(day)}
                              className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#4ade80]/20 flex items-center justify-center transition-colors"
                              title="Adicionar post"
                            >
                              <Plus className="w-3 h-3 text-white/60" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                          {dayPosts.length === 0 ? (
                            <p className="text-xs text-white/20 text-center mt-4">Sem posts</p>
                          ) : (
                            dayPosts.map((post: any) => {
                              const typeCfg = TYPE_CONFIG[(post.type as PostType) || "imagem"];
                              const Icon = typeCfg.icon;
                              return (
                                <button
                                  key={post.id}
                                  onClick={() => openEditPost(post)}
                                  className={`w-full text-left rounded-lg border p-2 hover:brightness-110 transition-all ${typeCfg.bg}`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Icon className={`w-3 h-3 ${typeCfg.color} flex-shrink-0`} />
                                    <span className="text-xs font-medium text-white truncate">{post.title}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/50">{post.scheduledTime || "12:00"}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_CONFIG[(post.status as PostStatus) || "draft"].color}`}>
                                      {STATUS_CONFIG[(post.status as PostStatus) || "draft"].label}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lista de posts da semana */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4ade80]" />
                  Posts desta semana
                  <Badge className="bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30 text-xs">{weekPosts.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {weekPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">Nenhum post agendado esta semana</p>
                      {canEditContent && (
                        <Button
                          onClick={() => openNewPost()}
                          variant="outline"
                          size="sm"
                          className="mt-3 border-white/20 text-white/70 hover:bg-white/10"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Criar primeiro post
                        </Button>
                      )}
                    </div>
                  ) : (
                    weekPosts.map((post: any) => {
                      const typeCfg = TYPE_CONFIG[(post.type as PostType) || "imagem"];
                      const Icon = typeCfg.icon;
                      const d = new Date(post.scheduledDate);
                      return (
                        <div
                          key={post.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.bg}`}>
                            <Icon className={`w-4 h-4 ${typeCfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{post.title}</p>
                            <p className="text-xs text-white/50">
                              {DAYS_PT[d.getDay()]}, {d.getDate()} {MONTHS_PT[d.getMonth()]} às {post.scheduledTime || "12:00"}
                              {post.objective && ` · ${post.objective}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {(post.expectedReach || 0) > 0 && (
                              <div className="flex items-center gap-1 text-xs text-white/40">
                                <Eye className="w-3 h-3" />{(post.expectedReach || 0).toLocaleString()}
                              </div>
                            )}
                            {(post.expectedLikes || 0) > 0 && (
                              <div className="flex items-center gap-1 text-xs text-white/40">
                                <Heart className="w-3 h-3" />{(post.expectedLikes || 0).toLocaleString()}
                              </div>
                            )}
                            {(post.expectedComments || 0) > 0 && (
                              <div className="flex items-center gap-1 text-xs text-white/40">
                                <MessageCircle className="w-3 h-3" />{(post.expectedComments || 0).toLocaleString()}
                              </div>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[(post.status as PostStatus) || "draft"].color}`}>
                              {STATUS_CONFIG[(post.status as PostStatus) || "draft"].label}
                            </span>
                            {/* Botão Publicar - apenas coordinator e superadmin */}
                            {permissions.canPublishPost && post.status !== "published" && (
                              <button
                                onClick={() => { setPublishResult(null); setPublishModalPost(post); }}
                                className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                                title="Publicar no Instagram"
                              >
                                <Send className="w-3.5 h-3.5 text-green-400/70" />
                              </button>
                            )}
                            {post.status === "published" && post.instagramPostId && (
                              <a
                                href={`https://www.instagram.com/p/${post.instagramPostId}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                                title="Ver no Instagram"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-400/70" />
                              </a>
                            )}
                            {canEditContent && (
                              <>
                                <button
                                  onClick={() => openEditPost(post)}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                  title="Editar"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-white/50" />
                                </button>
                                {permissions.canDeletePost && (
                                  <button
                                    onClick={() => { if (confirm("Remover este post?")) deletePost.mutate({ id: post.id }); }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* ===== VISUALIZAÇÃO MENSAL ===== */}
          {viewMode === "mensal" && (
            <div className="space-y-4">
              {/* Navegação de mês */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 px-4 py-3">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white/70" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{monthLabel}</p>
                  <button
                    onClick={() => setMonthRef(new Date())}
                    className="text-xs text-[#4ade80] hover:underline mt-0.5"
                  >
                    Mês atual
                  </button>
                </div>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Grade mensal */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Cabeçalho dias da semana */}
                <div className="grid grid-cols-7 border-b border-white/10">
                  {DAYS_PT.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-white/50 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Células */}
                <div className="grid grid-cols-7">
                  {monthGrid.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="border-r border-b border-white/5 min-h-[100px] bg-white/2" />;
                    }
                    const dayPosts = getPostsForDay(day);
                    const isToday = isSameDay(day, today);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`border-r border-b border-white/5 min-h-[100px] p-2 flex flex-col gap-1 ${
                          isToday ? "bg-[#4ade80]/5" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday ? "bg-[#4ade80] text-black" : "text-white/70"
                          }`}>
                            {day.getDate()}
                          </span>
                          {canEditContent && (
                            <button
                              onClick={() => openNewPost(day)}
                              className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#4ade80]/20 flex items-center justify-center transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                              title="Adicionar post"
                            >
                              <Plus className="w-2.5 h-2.5 text-white/60" />
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1">
                          {dayPosts.slice(0, 3).map((post: any) => {
                            const typeCfg = TYPE_CONFIG[(post.type as PostType) || "imagem"];
                            const statusCfg = STATUS_CONFIG[(post.status as PostStatus) || "draft"];
                            return (
                              <div
                                key={post.id}
                                onClick={() => canEditContent ? openEditPost(post) : undefined}
                                className={`w-full text-left rounded px-1.5 py-0.5 text-[10px] font-medium truncate border ${typeCfg.bg} ${canEditContent ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'} transition-all`}
                                title={`${post.title} — ${statusCfg.label}`}
                              >
                                <span className={typeCfg.color}>●</span> {post.title}
                              </div>
                            );
                          })}
                          {dayPosts.length > 3 && (
                            <span className="text-[10px] text-white/40 pl-1">+{dayPosts.length - 3} mais</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legenda de tipos */}
              <div className="flex flex-wrap gap-3">
                {(Object.keys(TYPE_CONFIG) as PostType[]).map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const Icon = cfg.icon;
                  return (
                    <div key={type} className="flex items-center gap-1.5 text-xs text-white/50">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== VISUALIZAÇÃO KANBAN ===== */}
          {viewMode === "kanban" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/50">Arraste os cards entre colunas para atualizar o status de produção</p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(CATEGORY_CONFIG) as ContentCategory[]).map((cat) => (
                    <span key={cat} className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_CONFIG[cat].bg} ${CATEGORY_CONFIG[cat].color}`}>
                      {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2">
                {PRODUCTION_STATUSES.map((status) => {
                  const cfg = STATUS_CONFIG[status];
                  const colPosts = posts
                    .filter((p: any) => (p.status || "draft") === status)
                    .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
                  return (
                    <div key={status} className="flex flex-col gap-2 min-w-[200px]">
                      {/* Cabeçalho da coluna */}
                      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.color} bg-white/5`}>
                        <span className="text-xs font-semibold">{cfg.label}</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-white/60">{colPosts.length}</span>
                      </div>
                      {/* Cards */}
                      <div className="flex flex-col gap-2 min-h-[200px]">
                        {colPosts.map((post: any) => {
                          const typeCfg = TYPE_CONFIG[(post.type as PostType) || "imagem"];
                          const catCfg = post.contentCategory ? CATEGORY_CONFIG[post.contentCategory as ContentCategory] : null;
                          const d = new Date(post.scheduledDate);
                          return (
                            <div
                              key={post.id}
                              className="bg-[#0f1724] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-[#4ade80]/40 transition-all group"
                              onClick={() => canEditContent ? openEditPost(post) : undefined}
                            >
                              {/* Tipo + Categoria */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${typeCfg.bg} ${typeCfg.color}`}>
                                  {typeCfg.label}
                                </span>
                                {catCfg && (
                                  <span className={`text-[10px] ${catCfg.color}`}>
                                    {catCfg.emoji}
                                  </span>
                                )}
                              </div>
                              {/* Título */}
                              <p className="text-xs font-medium text-white line-clamp-2 mb-2">{post.title}</p>
                              {/* Data */}
                              <p className="text-[10px] text-white/40">
                                {DAYS_PT[d.getDay()]} {d.getDate()}/{d.getMonth() + 1} · {post.scheduledTime || "12:00"}
                              </p>
                              {/* Indicadores */}
                              <div className="flex items-center gap-1.5 mt-2">
                                {post.trafficType && post.trafficType !== "organico" && (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {post.trafficType === "teste_pago" ? "🧪 Teste" : "🚀 Escala"}
                                  </span>
                                )}
                                {post.isABTest ? (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">A/B</span>
                                ) : null}
                                {post.ctaType && post.ctaType !== "nenhum" && (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">CTA</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {colPosts.length === 0 && (
                          <div className="flex items-center justify-center h-20 border border-dashed border-white/10 rounded-lg">
                            <p className="text-[10px] text-white/20">Nenhum post</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal de criação/edição */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) { setEditingPost(null); setForm(defaultForm); }
        }}
      >
        <DialogContent className="bg-[#0f1724] border-white/20 text-white max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          {/* Header fixo */}
          <div className="px-6 pt-5 pb-3 border-b border-white/10 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                {editingPost ? <Edit3 className="w-4 h-4 text-[#4ade80]" /> : <Plus className="w-4 h-4 text-[#4ade80]" />}
                {editingPost ? "Editar Post" : "Novo Post"}
              </DialogTitle>
            </DialogHeader>
            {/* Tabs de navegação */}
            <div className="flex gap-1 mt-3">
              {[
                { id: "info", label: "Informações", icon: Edit3 },
                { id: "midia", label: "Mídia & Legenda", icon: ImageIcon },
                { id: "revisao", label: "Revisão", icon: Send },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setModalTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    modalTab === id
                      ? "bg-[#4ade80] text-black"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {id === "midia" && mediaPreviewUrls.length > 0 && (
                    <span className="bg-[#4ade80]/30 text-[#4ade80] text-[10px] px-1.5 py-0.5 rounded-full">
                      {mediaPreviewUrls.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo scrollável */}
          <div className="overflow-y-auto flex-1 px-6 py-4">

            {/* === ABA INFORMAÇÕES === */}
            {modalTab === "info" && (
              <div className="grid grid-cols-2 gap-4">
                {/* Título */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-white/70 text-xs">Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Reels sobre Brasília Cidade Parque"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs">Tipo de Conteúdo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PostType })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1724] border-white/20">
                      {(Object.keys(TYPE_CONFIG) as PostType[]).map((t) => (
                        <SelectItem key={t} value={t} className="text-white hover:bg-white/10">
                          {TYPE_CONFIG[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de slides (apenas carrossel) */}
                {form.type === "carrossel" && (
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                      Número de Slides *
                      <span className="text-[10px] text-white/30 font-normal">(mín 2, máx 10)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, slideCount: Math.max(2, f.slideCount - 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-lg font-bold transition-colors"
                      >-</button>
                      <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center">
                        <span className="text-white font-bold text-lg">{form.slideCount}</span>
                        <span className="text-white/40 text-xs ml-1">slides</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, slideCount: Math.min(10, f.slideCount + 1) }))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center text-lg font-bold transition-colors"
                      >+</button>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {[3, 4, 5, 6, 7, 8, 10].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, slideCount: n }))}
                          className={`px-2 py-0.5 rounded text-xs transition-colors border ${
                            form.slideCount === n
                              ? "bg-blue-500/30 border-blue-500/50 text-blue-300"
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          }`}
                        >{n}</button>
                      ))}
                    </div>
                    <p className="text-[10px] text-blue-400/60 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      A IA gerará {form.slideCount} imagens com consistência visual de carrossel
                    </p>
                  </div>
                )}

                {/* Objetivo */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs">Objetivo</Label>
                  <Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1724] border-white/20">
                      {["awareness", "engajamento", "humanização", "explicação", "mobilização", "captação"].map((obj) => (
                        <SelectItem key={obj} value={obj} className="text-white hover:bg-white/10 capitalize">
                          {obj.charAt(0).toUpperCase() + obj.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs">Data *</Label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                {/* Hora */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs">Hora *</Label>
                  <Input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                {/* Status de Produção */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-white/70 text-xs">Status de Produção</Label>
                  <div className="flex items-center gap-1">
                    {PRODUCTION_STATUSES.map((s, idx) => {
                      const cfg = STATUS_CONFIG[s];
                      const isActive = form.status === s;
                      const currentStep = STATUS_CONFIG[form.status]?.step || 1;
                      const isPast = cfg.step < currentStep;
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <button
                            onClick={() => setForm({ ...form, status: s })}
                            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border text-center ${
                              isActive
                                ? cfg.color + " border-current"
                                : isPast
                                ? "bg-white/10 text-white/60 border-white/20 hover:bg-white/15"
                                : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {cfg.label}
                          </button>
                          {idx < PRODUCTION_STATUSES.length - 1 && (
                            <ChevronRight className={`w-3 h-3 flex-shrink-0 mx-0.5 ${isPast ? "text-white/40" : "text-white/15"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Descrição */}
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-white/70 text-xs">Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva o conteúdo do post..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
                    rows={3}
                  />
                </div>

                {/* Métricas Projetadas */}
                <div className="col-span-2">
                  <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Métricas Projetadas
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> Alcance</Label>
                      <Input type="number" value={form.expectedReach} onChange={(e) => setForm({ ...form, expectedReach: Number(e.target.value) })} className="bg-white/10 border-white/20 text-white" min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs flex items-center gap-1"><Heart className="w-3 h-3" /> Curtidas</Label>
                      <Input type="number" value={form.expectedLikes} onChange={(e) => setForm({ ...form, expectedLikes: Number(e.target.value) })} className="bg-white/10 border-white/20 text-white" min={0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Comentários</Label>
                      <Input type="number" value={form.expectedComments} onChange={(e) => setForm({ ...form, expectedComments: Number(e.target.value) })} className="bg-white/10 border-white/20 text-white" min={0} />
                    </div>
                  </div>
                </div>

                {/* Orçamento */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Orçamento (R$)
                  </Label>
                  <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0,00" className="bg-white/10 border-white/20 text-white placeholder:text-white/30" min={0} step={0.01} />
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs">Observações</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." className="bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                </div>

                {/* ─── METODOLOGIA ─── */}
                <div className="col-span-2 pt-2 border-t border-white/10">
                  <p className="text-xs font-semibold text-[#4ade80] mb-3 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Metodologia de Conteúdo
                  </p>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Categoria */}
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Categoria do Conteúdo</Label>
                      <Select value={form.contentCategory} onValueChange={(v) => setForm({ ...form, contentCategory: v as ContentCategory })}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1724] border-white/20">
                          {(Object.keys(CATEGORY_CONFIG) as ContentCategory[]).map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                              {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de Tráfego */}
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Tipo de Distribuição</Label>
                      <Select value={form.trafficType} onValueChange={(v) => setForm({ ...form, trafficType: v as TrafficType })}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1724] border-white/20">
                          <SelectItem value="organico" className="text-white hover:bg-white/10">🌱 Orgânico</SelectItem>
                          <SelectItem value="teste_pago" className="text-white hover:bg-white/10">🧪 Teste Pago</SelectItem>
                          <SelectItem value="escala" className="text-white hover:bg-white/10">🚀 Escala (Impulsionado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Objetivo de Conversão */}
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Objetivo de Conversão</Label>
                      <Select value={form.conversionGoal} onValueChange={(v) => setForm({ ...form, conversionGoal: v as ConversionGoal })}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1724] border-white/20">
                          <SelectItem value="engajamento" className="text-white hover:bg-white/10">❤️ Engajamento</SelectItem>
                          <SelectItem value="crescimento" className="text-white hover:bg-white/10">📈 Crescimento de Seguidores</SelectItem>
                          <SelectItem value="conversao" className="text-white hover:bg-white/10">🎯 Conversão (WhatsApp/Formulário)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* CTA */}
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Call to Action (CTA)</Label>
                      <Select value={form.ctaType} onValueChange={(v) => setForm({ ...form, ctaType: v as CtaType })}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1724] border-white/20">
                          <SelectItem value="nenhum" className="text-white hover:bg-white/10">— Nenhum</SelectItem>
                          <SelectItem value="grupo_whatsapp" className="text-white hover:bg-white/10">💬 Entrar no Grupo WhatsApp</SelectItem>
                          <SelectItem value="whatsapp_direto" className="text-white hover:bg-white/10">📱 WhatsApp Direto</SelectItem>
                          <SelectItem value="formulario" className="text-white hover:bg-white/10">📋 Formulário</SelectItem>
                          <SelectItem value="link_bio" className="text-white hover:bg-white/10">🔗 Link na Bio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Link do CTA */}
                    {form.ctaType !== "nenhum" && (
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-white/70 text-xs">Link do CTA</Label>
                        <Input
                          value={form.ctaLink}
                          onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                          placeholder="https://..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                        />
                      </div>
                    )}

                    {/* Teste A/B */}
                    <div className="col-span-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isABTest: form.isABTest ? 0 : 1 })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          form.isABTest ? "bg-[#4ade80]" : "bg-white/20"
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          form.isABTest ? "left-5" : "left-0.5"
                        }`} />
                      </button>
                      <Label className="text-white/70 text-xs cursor-pointer" onClick={() => setForm({ ...form, isABTest: form.isABTest ? 0 : 1 })}>
                        Este post é parte de um Teste A/B
                      </Label>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* === ABA MÍDIA & LEGENDA === */}
            {modalTab === "midia" && (
              <div className="space-y-5">

                {/* Upload de Mídia */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-sm font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#4ade80]" />
                      Mídia do Post
                    </Label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* Upload manual */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingMedia || generateCarouselMutation.isPending}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/20 text-white/70 hover:bg-white/10 text-xs gap-1.5"
                      >
                        {uploadingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {uploadingMedia ? "Enviando..." : "Upload"}
                      </Button>

                      {form.type === "carrossel" ? (
                        /* Botão especial para carrossel */
                        <Button
                          type="button"
                          size="sm"
                          disabled={generateCarouselMutation.isPending || !form.title}
                          onClick={() => generateCarouselMutation.mutate({
                            title: form.title,
                            description: form.description,
                            objective: form.objective,
                            slideCount: form.slideCount,
                          })}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                        >
                          {generateCarouselMutation.isPending
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando {form.slideCount} slides...</>
                            : <><LayoutGrid className="w-3.5 h-3.5" /> Gerar Carrossel com IA ({form.slideCount} slides)</>}
                        </Button>
                      ) : (
                        /* Botão normal para imagem única */
                        <Button
                          type="button"
                          size="sm"
                          disabled={generateImageMutation.isPending || !form.title}
                          onClick={() => generateImageMutation.mutate({ title: form.title, description: form.description, type: form.type, objective: form.objective })}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
                        >
                          {generateImageMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                          {generateImageMutation.isPending ? "Gerando..." : "Gerar com IA"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Input file oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={["reels", "video"].includes(form.type) ? "video/mp4,video/quicktime,image/*" : "image/jpeg,image/png,image/webp"}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingMedia(true);
                      try {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                          const base64 = (ev.target?.result as string).split(",")[1];
                          const result = await uploadMediaMutation.mutateAsync({
                            fileBase64: base64,
                            mimeType: file.type,
                            fileName: file.name,
                          });
                          if (result.url) {
                            const current = form.mediaUrls ? JSON.parse(form.mediaUrls) : [];
                            const updated = [...current, result.url];
                            setForm(f => ({ ...f, mediaUrls: JSON.stringify(updated) }));
                            setMediaPreviewUrls(prev => [...prev, result.url]);
                            toast.success("Mídia enviada com sucesso!");
                          }
                          setUploadingMedia(false);
                        };
                        reader.readAsDataURL(file);
                      } catch {
                        setUploadingMedia(false);
                      }
                      e.target.value = "";
                    }}
                  />

                  {/* Tipo aceito */}
                  <p className="text-[11px] text-white/30">
                    {form.type === "carrossel"
                      ? `Carrossel: ${form.slideCount} slides — a IA gerará todas as imagens com consistência visual`
                      : ["reels", "video"].includes(form.type)
                      ? "Aceita: MP4, MOV (vídeo) ou imagens JPG/PNG/WebP"
                      : "Aceita: JPG, PNG, WebP (máx. 50MB)"}
                  </p>

                  {/* Barra de progresso do carrossel */}
                  {generateCarouselMutation.isPending && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-300 flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Gerando carrossel com IA...
                        </span>
                        <span className="text-xs text-blue-400/60">{form.slideCount} slides</span>
                      </div>
                      <div className="w-full bg-blue-500/20 rounded-full h-1.5">
                        <div
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${mediaPreviewUrls.length > 0 ? (mediaPreviewUrls.length / form.slideCount) * 100 : 15}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-blue-400/50">
                        A IA está planejando a narrativa e gerando {form.slideCount} imagens com consistência visual...
                      </p>
                    </div>
                  )}

                  {/* Grid de previews */}
                  {mediaPreviewUrls.length > 0 ? (
                    <div className="space-y-2">
                      {form.type === "carrossel" && (
                        <div className="flex items-center gap-2 text-xs text-blue-300/70">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          {mediaPreviewUrls.length} slide{mediaPreviewUrls.length !== 1 ? "s" : ""} — arraste para reordenar
                        </div>
                      )}
                      <div className={`grid gap-2 ${form.type === "carrossel" ? "grid-cols-4" : "grid-cols-3"}`}>
                        {mediaPreviewUrls.map((url, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/20 bg-white/5 aspect-square">
                            {url.match(/\.(mp4|mov)$/i) ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <FileVideo className="w-8 h-8 text-white/40" />
                                <span className="text-[10px] text-white/40">Vídeo</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            )}
                            {/* Número do slide para carrossel */}
                            {form.type === "carrossel" && (
                              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                {idx + 1}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                const updated = mediaPreviewUrls.filter((_, i) => i !== idx);
                                setMediaPreviewUrls(updated);
                                setForm(f => ({ ...f, mediaUrls: JSON.stringify(updated) }));
                              }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#4ade80]/50 hover:bg-[#4ade80]/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {form.type === "carrossel" ? (
                        <>
                          <LayoutGrid className="w-8 h-8 text-blue-400/40 mx-auto mb-2" />
                          <p className="text-sm text-white/40">Clique em "Gerar Carrossel com IA" para criar {form.slideCount} slides</p>
                          <p className="text-xs text-white/20 mt-1">Ou faça upload manual de cada slide</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                          <p className="text-sm text-white/40">Clique para fazer upload ou use a IA para gerar</p>
                          <p className="text-xs text-white/20 mt-1">Arraste e solte ou clique no botão acima</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Legenda */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-sm font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#4ade80]" />
                      Legenda & Hashtags
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      disabled={generateCaptionMutation.isPending || !form.title}
                      onClick={() => generateCaptionMutation.mutate({
                        title: form.title,
                        description: form.description,
                        type: form.type,
                        objective: form.objective,
                        mediaUrl: mediaPreviewUrls[0],
                      })}
                      className="bg-[#4ade80] hover:bg-[#22c55e] text-black text-xs gap-1.5"
                    >
                      {generateCaptionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {generateCaptionMutation.isPending ? "Gerando..." : "Gerar Legenda com IA"}
                    </Button>
                  </div>

                  {/* Campo de legenda */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-white/60 text-xs">Legenda</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30">{form.caption.length}/2200</span>
                        {form.caption && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(form.caption + (form.hashtags ? "\n\n" + form.hashtags : ""));
                              setCopiedCaption(true);
                              setTimeout(() => setCopiedCaption(false), 2000);
                            }}
                            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
                          >
                            {copiedCaption ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                            {copiedCaption ? "Copiado!" : "Copiar"}
                          </button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={form.caption}
                      onChange={(e) => setForm({ ...form, caption: e.target.value })}
                      placeholder="Escreva a legenda do post ou gere com IA..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none"
                      rows={5}
                      maxLength={2200}
                    />
                  </div>

                  {/* Campo de hashtags */}
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Hashtags
                    </Label>
                    <Textarea
                      value={form.hashtags}
                      onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                      placeholder="#BrasiliaCidadeParque #EduardoBrandao #Brasilia..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none font-mono text-xs"
                      rows={3}
                    />
                    <p className="text-[10px] text-white/30">Máximo 30 hashtags por post no Instagram</p>
                  </div>
                </div>
              </div>
            )}

            {/* === ABA REVISÃO === */}
            {modalTab === "revisao" && (() => {
              const mediaList = (() => { try { return form.mediaUrls ? JSON.parse(form.mediaUrls) : []; } catch { return []; } })();
              const hasMedia = mediaList.length > 0;
              const hasCaption = !!form.caption.trim();
              const canPublish = permissions.canPublishPost;

              return (
                <div className="space-y-5">
                  {/* Preview do post */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">Preview</p>

                    {/* Mídia */}
                    {hasMedia ? (
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
                        <img src={mediaList[0]} alt="Preview" className="w-full h-full object-cover" />
                        {mediaList.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <LayoutGrid className="w-3 h-3" /> {mediaList.length} slides
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                        <p className="text-xs text-white/30">Sem mídia adicionada</p>
                      </div>
                    )}

                    {/* Legenda */}
                    {hasCaption ? (
                      <div className="space-y-1">
                        <p className="text-sm text-white/80 leading-relaxed line-clamp-4">{form.caption}</p>
                        {form.hashtags && <p className="text-xs text-blue-400/70">{form.hashtags}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs">Sem legenda. Adicione na aba Mídia & Legenda.</p>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-center justify-between text-xs text-white/40">
                      {(() => { const cfg = TYPE_CONFIG[form.type]; const Icon = cfg.icon; return <span className="flex items-center gap-1"><Icon className={`w-3 h-3 ${cfg.color}`} />{cfg.label}</span>; })()}
                      <span>@eduardobrandaopv</span>
                    </div>
                  </div>

                  {/* Bloco de publicação */}
                  {canPublish ? (
                    <div className="space-y-3">
                      {/* Publicar agora */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-green-400" /> Publicar agora
                        </p>
                        <Button
                          disabled={!hasCaption || publishMutation.isPending}
                          onClick={() => {
                            if (!editingPost) { toast.error("Salve o post antes de publicar."); return; }
                            publishMutation.mutate({
                              id: editingPost.id,
                              userRole: (authUser?.role || "visitor") as any,
                              userName: authUser?.nome || authUser?.name,
                            }, {
                              onSuccess: () => {
                                setModalOpen(false);
                                setEditingPost(null);
                                setForm(defaultForm);
                              },
                            });
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white gap-2"
                        >
                          {publishMutation.isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                            : <><Instagram className="w-4 h-4" /> Publicar no Instagram agora</>}
                        </Button>
                        {!editingPost && <p className="text-[10px] text-white/30 text-center">Salve o post primeiro para poder publicar.</p>}
                      </div>

                      {/* Agendar publicação */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> Agendar publicação automática
                        </p>
                        <div className="space-y-2">
                          <Input
                            type="datetime-local"
                            value={form.scheduledPublishAt}
                            onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })}
                            min={new Date().toISOString().slice(0, 16)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!form.scheduledPublishAt || !hasCaption || !editingPost}
                              onClick={() => {
                                if (!editingPost) { toast.error("Salve o post antes de agendar."); return; }
                                schedulePublishMutation.mutate({
                                  id: editingPost.id,
                                  scheduledPublishAt: form.scheduledPublishAt ? new Date(form.scheduledPublishAt) : null,
                                  userRole: (authUser?.role || "visitor") as any,
                                });
                              }}
                              className="flex-1 border-blue-500/40 text-blue-400/80 hover:bg-blue-500/10"
                            >
                              {schedulePublishMutation.isPending
                                ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Agendando...</>
                                : <><CalendarDays className="w-3 h-3 mr-1" /> Agendar</>}
                            </Button>
                            {editingPost?.scheduledPublishAt && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  schedulePublishMutation.mutate({
                                    id: editingPost.id,
                                    scheduledPublishAt: null,
                                    userRole: (authUser?.role || "visitor") as any,
                                  });
                                  setForm(f => ({ ...f, scheduledPublishAt: "" }));
                                }}
                                className="border-red-500/40 text-red-400/80 hover:bg-red-500/10"
                              >
                                <X className="w-3 h-3 mr-1" /> Cancelar
                              </Button>
                            )}
                          </div>
                          {editingPost?.scheduledPublishAt && (
                            <p className="text-xs text-blue-400/70 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              Agendado para: {new Date(editingPost.scheduledPublishAt).toLocaleString("pt-BR")}
                            </p>
                          )}
                          <p className="text-[10px] text-white/30">O sistema publicará automaticamente no horário definido.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <ShieldAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-300 font-medium">Permissão insuficiente</p>
                        <p className="text-xs text-yellow-400/60 mt-1">Apenas Coordenadores e Superadmins podem publicar ou agendar posts no Instagram.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <DialogFooter className="gap-2 px-6 py-4 border-t border-white/10 bg-[#0f1724] flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => { setModalOpen(false); setEditingPost(null); setForm(defaultForm); }}
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setModalTab("midia")}
              variant="outline"
              className="border-[#4ade80]/40 text-[#4ade80]/80 hover:bg-[#4ade80]/10"
            >
              <ImageIcon className="w-4 h-4 mr-1.5" />
              Mídia & Legenda
            </Button>
            <Button
              onClick={handleSave}
              disabled={createPost.isPending || updatePost.isPending}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-semibold"
            >
              {createPost.isPending || updatePost.isPending ? "Salvando..." : editingPost ? "Salvar Alterações" : "Criar Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== MODAL DE PUBLICAÇÃO NO INSTAGRAM ===== */}
      <Dialog open={!!publishModalPost} onOpenChange={(open) => { if (!open && !publishMutation.isPending) { setPublishModalPost(null); setPublishResult(null); } }}>
        <DialogContent className="bg-[#0f1724] border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              Publicar no Instagram
            </DialogTitle>
          </DialogHeader>

          {publishModalPost && !publishResult && (
            <div className="space-y-4">
              {/* Preview do post */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                {/* Mídia preview */}
                {publishModalPost.mediaUrls && (() => {
                  try {
                    const urls = JSON.parse(publishModalPost.mediaUrls);
                    if (urls.length > 0) return (
                      <div className="relative rounded-lg overflow-hidden bg-black aspect-square">
                        <img src={urls[0]} alt="Preview" className="w-full h-full object-cover" />
                        {urls.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <LayoutGrid className="w-3 h-3" /> {urls.length} slides
                          </div>
                        )}
                      </div>
                    );
                  } catch { return null; }
                  return null;
                })()}

                {/* Legenda */}
                {publishModalPost.caption ? (
                  <div className="space-y-1">
                    <p className="text-xs text-white/50 font-medium">Legenda</p>
                    <p className="text-sm text-white/80 leading-relaxed line-clamp-4">{publishModalPost.caption}</p>
                    {publishModalPost.hashtags && (
                      <p className="text-xs text-blue-400/70">{publishModalPost.hashtags}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs">Este post não tem legenda. Adicione uma antes de publicar.</p>
                  </div>
                )}

                {/* Informações */}
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    {(() => { const t = publishModalPost.type || "imagem"; const cfg = TYPE_CONFIG[t as PostType]; const Icon = cfg.icon; return <><Icon className={`w-3 h-3 ${cfg.color}`} />{cfg.label}</>; })()}
                  </span>
                  <span>@eduardobrandaopv</span>
                </div>
              </div>

              {/* Aviso de permissão */}
              <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <ShieldAlert className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-green-300 font-medium">Publicação autorizada</p>
                  <p className="text-xs text-green-400/60 mt-0.5">
                    Você está publicando como <strong>{authUser?.nome || authUser?.name || "Coordenador"}</strong> ({authUser?.role === "superadmin" ? "Superadmin" : "Coordenador"}).
                    Esta ação é irreversível.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultado de sucesso */}
          {publishResult?.success && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <Check className="w-7 h-7 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Publicado com sucesso!</p>
                  <p className="text-white/50 text-sm mt-1">O post está no ar no Instagram.</p>
                </div>
              </div>
              {publishResult.permalink && (
                <a
                  href={publishResult.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver post no Instagram
                </a>
              )}
            </div>
          )}

          {/* Resultado de erro */}
          {publishResult?.success === false && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <X className="w-7 h-7 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">Falha na publicação</p>
                  <p className="text-red-400/70 text-xs mt-1 max-w-xs">{publishResult.error}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {!publishResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setPublishModalPost(null)}
                  disabled={publishMutation.isPending}
                  className="border-white/20 text-white/70 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  disabled={publishMutation.isPending || !publishModalPost?.caption}
                  onClick={() => {
                    if (!publishModalPost) return;
                    publishMutation.mutate({
                      id: publishModalPost.id,
                      userRole: (authUser?.role || "visitor") as any,
                      userName: authUser?.nome || authUser?.name,
                    });
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white gap-2"
                >
                  {publishMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                    : <><Send className="w-4 h-4" /> Publicar agora</>}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => { setPublishModalPost(null); setPublishResult(null); }}
                className="w-full bg-white/10 hover:bg-white/20 text-white"
              >
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
