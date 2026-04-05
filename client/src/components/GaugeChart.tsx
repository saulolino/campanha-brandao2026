// DESIGN: Command Center Militar Verde
// Gauge circular animado para métricas de progresso
import { useEffect, useState } from "react";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
}

export default function GaugeChart({ value, max, label, sublabel, size = 120, color = "#2d6a4f" }: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((animatedValue / max) * 100, 100);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.25 0.015 250)"
            strokeWidth="6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center leading-tight">{label}</span>
      {sublabel && <span className="text-[10px] text-muted-foreground/70">{sublabel}</span>}
    </div>
  );
}
