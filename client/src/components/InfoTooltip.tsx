import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  text: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export default function InfoTooltip({ text, side = "top", className = "" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors ${className}`}
          aria-label="Informação"
        >
          <HelpCircle size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
