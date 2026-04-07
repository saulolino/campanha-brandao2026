import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, LogOut, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  activeSection?: string;
}

export default function DashboardLayout({ children, activeSection }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-primary/10 bg-background/50 backdrop-blur">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
                alt="Brasília Cidade Parque"
                className="w-10 h-10"
              />
              <h1 className="text-2xl font-bold">Brasília Cidade Parque</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/profile")}
                className="gap-2"
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
