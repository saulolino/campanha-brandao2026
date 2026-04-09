import { useEffect, useState } from "react";

export interface LocalUser {
  email: string;
  nome: string;
  name?: string; // Alias para nome
  role: "visitor" | "team" | "coordinator" | "superadmin";
  whatsapp: string;
}

/**
 * Lê o usuário do localStorage de forma síncrona.
 * Usado para inicializar o estado sem flash de loading.
 */
function readUserFromStorage(): LocalUser | null {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser) as LocalUser;
    }
  } catch {
    // Ignorar erros de parse
  }
  return null;
}

/**
 * Hook para ler dados do usuário do localStorage.
 * Inicializa de forma síncrona para evitar condição de corrida nos guards de rota.
 */
export function useLocalAuth() {
  // Inicialização síncrona — lê o localStorage imediatamente, sem esperar useEffect
  const [user, setUser] = useState<LocalUser | null>(() => readUserFromStorage());
  // loading=false desde o início pois a leitura é síncrona
  const [loading] = useState(false);

  // Recarregar quando o storage muda (em outras abas ou após logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
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
