import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RotateCcw, Trash2, Check } from "lucide-react";
import { ImageVersion } from "@/hooks/useImageVersions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ImageVersionHistoryProps {
  versions: ImageVersion[];
  currentVersionId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: (versionId: string) => void;
  onDelete: (versionId: string) => void;
}

export function ImageVersionHistory({
  versions,
  currentVersionId,
  isOpen,
  onOpenChange,
  onRevert,
  onDelete,
}: ImageVersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Versões de Imagem</DialogTitle>
          <DialogDescription>
            Visualize, reverta ou delete versões anteriores da imagem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {versions.map((version) => {
            const isCurrent = version.id === currentVersionId;
            return (
              <div
                key={version.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-green-50 border-green-300"
                    : "bg-muted border-border hover:border-purple-500/50"
                }`}
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                    <img
                      src={version.url}
                      alt={`Versão ${version.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {isCurrent ? "Versão Atual" : `Versão ${version.id}`}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                              Ativa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criado por: {version.editedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(version.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        {!isCurrent && (
                          <Button
                            onClick={() => onRevert(version.id)}
                            variant="outline"
                            size="sm"
                            title="Reverter para esta versão"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => onDelete(version.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          title="Deletar versão"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="mt-2 p-2 bg-background rounded text-xs">
                      <p className="font-medium mb-1">Prompt:</p>
                      <p className="text-muted-foreground line-clamp-2">{version.prompt}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
