import { useState, useEffect } from "react";

export interface ImageVersion {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  editedBy: string;
}

export interface ImageWithVersions {
  postId: number;
  versions: ImageVersion[];
  currentVersionId: string;
}

/**
 * Hook para gerenciar versões de imagens em posts
 * Armazena histórico de edições em localStorage
 */
export function useImageVersions() {
  const [imageVersions, setImageVersions] = useState<Map<number, ImageWithVersions>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar versões do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("imageVersions");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const map = new Map<number, ImageWithVersions>();
        Object.entries(data).forEach(([key, value]) => {
          map.set(parseInt(key), value as ImageWithVersions);
        });
        setImageVersions(map);
      } catch (err) {
        console.error("Erro ao carregar versões de imagens:", err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar versões no localStorage
  const saveVersions = (updated: Map<number, ImageWithVersions>) => {
    setImageVersions(updated);
    const obj = Object.fromEntries(updated);
    localStorage.setItem("imageVersions", JSON.stringify(obj));
  };

  // Adicionar versão de imagem
  const addVersion = (
    postId: number,
    url: string,
    prompt: string,
    editedBy: string = "Usuário"
  ) => {
    const updated = new Map(imageVersions);
    const existing = updated.get(postId) || {
      postId,
      versions: [],
      currentVersionId: "",
    };

    const newVersion: ImageVersion = {
      id: `v${Date.now()}`,
      url,
      prompt,
      createdAt: new Date().toISOString(),
      editedBy,
    };

    existing.versions.push(newVersion);
    existing.currentVersionId = newVersion.id;

    updated.set(postId, existing);
    saveVersions(updated);

    return newVersion;
  };

  // Obter versões de um post
  const getVersions = (postId: number) => {
    return imageVersions.get(postId)?.versions || [];
  };

  // Obter versão atual
  const getCurrentVersion = (postId: number) => {
    const data = imageVersions.get(postId);
    if (!data) return null;

    return data.versions.find((v) => v.id === data.currentVersionId) || null;
  };

  // Reverter para versão anterior
  const revertToVersion = (postId: number, versionId: string) => {
    const updated = new Map(imageVersions);
    const data = updated.get(postId);

    if (data) {
      data.currentVersionId = versionId;
      updated.set(postId, data);
      saveVersions(updated);
      return true;
    }

    return false;
  };

  // Deletar versão
  const deleteVersion = (postId: number, versionId: string) => {
    const updated = new Map(imageVersions);
    const data = updated.get(postId);

    if (data) {
      data.versions = data.versions.filter((v) => v.id !== versionId);

      // Se deletou a versão atual, muda para a mais recente
      if (data.currentVersionId === versionId && data.versions.length > 0) {
        data.currentVersionId = data.versions[data.versions.length - 1].id;
      }

      if (data.versions.length === 0) {
        updated.delete(postId);
      } else {
        updated.set(postId, data);
      }

      saveVersions(updated);
      return true;
    }

    return false;
  };

  return {
    imageVersions,
    addVersion,
    getVersions,
    getCurrentVersion,
    revertToVersion,
    deleteVersion,
    isLoaded,
  };
}
