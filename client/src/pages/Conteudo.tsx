import { useState, useMemo } from "react";
import SidebarNav from "@/components/SidebarNav";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";

// Tipos
type PostType = "reels" | "carrossel" | "video" | "story" | "imagem";
type PostStatus = "draft" | "design" | "caption" | "review" | "scheduled" | "published" | "failed";

interface PostForm {
  title: string;
  description: string;
  type: PostType;
  scheduledDate: string;
  scheduledTime: string;
  objective: string;
  expectedReach: number;
  expectedLikes: number;
  expectedComments: number;
  budget: string;
  notes: string;
}

const defaultForm: PostForm = {
  title: "",
  description: "",
  type: "reels",
  scheduledDate: "",
  scheduledTime: "12:00",
  objective: "",
  expectedReach: 0,
  expectedLikes: 0,
  expectedComments: 0,
  budget: "",
  notes: "",
};

// Helpers
const TYPE_CONFIG: Record<PostType, { label: string; icon: any; color: string; bg: string }> = {
  reels: { label: "Reels", icon: Film, color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/40" },
  carrossel: { label: "Carrossel", icon: LayoutGrid, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/40" },
  video: { label: "Vídeo", icon: Video, color: "text-red-400", bg: "bg-red-500/20 border-red-500/40" },
  story: { label: "Story", icon: BookOpen, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  imagem: { label: "Imagem", icon: Image, color: "text-green-400", bg: "bg-green-500/20 border-green-500/40" },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-500/20 text-gray-400" },
  design: { label: "Design", color: "bg-blue-500/20 text-blue-400" },
  caption: { label: "Legenda", color: "bg-yellow-500/20 text-yellow-400" },
  review: { label: "Revisão", color: "bg-orange-500/20 text-orange-400" },
  scheduled: { label: "Agendado", color: "bg-green-500/20 text-green-400" },
  published: { label: "Publicado", color: "bg-emerald-500/20 text-emerald-400" },
  failed: { label: "Falhou", color: "bg-red-500/20 text-red-400" },
};

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
  const [currentWeekRef, setCurrentWeekRef] = useState(() => new Date());
  const weekDays = useMemo(() => getWeekDays(currentWeekRef), [currentWeekRef]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [form, setForm] = useState<PostForm>(defaultForm);

  const utils = trpc.useUtils();
  const { data: postsData, isLoading } = trpc.posts.list.useQuery({ limit: 200, offset: 0 });
  const posts = postsData || [];

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

  const updatePost = trpc.posts.updatePost.useMutation({
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

  const deletePost = trpc.posts.deletePost.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      toast.success("Post removido.");
    },
    onError: (err) => {
      toast.error(`Erro ao remover post: ${err.message}`);
    },
  });

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
      scheduledDate: formatDateForInput(d),
      scheduledTime: post.scheduledTime || "12:00",
      objective: post.objective || "",
      expectedReach: post.expectedReach || 0,
      expectedLikes: post.expectedLikes || 0,
      expectedComments: post.expectedComments || 0,
      budget: post.budget || "",
      notes: post.notes || "",
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Título obrigatório.");
      return;
    }
    if (!form.scheduledDate) {
      toast.error("Data obrigatória.");
      return;
    }
    const scheduledDate = new Date(form.scheduledDate + "T" + form.scheduledTime + ":00");
    if (editingPost) {
      updatePost.mutate({
        id: editingPost.id,
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
      });
    } else {
      createPost.mutate({
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
      });
    }
  }

  function getPostsForDay(day: Date) {
    return posts
      .filter((p: any) => isSameDay(new Date(p.scheduledDate), day))
      .sort((a: any, b: any) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));
  }

  const today = new Date();
  const weekLabel = `${weekDays[0].getDate()} ${MONTHS_PT[weekDays[0].getMonth()]} – ${weekDays[6].getDate()} ${MONTHS_PT[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p: any) => {
      const t = p.type || "imagem";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const weekPosts = useMemo(() => weekDays.flatMap(getPostsForDay), [weekDays, posts]);

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
            <Button
              onClick={() => openNewPost()}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-black font-semibold gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Post
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                      <button
                        onClick={() => openNewPost(day)}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#4ade80]/20 flex items-center justify-center transition-colors"
                        title="Adicionar post"
                      >
                        <Plus className="w-3 h-3 text-white/60" />
                      </button>
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
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_CONFIG[(post.status as PostStatus) || "draft"].color}`}>
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
                  <Button
                    onClick={() => openNewPost()}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-white/20 text-white/70 hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Criar primeiro post
                  </Button>
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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[(post.status as PostStatus) || "draft"].color}`}>
                          {STATUS_CONFIG[(post.status as PostStatus) || "draft"].label}
                        </span>
                        <button
                          onClick={() => openEditPost(post)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Remover este post?")) deletePost.mutate({ id: post.id }); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
        <DialogContent className="bg-[#0f1724] border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editingPost ? <Edit3 className="w-4 h-4 text-[#4ade80]" /> : <Plus className="w-4 h-4 text-[#4ade80]" />}
              {editingPost ? "Editar Post" : "Novo Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-white/70 text-xs">Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Reels sobre Brasília Cidade Parque"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

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

            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs">Data *</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs">Hora *</Label>
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

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

            <div className="col-span-2">
              <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Métricas Projetadas
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> Alcance</Label>
                  <Input
                    type="number"
                    value={form.expectedReach}
                    onChange={(e) => setForm({ ...form, expectedReach: Number(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs flex items-center gap-1"><Heart className="w-3 h-3" /> Curtidas</Label>
                  <Input
                    type="number"
                    value={form.expectedLikes}
                    onChange={(e) => setForm({ ...form, expectedLikes: Number(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Comentários</Label>
                  <Input
                    type="number"
                    value={form.expectedComments}
                    onChange={(e) => setForm({ ...form, expectedComments: Number(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Orçamento (R$)
              </Label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="0,00"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                min={0}
                step={0.01}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs">Observações</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas adicionais..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setModalOpen(false); setEditingPost(null); setForm(defaultForm); }}
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              Cancelar
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
    </div>
  );
}
