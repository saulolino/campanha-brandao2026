import { useState, useEffect } from "react";

/**
 * Hook para gerenciar prompts favoritos
 * Armazena favoritos em localStorage
 */
export function useFavoritePrompts() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favoritePrompts");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = (updated: string[]) => {
    setFavorites(updated);
    localStorage.setItem("favoritePrompts", JSON.stringify(updated));
  };

  // Adicionar favorito
  const addFavorite = (prompt: string) => {
    if (!favorites.includes(prompt)) {
      saveFavorites([...favorites, prompt]);
      return true;
    }
    return false;
  };

  // Remover favorito
  const removeFavorite = (prompt: string) => {
    const updated = favorites.filter((p) => p !== prompt);
    saveFavorites(updated);
    return true;
  };

  // Verificar se é favorito
  const isFavorite = (prompt: string) => favorites.includes(prompt);

  // Alternar favorito
  const toggleFavorite = (prompt: string) => {
    if (isFavorite(prompt)) {
      removeFavorite(prompt);
      return false;
    } else {
      addFavorite(prompt);
      return true;
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    isLoaded,
  };
}
