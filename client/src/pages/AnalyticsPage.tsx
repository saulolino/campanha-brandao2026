import { useState } from "react";
import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import Sidebar from "@/components/Sidebar";
import StatusTrackerSection from "@/components/StatusTrackerSection";
import PostPerformance from "@/pages/PostPerformance";
import WeeklyReportSection from "@/components/WeeklyReportSection";
import CompetitorsSection from "@/components/CompetitorsSection";

export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();
  const [activeTab, setActiveTab] = useState("tracker");

  const handleNavigate = (itemId: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "realtime": "/dashboard",
      "publicacoes": "/publicacoes",
      "performance": "/performance",
      "nextweek": "/planejamento",
      "calendar": "/planejamento",
      "monthlycal": "/planejamento",
      "contentbank": "/conteudo",
      "content": "/conteudo",
      "briefing": "/conteudo",
      "tracker": "/analise",
      "growth": "/analise",
      "report": "/analise",
      "competitors": "/analise",
      "pillars": "/conteudo",
      "donts": "/conteudo",
      "moodboard": "/conteudo",
      "team": "/conteudo",
      "budget": "/conteudo",
      "supporters": "/apoiadores",
      "notifications": "/home",
      "testimonials": "/home",
      "checklist": "/home",
      "admin": "/admin"
    };
    const route = routeMap[itemId] || "/home";
    navigate(route);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="analise" onNavigate={handleNavigate} />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Análise</h1>
            <p className="text-muted-foreground">Acompanhe desempenho e métricas</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("tracker")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "tracker"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Status dos Posts
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "performance"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "report"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Relatório Semanal
            </button>
            <button
              onClick={() => setActiveTab("competitors")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "competitors"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Concorrentes
            </button>
          </div>

          {/* Content */}
          {activeTab === "tracker" && <StatusTrackerSection />}
          {activeTab === "performance" && <PostPerformance />}
          {activeTab === "report" && <WeeklyReportSection />}
          {activeTab === "competitors" && <CompetitorsSection />}
        </div>
      </main>
    </div>
  );
}
