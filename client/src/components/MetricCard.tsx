// DESIGN: Command Center Militar Verde
// Card de métrica com borda lateral colorida e animação
import AnimatedCounter from "./AnimatedCounter";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: "ok" | "warning" | "critical";
  decimals?: number;
}

export default function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  icon: Icon,
  status = "ok",
  decimals = 0,
}: MetricCardProps) {
  const statusClass = {
    ok: "status-ok",
    warning: "status-warning",
    critical: "status-critical",
  }[status];

  return (
    <div className={`bg-card rounded-lg p-4 ${statusClass} hover:bg-card/80 transition-colors duration-200`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <Icon size={14} className="text-muted-foreground/50" />
      </div>
      <div className="mb-1">
        <AnimatedCounter
          end={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-2xl font-bold text-foreground"
        />
      </div>
      {subtitle && (
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
