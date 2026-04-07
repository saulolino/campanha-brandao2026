import { useEffect, useState } from "react";

export interface LocalUser {
  email: string;
  nome: string;
  name?: string; // Alias para nome
  role: "visitor" | "team" | "coordinator" | "superadmin";
  whatsapp: string;
}

/**
 * Hook para ler dados do usuário do localStorage
 * Usado para o sistema de login simples
 */
export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Erro ao ler usuário do localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarregar quando o storage muda (em outras abas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
