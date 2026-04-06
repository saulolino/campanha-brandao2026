import { useState, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import InfoTooltip from "@/components/InfoTooltip";
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

export default function PublicationManager() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: "", scheduledDate: "" });
  const [uploadingPostId, setUploadingPostId] = useState<number | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const collaboration = selectedPostId ? useCollaboration(selectedPostId) : null;

  // Queries
  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({
    status: selectedStatus as any,
  });

  // Mutations
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      setShowNewPostDialog(false);
      setNewPostData({ title: "", scheduledDate: "" });
      refetch();
    },
  });

  const sendToCaption = trpc.posts.sendToCaption.useMutation({ onSuccess: () => refetch() });
  const sendToReview = trpc.posts.sendToReview.useMutation({ onSuccess: () => refetch() });
  const approveAndSchedule = trpc.posts.approveAndSchedule.useMutation({ onSuccess: () => refetch() });
  const reject = trpc.posts.reject.useMutation({ onSuccess: () => refetch() });
  const publish = trpc.posts.publish.useMutation({ onSuccess: () => refetch() });
  const uploadMedia = trpc.posts.uploadMedia.useMutation({
    onSuccess: () => {
      toast.success("Mídia enviada com sucesso!");
      setUploadingPostId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mídia: ${error.message}`);
      setUploadingPostId(null);
    },
  });

  const handleFileUpload = async (postId: number, file: File) => {
    if (!file) return;
    
    const buffer = await file.arrayBuffer();
    setUploadingPostId(postId);
    
    uploadMedia.mutate({
      id: postId,
      file: new Uint8Array(buffer) as any,
      mimeType: file.type,
      fileName: file.name,
    });
  };

  const handleCreatePost = () => {
    if (!newPostData.title || !newPostData.scheduledDate) return;
    createPost.mutate({
      title: newPostData.title,
      scheduledDate: new Date(newPostData.scheduledDate),
    });
  };

  const getStatusIndex = (status: string) => flowSteps.findIndex(s => s.status === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciador de Publicações</h1>
          <p className="text-muted-foreground mt-1">Fluxo colaborativo: Designer → Redator → Coordenador → Publicação</p>
        </div>
        <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título do Post</label>
                <Input
                  placeholder="Ex: Brasília merece mais verde"
                  value={newPostData.title}
                  onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data Agendada</label>
                <Input
                  type="datetime-local"
                  value={newPostData.scheduledDate}
                  onChange={(e) => setNewPostData({ ...newPostData, scheduledDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreatePost} disabled={createPost.isPending} className="w-full">
                {createPost.isPending ? "Criando..." : "Criar Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === undefined ? "default" : "outline"}
          onClick={() => setSelectedStatus(undefined)}
        >
          Todos
        </Button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            className={selectedStatus === status ? "" : ""}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Lista de Posts */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando posts...</div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum post encontrado</div>
        ) : (
          posts.map((post: any) => {
            const statusInfo = statusConfig[post.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;
            const currentStepIndex = getStatusIndex(post.status);

            return (
              <Card key={post.id} className="p-4 hover:bg-card/80 transition-colors">
                <div className="space-y-3">
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Agendado para {format(new Date(post.scheduledDate), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={statusInfo.color}>
                      <StatusIcon size={12} className="mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Fluxo visual */}
                  <div className="flex items-center gap-1 py-2 overflow-x-auto">
                    {flowSteps.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isCompleted = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={step.status} className="flex items-center gap-1 shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : isCurrent
                                  ? "bg-primary/20 text-primary border border-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <StepIcon size={14} />
                          </div>
                          {idx < flowSteps.length - 1 && (
                            <ChevronRight
                              size={16}
                              className={isCompleted ? "text-green-500/50" : "text-muted-foreground/30"}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Conteúdo */}
                  {post.mediaUrls && (
                    <div className="bg-muted/50 rounded p-2 text-xs text-muted-foreground">
                      📸 {post.mediaUrls.length > 100 ? post.mediaUrls.substring(0, 100) + "..." : post.mediaUrls}
                    </div>
                  )}

                  {post.caption && (
                    <div className="bg-muted/50 rounded p-2 text-sm text-foreground">
                      <p className="line-clamp-2">{post.caption}</p>
                    </div>
                  )}

                  {/* Ações contextuais */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    {post.status === "design" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPostId === post.id}
                        >
                          <Image size={14} className="mr-1" /> {uploadingPostId === post.id ? "Enviando..." : "Adicionar Mídia"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(post.id, file);
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendToCaption.mutate({ id: post.id })}
                          disabled={sendToCaption.isPending}
                        >
                          <ChevronRight size={14} className="mr-1" /> Enviar para Legenda
                        </Button>
                      </>
                    )}

                    {post.status === "caption" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendToReview.mutate({ id: post.id })}
                          disabled={sendToReview.isPending}
                        >
                          <ChevronRight size={14} className="mr-1" /> Enviar para Revisão
                        </Button>
                      </>
                    )}

                    {post.status === "review" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveAndSchedule.mutate({ id: post.id })}
                          disabled={approveAndSchedule.isPending}
                        >
                          <CheckCircle2 size={14} className="mr-1" /> Aprovar e Agendar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => reject.mutate({ id: post.id, returnTo: "caption", comment: "Revisão necessária" })}
                          disabled={reject.isPending}
                        >
                          <AlertCircle size={14} className="mr-1" /> Devolver
                        </Button>
                      </>
                    )}

                    {post.status === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => publish.mutate({ id: post.id })}
                        disabled={publish.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send size={14} className="mr-1" /> Publicar Agora
                      </Button>
                    )}

                    {post.status === "published" && (
                      <Badge className="bg-green-500/20 text-green-400">
                        ✓ Publicado em {format(new Date(post.publishedAt!), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
