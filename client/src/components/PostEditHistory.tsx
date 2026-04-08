import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface EditHistoryEntry {
  id: string;
  timestamp: Date;
  changedBy: string;
  changedByRole: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  comment?: string;
}

interface PostEditHistoryProps {
  postId: string;
  history: EditHistoryEntry[];
  isLoading?: boolean;
}

export function PostEditHistory({ postId, history, isLoading = false }: PostEditHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Carregando histórico...</span>
        </div>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Nenhuma alteração registrada</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-muted/30 border-border/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Histórico de Alterações ({history.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
          {history.map((entry, index) => (
            <div key={entry.id || index} className="flex gap-3 text-sm">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                {index < history.length - 1 && (
                  <div className="w-0.5 h-12 bg-border/50 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-muted-foreground" />
                    <span className="font-medium text-foreground">{entry.changedBy}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.changedByRole}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground mb-2">
                  {format(new Date(entry.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>

                <div className="bg-background/50 rounded p-2 space-y-1">
                  <div className="text-xs">
                    <span className="font-medium">Campo:</span>{" "}
                    <span className="text-muted-foreground">{entry.fieldChanged}</span>
                  </div>
                  {entry.oldValue && (
                    <div className="text-xs">
                      <span className="font-medium">De:</span>{" "}
                      <span className="text-destructive line-through">{entry.oldValue}</span>
                    </div>
                  )}
                  {entry.newValue && (
                    <div className="text-xs">
                      <span className="font-medium">Para:</span>{" "}
                      <span className="text-green-600">{entry.newValue}</span>
                    </div>
                  )}
                  {entry.comment && (
                    <div className="text-xs italic text-muted-foreground">
                      "{entry.comment}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
