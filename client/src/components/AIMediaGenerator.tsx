import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, RotateCcw, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AIMediaGeneratorProps {
  onMediaGenerated: (mediaUrl: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIMediaGenerator({ onMediaGenerated, isOpen, onOpenChange }: AIMediaGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutation para gerar imagem com IA
  const generateImageMutation = trpc.system.generateImage.useMutation({
    onSuccess: (data: any) => {
      setGeneratedImageUrl(data.url || null);
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Erro ao gerar imagem. Tente novamente.";
      setError(errorMessage);
    },
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, descreva a imagem que deseja gerar");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generateImageMutation.mutateAsync({
        prompt: prompt.trim(),
      });
    } catch (err) {
      console.error("[AIMediaGenerator] Erro ao gerar imagem:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = async () => {
    if (!generatedImageUrl) {
      setError("Nenhuma imagem gerada");
      return;
    }

    try {
      // Converter URL para base64 para armazenar no localStorage
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = reader.result as string;
        onMediaGenerated(base64Data);
        resetForm();
        onOpenChange(false);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("[AIMediaGenerator] Erro ao processar imagem:", err);
      setError("Erro ao processar a imagem. Tente novamente.");
    }
  };

  const handleRegenerate = () => {
    setGeneratedImageUrl(null);
    handleGenerate();
  };

  const resetForm = () => {
    setPrompt("");
    setGeneratedImageUrl(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" />
            Gerar Imagem com IA
          </DialogTitle>
          <DialogDescription>
            Descreva a imagem que deseja gerar e a IA criará para você
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição da Imagem</label>
            <Textarea
              placeholder="Ex: Uma imagem de um pôr do sol em Brasília com o Palácio do Planalto ao fundo, cores quentes e vibrantes..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-24 resize-none"
            />
            <p className="text-xs text-gray-500">
              Seja descritivo para melhores resultados. Inclua cores, estilo, objetos e atmosfera.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImageUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem Gerada</label>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={generatedImageUrl}
                  alt="Imagem gerada por IA"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                <p className="text-sm text-gray-600">Gerando imagem...</p>
                <p className="text-xs text-gray-500">Isso pode levar alguns segundos</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {generatedImageUrl && !isGenerating ? (
              <>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerar
                </Button>
                <Button
                  onClick={handleUseImage}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isGenerating}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Usar Imagem
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={isGenerating || !prompt.trim()}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGenerating ? "Gerando..." : "Gerar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
