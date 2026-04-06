import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

interface CollaborativeUser {
  userId: number;
  userName: string;
  role: string;
}

interface DraftUpdate {
  field: "caption" | "hashtags" | "title";
  value: string;
  userId: number;
  userName: string;
}

export function useCollaboration(postId: number | null) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<DraftUpdate | null>(null);

  useEffect(() => {
    if (!user || !postId) return;

    // Conectar ao servidor WebSocket
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[Collaboration] Connected to server");

      // Entrar na sala do post
      socket.emit("join-post", {
        postId,
        userId: user.id,
        userName: user.name || "Usuário",
        role: user.role || "user",
      });
    });

    socket.on("user-joined", (data: any) => {
      setActiveUsers((prev) => [
        ...prev.filter((u) => u.userId !== data.userId),
        {
          userId: data.userId,
          userName: data.userName,
          role: data.role,
        },
      ]);
    });

    socket.on("user-left", (data: any) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    socket.on("draft-updated", (data: DraftUpdate) => {
      setLastUpdate(data);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[Collaboration] Disconnected from server");
    });

    return () => {
      if (socket) {
        socket.emit("leave-post", { postId });
        socket.disconnect();
      }
    };
  }, [user, postId]);

  const sendDraftUpdate = useCallback(
    (field: "caption" | "hashtags" | "title", value: string) => {
      if (socketRef.current && isConnected && user) {
        socketRef.current.emit("draft-update", {
          postId,
          field,
          value,
          userId: user.id,
          userName: user.name || "Usuário",
        });
      }
    },
    [postId, isConnected, user]
  );

  const sendCursorMove = useCallback(
    (x: number, y: number) => {
      if (socketRef.current && isConnected && user) {
        socketRef.current.emit("cursor-move", {
          postId,
          x,
          y,
          userName: user.name || "Usuário",
        });
      }
    },
    [postId, isConnected, user]
  );

  return {
    isConnected,
    activeUsers,
    lastUpdate,
    sendDraftUpdate,
    sendCursorMove,
  };
}
