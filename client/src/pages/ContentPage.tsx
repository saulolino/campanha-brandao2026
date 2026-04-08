import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ContentBankSection from "@/components/ContentBankSection";
import CreativeBriefingSection from "@/components/CreativeBriefingSection";
import MoodboardSection from "@/components/MoodboardSection";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("bank");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="conteudo" onNavigate={() => {}} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Conteúdo</h1>
            <p className="text-muted-foreground">Crie e organize materiais de campanha</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("bank")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "bank"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Banco de Conteúdo
            </button>
            <button
              onClick={() => setActiveTab("briefing")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "briefing"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Briefing Criativo
            </button>
            <button
              onClick={() => setActiveTab("moodboard")}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === "moodboard"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Moodboard
            </button>
          </div>

          {/* Content */}
          {activeTab === "bank" && <ContentBankSection />}
          {activeTab === "briefing" && <CreativeBriefingSection />}
          {activeTab === "moodboard" && <MoodboardSection />}
        </div>
      </main>
    </div>
  );
}
