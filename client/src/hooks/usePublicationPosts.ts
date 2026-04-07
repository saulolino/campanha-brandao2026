import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export interface Post {
  id: number;
  title: string;
  caption: string;
  status: "draft" | "design" | "caption" | "review" | "scheduled" | "published" | "failed";
  scheduledDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  mediaUrl?: string;
  history: Array<{
    timestamp: string;
    fromStatus: string;
    toStatus: string;
    movedBy: string;
  }>;
}

export type SyncStatus = "idle" | "syncing" | "online" | "offline" | "error";

interface UsePublicationPostsReturn {
  posts: Post[];
  isLoading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
  createPost: (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updatePost: (id: number, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  movePostStatus: (id: number, newStatus: Post["status"]) => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const STORAGE_KEY = "publication_posts";
const SYNC_INTERVAL = 30000; // 30 segundos

export function usePublicationPosts(): UsePublicationPostsReturn {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Carregar posts do localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPosts(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error("[usePublicationPosts] Erro ao carregar localStorage:", err);
      setError("Erro ao carregar posts locais");
    }
  }, []);

  // Salvar posts no localStorage
  const saveToLocalStorage = useCallback((postsToSave: Post[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postsToSave));
    } catch (err) {
      console.error("[usePublicationPosts] Erro ao salvar localStorage:", err);
      setError("Erro ao salvar posts localmente");
    }
  }, []);

  // Sincronizar com servidor
  const syncWithServer = useCallback(async () => {
    if (!isOnlineRef.current) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");
    try {
      // Aqui você poderia chamar tRPC para sincronizar
      // const serverPosts = await trpc.posts.list.query({});
      // Merge logic: posts mais recentes do servidor sobrescrevem locais
      setSyncStatus("online");
      setError(null);
    } catch (err) {
      console.error("[usePublicationPosts] Erro ao sincronizar:", err);
      setSyncStatus("error");
      setError("Erro ao sincronizar com servidor");
    }
  }, []);

  // Criar novo post
  const createPost = useCallback(
    async (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
      if (!user) {
        setError("Usuário não autenticado");
        return;
      }

      const newPost: Post = {
        ...post,
        id: Date.now(),
        createdBy: user.email || "unknown",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      };

      const updated = [...posts, newPost];
      setPosts(updated);
      saveToLocalStorage(updated);

      // Tentar sincronizar com servidor se online
      if (isOnlineRef.current) {
        try {
          setSyncStatus("syncing");
          // await trpc.posts.create.mutate({...});
          setSyncStatus("online");
        } catch (err) {
          setSyncStatus("offline");
          console.error("[usePublicationPosts] Erro ao criar no servidor:", err);
        }
      }
    },
    [posts, user, saveToLocalStorage]
  );

  // Atualizar post
  const updatePost = useCallback(
    async (id: number, updates: Partial<Post>) => {
      const updated = posts.map((post) =>
        post.id === id
          ? {
              ...post,
              ...updates,
              updatedAt: new Date().toISOString(),
              updatedBy: user?.email || "unknown",
            }
          : post
      );

      setPosts(updated);
      saveToLocalStorage(updated);

      // Tentar sincronizar com servidor se online
      if (isOnlineRef.current) {
        try {
          setSyncStatus("syncing");
          // await trpc.posts.updateDesign.mutate({...});
          setSyncStatus("online");
        } catch (err) {
          setSyncStatus("offline");
          console.error("[usePublicationPosts] Erro ao atualizar no servidor:", err);
        }
      }
    },
    [posts, user, saveToLocalStorage]
  );

  // Deletar post
  const deletePost = useCallback(
    async (id: number) => {
      const updated = posts.filter((post) => post.id !== id);
      setPosts(updated);
      saveToLocalStorage(updated);

      // Tentar sincronizar com servidor se online
      if (isOnlineRef.current) {
        try {
          setSyncStatus("syncing");
          // await trpc.posts.delete.mutate({ id });
          setSyncStatus("online");
        } catch (err) {
          setSyncStatus("offline");
          console.error("[usePublicationPosts] Erro ao deletar no servidor:", err);
        }
      }
    },
    [posts, saveToLocalStorage]
  );

  // Mover post para novo status
  const movePostStatus = useCallback(
    async (id: number, newStatus: Post["status"]) => {
      const post = posts.find((p) => p.id === id);
      if (!post) {
        setError("Post não encontrado");
        return;
      }

      const transition = {
        timestamp: new Date().toISOString(),
        fromStatus: post.status,
        toStatus: newStatus,
        movedBy: user?.email || "unknown",
      };

      const updated = posts.map((p) =>
        p.id === id
          ? {
              ...p,
              status: newStatus,
              history: [...p.history, transition],
              updatedAt: new Date().toISOString(),
              updatedBy: user?.email || "unknown",
            }
          : p
      );

      setPosts(updated);
      saveToLocalStorage(updated);

      // Tentar sincronizar com servidor se online
      if (isOnlineRef.current) {
        try {
          setSyncStatus("syncing");
          // Chamar tRPC baseado no status
          // if (newStatus === "design") await trpc.posts.sendToCaption.mutate({...});
          setSyncStatus("online");
        } catch (err) {
          setSyncStatus("offline");
          console.error("[usePublicationPosts] Erro ao mover status no servidor:", err);
        }
      }
    },
    [posts, user, saveToLocalStorage]
  );

  // Inicializar: carregar do localStorage
  useEffect(() => {
    loadFromLocalStorage();
    setIsLoading(false);
  }, [loadFromLocalStorage]);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setSyncStatus("online");
      syncWithServer();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncWithServer]);

  // Sincronizar periodicamente
  useEffect(() => {
    if (isOnlineRef.current) {
      syncIntervalRef.current = setInterval(() => {
        syncWithServer();
      }, SYNC_INTERVAL);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncWithServer]);

  return {
    posts,
    isLoading,
    syncStatus,
    error,
    createPost,
    updatePost,
    deletePost,
    movePostStatus,
    syncWithServer,
  };
}
