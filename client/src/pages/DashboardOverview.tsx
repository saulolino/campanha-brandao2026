import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import RealTimeMetricsSection from "@/components/RealTimeMetricsSection";
import { UserPlus, TrendingUp, Target, Calendar } from "lucide-react";

export default function DashboardOverview() {
  const [, navigate] = useLocation();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="dashboard" onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Visão Geral</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho geral da campanha</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Seguidores"
              value={12450}
              icon={UserPlus}
            />
            <MetricCard
              title="Taxa de Engajamento"
              value={8.5}
              suffix="%"
              decimals={1}
              icon={TrendingUp}
            />
            <MetricCard
              title="Posts Publicados"
              value={47}
              icon={Target}
            />
            <MetricCard
              title="Próxima Publicação"
              value={14}
              suffix=":30"
              icon={Calendar}
            />
          </div>

          {/* Real Time Metrics */}
          <RealTimeMetricsSection />
        </div>
      </main>
    </div>
  );
}
