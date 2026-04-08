import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePostPermissions } from "@/hooks/usePostPermissions";
import { PostEditHistory, EditHistoryEntry } from "./PostEditHistory";

interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  scheduledDate: string;
  mediaUrls?: string[];
  status: "scheduled" | "draft" | "published";
  coordinatorId?: string;
}

interface ScheduledPostEditorProps {
  post: ScheduledPost | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPost: ScheduledPost) => Promise<void>;
}

export function ScheduledPostEditor({
  post,
  isOpen,
  onOpenChange,
  onSave,
}: ScheduledPostEditorProps) {
  const { user } = useAuth();
  const { canEdit, canPublish } = usePostPermissions();
  const [formData, setFormData] = useState<ScheduledPost | null>(post);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Atualizar formData quando post muda
  if (post && formData?.id !== post.id) {
    setFormData(post);
  }

  const handleInputChange = (field: keyof ScheduledPost, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!formData) return;

    // Validar permissão
    if (!canEdit || !canPublish) {
      setError("Você não tem permissão para editar posts programados. Apenas Coordenadores podem editar.");
      return;
    }

    // Validar campos obrigatórios
    if (!formData.title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    if (!formData.caption.trim()) {
      setError("Legenda é obrigatória");
      return;
    }

    if (!formData.scheduledDate) {
      setError("Data de publicação é obrigatória");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(formData);
      setSuccessMessage("Post atualizado com sucesso!");
      
      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar post";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData(post);
    setError(null);
    setSuccessMessage(null);
    onOpenChange(false);
  };

  if (!formData) return null;

  const isCoordinator = canEdit && canPublish;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Post Programado</DialogTitle>
          <DialogDescription>
            Edite os detalhes do post programado para {new Date(formData.scheduledDate).toLocaleDateString("pt-BR")}
          </DialogDescription>
        </DialogHeader>

        {!isCoordinator && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Permissão Negada</p>
              <p className="text-xs text-red-700 mt-1">
                Apenas Coordenadores podem editar posts programados.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Título do post"
              disabled={!isCoordinator || isSaving}
              className="text-sm"
            />
          </div>

          {/* Legenda */}
          <div className="space-y-2">
            <Label htmlFor="caption">Legenda</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => handleInputChange("caption", e.target.value)}
              placeholder="Legenda do post"
              disabled={!isCoordinator || isSaving}
              className="min-h-24 resize-none text-sm"
            />
          </div>

          {/* Data de Publicação */}
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Data de Publicação</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate.slice(0, 16)}
              onChange={(e) => handleInputChange("scheduledDate", new Date(e.target.value).toISOString())}
              disabled={!isCoordinator || isSaving}
              className="text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium capitalize">
                {formData.status === "scheduled" ? "Programado" : formData.status === "draft" ? "Rascunho" : "Publicado"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.status === "scheduled" && "Este post será publicado na data agendada"}
                {formData.status === "draft" && "Este post está em rascunho"}
                {formData.status === "published" && "Este post já foi publicado"}
              </p>
            </div>
          </div>

          {/* Histórico de Alterações */}
          <div className="space-y-2">
            <Label>Histórico de Alterações</Label>
            <PostEditHistory
              postId={formData.id}
              history={[
                {
                  id: "1",
                  timestamp: new Date(),
                  changedBy: user?.name || "Usuário",
                  changedByRole: user?.role || "unknown",
                  fieldChanged: "Título",
                  oldValue: "Post anterior",
                  newValue: formData.title,
                  comment: "Atualizado via editor",
                },
              ]}
            />
          </div>

          {/* Mensagens de Erro e Sucesso */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isCoordinator || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
