import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Notificar quando um post muda de status
 * Envia notificação ao dono do projeto e toast para o usuário
 */
export async function notifyPostStatusChange(
  postId: number,
  postTitle: string,
  previousStatus: string,
  newStatus: string,
  changedByUserId: number,
  comment?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Buscar informações do usuário que fez a mudança
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, changedByUserId))
    .limit(1);

  const userName = userResult[0]?.name || "Usuário";

  // Mapear status para descrição amigável
  const statusLabels: Record<string, string> = {
    design: "Design",
    caption: "Legenda",
    review: "Revisão",
    scheduled: "Agendado",
    published: "Publicado",
    failed: "Falha",
  };

  const previousLabel = statusLabels[previousStatus] || previousStatus;
  const newLabel = statusLabels[newStatus] || newStatus;

  // Notificar o dono do projeto
  const title = `Post "${postTitle}" - Mudança de Status`;
  const content = `${userName} moveu o post de "${previousLabel}" para "${newLabel}".${
    comment ? `\n\nComentário: ${comment}` : ""
  }`;

  await notifyOwner({ title, content });
}

/**
 * Notificar quando um post é publicado com sucesso
 */
export async function notifyPostPublished(
  postId: number,
  postTitle: string,
  instagramPostId?: string
): Promise<void> {
  const title = `Post Publicado: "${postTitle}"`;
  const content = instagramPostId
    ? `Post publicado com sucesso no Instagram.\nID do post: ${instagramPostId}`
    : "Post publicado com sucesso no Instagram.";

  await notifyOwner({ title, content });
}

/**
 * Notificar quando há erro ao publicar
 */
export async function notifyPublishError(
  postId: number,
  postTitle: string,
  error: string
): Promise<void> {
  const title = `Erro ao Publicar: "${postTitle}"`;
  const content = `Houve um erro ao tentar publicar o post no Instagram.\n\nErro: ${error}`;

  await notifyOwner({ title, content });
}
