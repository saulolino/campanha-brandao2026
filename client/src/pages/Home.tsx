import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Se o usuário está carregando, não fazer nada
    if (loading) return;

    // Se o usuário está autenticado, redirecionar para o painel de visão geral
    if (user) {
      setLocation("/visao-geral");
    }
  }, [user, loading, setLocation]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
