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
}

export default function PublicationManager() {
  const { user } = useLocalAuth();
  const { isVisitor } = usePermissions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: "", caption: "", scheduledDate: "" });
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
    };

    savePosts([...posts, newPost]);
    setShowNewPostDialog(false);
    setNewPostData({ title: "", caption: "", scheduledDate: "" });
    toast.success("Post criado com sucesso!");
  };

  const handleUpdateStatus = (postId: number, newStatus: string) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, status: newStatus } : post
    );
    savePosts(updatedPosts);
    toast.success(`Post movido para ${statusConfig[newStatus as keyof typeof statusConfig]?.label}`);
  };

  const handleDeletePost = (postId: number) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    savePosts(updatedPosts);
    toast.success("Post deletado com sucesso!");
  };

  const filteredPosts = selectedStatus
    ? posts.filter((post) => post.status === selectedStatus)
    : posts;

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

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                <Button onClick={handleCreatePost} className="w-full">
                  Criar Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Select value={selectedStatus || ""} onValueChange={(val) => setSelectedStatus(val || undefined)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle size={32} className="mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">Nenhum post encontrado</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const config = statusConfig[post.status as keyof typeof statusConfig];
              const Icon = config?.icon || AlertCircle;

              return (
                <Card key={post.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="space-y-3">
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      {post.status !== "published" && post.status !== "failed" && (
                        <Select value={post.status} onValueChange={(val) => handleUpdateStatus(post.id, val)}>
                          <SelectTrigger className="h-8 text-xs">
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
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
