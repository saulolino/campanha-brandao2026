// ============================================================
// GERENCIADOR DE PUBLICAÇÕES
// Fluxo colaborativo: Designer → Redator → Coordenador → Publicação
// ============================================================
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import NotFound from "./NotFound";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Image,
  Edit,
  Eye,
  Trash2,
  ChevronRight,
  Palette,
  Type,
  CheckSquare,
  X,
  Upload,
  Download,
  Copy,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-gray-500/20 text-gray-400", icon: AlertCircle },
  design: { label: "Design", color: "bg-blue-500/20 text-blue-400", icon: Palette },
  caption: { label: "Legenda", color: "bg-purple-500/20 text-purple-400", icon: Type },
  review: { label: "Revisão", color: "bg-yellow-500/20 text-yellow-400", icon: Eye },
  scheduled: { label: "Agendado", color: "bg-cyan-500/20 text-cyan-400", icon: Clock },
  published: { label: "Publicado", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  failed: { label: "Falha", color: "bg-red-500/20 text-red-400", icon: X },
};

const flowSteps = [
  { status: "design", label: "Design", role: "Designer", icon: Palette },
  { status: "caption", label: "Legenda", role: "Redator", icon: Type },
  { status: "review", label: "Revisão", role: "Coordenador", icon: Eye },
  { status: "scheduled", label: "Agendado", role: "Coordenador", icon: Clock },
  { status: "published", label: "Publicado", role: "Sistema", icon: CheckCircle2 },
];

interface Post {
  id: number;
  title: string;
  caption: string;
  status: string;
  scheduledDate: string;
  createdBy: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  history: TransitionHistory[];
}

interface TransitionHistory {
  timestamp: string;
  fromStatus: string;
  toStatus: string;
  movedBy: string;
}

interface Filters {
  searchTerm: string;
  status: string | undefined;
  creator: string | undefined;
  dateFrom: string;
  dateTo: string;
}

export default function PublicationManager() {
  const { user } = useLocalAuth();
  const { isVisitor } = usePermissions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [newPostData, setNewPostData] = useState({ title: "", caption: "", scheduledDate: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    status: undefined,
    creator: undefined,
    dateFrom: "",
    dateTo: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar posts do localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (err) {
        console.error("Erro ao carregar posts:", err);
      }
    }
  }, []);

  // Salvar posts no localStorage
  const savePosts = (updatedPosts: Post[]) => {
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  // Visitante não tem acesso
  if (isVisitor) {
    return <NotFound />;
  }

  const handleCreatePost = () => {
    if (!newPostData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      title: newPostData.title,
      caption: newPostData.caption,
      status: "draft",
      scheduledDate: newPostData.scheduledDate,
      createdBy: user?.email || "Usuário",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: previewImage || undefined,
      history: [],
    };

    savePosts([...posts, newPost]);
    setShowNewPostDialog(false);
    setNewPostData({ title: "", caption: "", scheduledDate: "" });
    setPreviewImage(null);
    toast.success("Post criado com sucesso!");
  };

  const handleDuplicatePost = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const duplicatedPost: Post = {
      id: Date.now(),
      title: `${post.title} (cópia)`,
      caption: post.caption,
      status: "draft",
      scheduledDate: "",
      createdBy: user?.email || "Usuário",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: post.mediaUrl,
      history: [],
    };

    savePosts([...posts, duplicatedPost]);
    toast.success(`Post "${post.title}" duplicado com sucesso!`);
  };

  const handleEditPost = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setNewPostData({
        title: post.title,
        caption: post.caption,
        scheduledDate: post.scheduledDate,
      });
      setPreviewImage(post.mediaUrl || null);
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    if (!newPostData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const updatedPosts = posts.map((post) =>
      post.id === editingPostId
        ? {
            ...post,
            title: newPostData.title,
            caption: newPostData.caption,
            scheduledDate: newPostData.scheduledDate,
            mediaUrl: previewImage || post.mediaUrl,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email || "Usuário",
          }
        : post
    );

    savePosts(updatedPosts);
    setShowEditDialog(false);
    setEditingPostId(null);
    setNewPostData({ title: "", caption: "", scheduledDate: "" });
    setPreviewImage(null);
    toast.success("Post atualizado com sucesso!");
  };

  const handleUpdateStatus = (postId: number, newStatus: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const transition: TransitionHistory = {
      timestamp: new Date().toISOString(),
      fromStatus: post.status,
      toStatus: newStatus,
      movedBy: user?.email || "Usuário",
    };

    const updatedPosts = posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email || "Usuário",
            history: [...(p.history || []), transition],
          }
        : p
    );

    savePosts(updatedPosts);

    // Toast com informações detalhadas
    const fromLabel = statusConfig[post.status as keyof typeof statusConfig]?.label || post.status;
    const toLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus;
    const timestamp = format(new Date(), "HH:mm", { locale: ptBR });

    toast.success(
      `Post movido de "${fromLabel}" para "${toLabel}" por ${user?.name || "Você"} às ${timestamp}`
    );
  };

  const handleDeletePost = (postId: number) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    savePosts(updatedPosts);
    toast.success("Post deletado com sucesso!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Apenas imagens e vídeos são permitidos");
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máximo 10MB)");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewImage(result);
      toast.success("Mídia carregada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  // Aplicar filtros
  const filteredPosts = posts.filter((post) => {
    // Filtro de busca (título e legenda)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (
        !post.title.toLowerCase().includes(searchLower) &&
        !post.caption.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtro de status
    if (filters.status && post.status !== filters.status) {
      return false;
    }

    // Filtro de criador
    if (filters.creator && post.createdBy !== filters.creator) {
      return false;
    }

    // Filtro de data (data de criação)
    if (filters.dateFrom) {
      const postDate = new Date(post.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (postDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const postDate = new Date(post.createdAt);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (postDate > toDate) return false;
    }

    return true;
  });

  // Obter lista de criadores únicos
  const creators = Array.from(new Set(posts.map((p) => p.createdBy)));

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      status: undefined,
      creator: undefined,
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciador de Publicações</h1>
          <p className="text-muted-foreground">
            Fluxo colaborativo: Designer → Redator → Coordenador → Publicação
          </p>
        </div>

        {/* Flow Steps */}
        <div className="mb-8 bg-sidebar/50 rounded-lg p-4">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-center">{step.label}</span>
                    <span className="text-[10px] text-muted-foreground">{step.role}</span>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <ChevronRight size={16} className="text-muted-foreground/50 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou legenda..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
            <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={16} />
                  Novo Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                      placeholder="Título do post"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Legenda</label>
                    <Textarea
                      value={newPostData.caption}
                      onChange={(e) => setNewPostData({ ...newPostData, caption: e.target.value })}
                      placeholder="Legenda do post"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Agendamento</label>
                    <Input
                      type="datetime-local"
                      value={newPostData.scheduledDate}
                      onChange={(e) => setNewPostData({ ...newPostData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mídia (Imagem ou Vídeo)</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload size={16} />
                        Selecionar Arquivo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {previewImage && (
                        <Button
                          variant="ghost"
                          onClick={() => setPreviewImage(null)}
                          className="text-red-400"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                    {previewImage && (
                      <div className="mt-3 relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                        {previewImage.startsWith("data:video") ? (
                          <video src={previewImage} className="w-full h-full object-cover" />
                        ) : (
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleCreatePost} className="w-full">
                    Criar Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant={showFiltersPanel ? "default" : "outline"}
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="gap-2"
            >
              <Filter size={16} />
              Filtros
            </Button>
          </div>

          {/* Filters Panel */}
          {showFiltersPanel && (
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(val) =>
                      setFilters({ ...filters, status: val === "all" ? undefined : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Criador</label>
                  <Select
                    value={filters.creator || "all"}
                    onValueChange={(val) =>
                      setFilters({ ...filters, creator: val === "all" ? undefined : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {creators.map((creator) => (
                        <SelectItem key={creator} value={creator}>
                          {creator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">De</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Até</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1"
                >
                  Limpar Filtros
                </Button>
                <Button
                  onClick={() => setShowFiltersPanel(false)}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredPosts.length} de {posts.length} posts
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle size={32} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">
                {posts.length === 0 ? "Nenhum post encontrado" : "Nenhum post corresponde aos filtros"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const config = statusConfig[post.status as keyof typeof statusConfig];
              const Icon = config?.icon || AlertCircle;

              return (
                <Card key={post.id} className="p-4 hover:border-primary/50 transition-colors flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Por {post.createdBy}</p>
                      </div>
                      <Badge className={config?.color}>
                        <Icon size={12} className="mr-1" />
                        {config?.label}
                      </Badge>
                    </div>

                    {/* Media Preview */}
                    {post.mediaUrl && (
                      <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                        {post.mediaUrl.startsWith("data:video") ? (
                          <video src={post.mediaUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}

                    {/* Caption Preview */}
                    {post.caption && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.caption}</p>
                    )}

                    {/* Scheduled Date */}
                    {post.scheduledDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {format(new Date(post.scheduledDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>
                    )}

                    {/* Updated Info */}
                    {post.updatedBy && post.updatedAt !== post.createdAt && (
                      <div className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
                        Atualizado por {post.updatedBy} em{" "}
                        {format(new Date(post.updatedAt), "dd/MM HH:mm", { locale: ptBR })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-border mt-3 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPost(post.id)}
                      className="text-blue-400 hover:text-blue-300 gap-1 flex-1"
                    >
                      <Edit size={14} />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicatePost(post.id)}
                      className="text-green-400 hover:text-green-300 gap-1 flex-1"
                    >
                      <Copy size={14} />
                      Duplicar
                    </Button>
                    {post.status !== "published" && post.status !== "failed" && (
                      <Select value={post.status} onValueChange={(val) => handleUpdateStatus(post.id, val)}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newPostData.title}
                onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                placeholder="Título do post"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Legenda</label>
              <Textarea
                value={newPostData.caption}
                onChange={(e) => setNewPostData({ ...newPostData, caption: e.target.value })}
                placeholder="Legenda do post"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de Agendamento</label>
              <Input
                type="datetime-local"
                value={newPostData.scheduledDate}
                onChange={(e) => setNewPostData({ ...newPostData, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mídia (Imagem ou Vídeo)</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload size={16} />
                  Alterar Arquivo
                </Button>
                {previewImage && (
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewImage(null)}
                    className="text-red-400"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
              {previewImage && (
                <div className="mt-3 relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                  {previewImage.startsWith("data:video") ? (
                    <video src={previewImage} className="w-full h-full object-cover" />
                  ) : (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingPostId(null);
                  setNewPostData({ title: "", caption: "", scheduledDate: "" });
                  setPreviewImage(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
