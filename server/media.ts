import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Upload de mídia para posts do Instagram
 * Suporta imagens (JPEG, PNG, WebP) e vídeos (MP4, MOV)
 */

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export interface UploadedMedia {
  url: string;
  key: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
}

/**
 * Upload de arquivo de mídia para S3
 * @param fileBuffer Buffer do arquivo
 * @param mimeType Tipo MIME do arquivo
 * @param fileName Nome original do arquivo
 * @returns URL pública e metadados do arquivo
 */
export async function uploadMedia(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<UploadedMedia> {
  // Validar tipo de arquivo
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

  if (!isImage && !isVideo) {
    throw new Error(`Tipo de arquivo não permitido: ${mimeType}`);
  }

  // Validar tamanho
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (fileBuffer.length > maxSize) {
    throw new Error(
      `Arquivo muito grande. Máximo: ${maxSize / (1024 * 1024)}MB`
    );
  }

  // Gerar chave única
  const ext = fileName.split(".").pop() || "file";
  const key = `posts/${Date.now()}-${nanoid(8)}.${ext}`;

  // Upload para S3
  const { url } = await storagePut(key, fileBuffer, mimeType);

  return {
    url,
    key,
    type: isImage ? "image" : "video",
    mimeType,
    size: fileBuffer.length,
  };
}

/**
 * Converter array de URLs de mídia para JSON
 */
export function serializeMediaUrls(urls: string[]): string {
  return JSON.stringify(urls);
}

/**
 * Converter JSON de URLs de mídia para array
 */
export function deserializeMediaUrls(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}
