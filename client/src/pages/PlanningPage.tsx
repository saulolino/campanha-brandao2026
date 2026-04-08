import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NextWeekSection from "@/components/NextWeekSection";
import MonthlyCalendarSection from "@/components/MonthlyCalendarSection";

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState("nextweek");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="planejamento" onNavigate={() => {}} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Planejamento</h1>
            <p className="text-muted-foreground">Organize e acompanhe publicações</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("nextweek")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "nextweek"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Próxima Semana
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "calendar"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendário Mensal
            </button>
          </div>

          {/* Content */}
          {activeTab === "nextweek" && <NextWeekSection />}
          {activeTab === "calendar" && <MonthlyCalendarSection />}
        </div>
      </main>
    </div>
  );
}
