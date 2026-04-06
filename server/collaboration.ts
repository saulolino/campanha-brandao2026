import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { getDb } from "./db";
import { instagramPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface CollaborativeUser {
  userId: number;
  userName: string;
  role: string;
  postId: number;
}

interface DraftUpdate {
  postId: number;
  field: "caption" | "hashtags" | "title";
  value: string;
  userId: number;
  userName: string;
}

let io: SocketIOServer | null = null;
const activeUsers = new Map<string, CollaborativeUser>();

/**
 * Inicializar servidor WebSocket para colaboração em tempo real
 */
export function initializeCollaborationServer(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? undefined : "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Collaboration] User connected: ${socket.id}`);

    // Usuário entra em um post para colaborar
    socket.on("join-post", (data: { postId: number; userId: number; userName: string; role: string }) => {
      const roomId = `post-${data.postId}`;
      socket.join(roomId);

      activeUsers.set(socket.id, {
        userId: data.userId,
        userName: data.userName,
        role: data.role,
        postId: data.postId,
      });

      // Notificar outros usuários que alguém entrou
      io?.to(roomId).emit("user-joined", {
        userId: data.userId,
        userName: data.userName,
        role: data.role,
        totalUsers: io.sockets.adapter.rooms.get(roomId)?.size || 0,
      });

      console.log(`[Collaboration] User ${data.userName} joined post ${data.postId}`);
    });

    // Usuário sai de um post
    socket.on("leave-post", (data: { postId: number }) => {
      const roomId = `post-${data.postId}`;
      const user = activeUsers.get(socket.id);

      socket.leave(roomId);
      activeUsers.delete(socket.id);

      if (user) {
        io?.to(roomId).emit("user-left", {
          userId: user.userId,
          userName: user.userName,
          totalUsers: io.sockets.adapter.rooms.get(roomId)?.size || 0,
        });
      }
    });

    // Atualização de rascunho em tempo real
    socket.on("draft-update", async (data: DraftUpdate) => {
      const roomId = `post-${data.postId}`;
      const user = activeUsers.get(socket.id);

      if (!user) return;

      // Salvar no banco de dados
      const db = await getDb();
      if (db) {
        const updateData: any = {};
        updateData[data.field] = data.value;

        await db
          .update(instagramPosts)
          .set(updateData)
          .where(eq(instagramPosts.id, data.postId));
      }

      // Notificar outros usuários na sala
      socket.to(roomId).emit("draft-updated", {
        postId: data.postId,
        field: data.field,
        value: data.value,
        userId: data.userId,
        userName: data.userName,
      });

      console.log(
        `[Collaboration] ${data.userName} updated ${data.field} in post ${data.postId}`
      );
    });

    // Cursor position para colaboração visual
    socket.on("cursor-move", (data: { postId: number; x: number; y: number; userName: string }) => {
      const roomId = `post-${data.postId}`;
      socket.to(roomId).emit("cursor-moved", {
        userId: socket.id,
        userName: data.userName,
        x: data.x,
        y: data.y,
      });
    });

    // Desconexão
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        const roomId = `post-${user.postId}`;
        io?.to(roomId).emit("user-left", {
          userId: user.userId,
          userName: user.userName,
          totalUsers: io.sockets.adapter.rooms.get(roomId)?.size || 0,
        });
        activeUsers.delete(socket.id);
      }
      console.log(`[Collaboration] User disconnected: ${socket.id}`);
    });
  });

  console.log("[Collaboration] WebSocket server initialized");
  return io;
}

/**
 * Obter instância do servidor WebSocket
 */
export function getCollaborationServer(): SocketIOServer | null {
  return io;
}

/**
 * Obter usuários ativos em um post
 */
export function getActiveUsersInPost(postId: number): CollaborativeUser[] {
  return Array.from(activeUsers.values()).filter((user) => user.postId === postId);
}
