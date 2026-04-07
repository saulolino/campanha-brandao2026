import { useState } from "react";
import { ChevronDown, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  createdAt: string;
}

interface ImageHistoryGalleryProps {
  images: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
}

export function ImageHistoryGallery({
  images,
  onSelectImage,
  onDeleteImage,
}: ImageHistoryGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (images.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-sidebar/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold hover:text-primary transition-colors"
      >
        <span>Histórico de Imagens ({images.length})</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            >
              {/* Imagem */}
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-24 object-cover group-hover:opacity-75 transition-opacity"
              />

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSelectImage(image)}
                  className="gap-1 text-xs"
                >
                  <Copy size={12} />
                  Usar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteImage(image.id)}
                  className="gap-1 text-xs"
                >
                  <Trash2 size={12} />
                  Deletar
                </Button>
              </div>

              {/* Tooltip com prompt */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {image.prompt}
              </div>

              {/* Data */}
              <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                {format(new Date(image.createdAt), "dd/MM", { locale: ptBR })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
