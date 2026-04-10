import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { streetEvents } from "../../drizzle/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import crypto from "crypto";

const randomSuffix = () => crypto.randomBytes(6).toString("hex");

export const streetEventsRouter = router({
  /**
   * Listar todos os eventos de rua
   */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(200),
      offset: z.number().default(0),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let conditions: any[] = [];
      if (input.startDate) conditions.push(gte(streetEvents.eventDate, input.startDate));
      if (input.endDate) conditions.push(lte(streetEvents.eventDate, input.endDate));

      const rows = conditions.length > 0
        ? await db.select().from(streetEvents).where(and(...conditions)).orderBy(streetEvents.eventDate).limit(input.limit).offset(input.offset)
        : await db.select().from(streetEvents).orderBy(streetEvents.eventDate).limit(input.limit).offset(input.offset);

      return rows;
    }),

  /**
   * Buscar evento por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const rows = await db.select().from(streetEvents).where(eq(streetEvents.id, input.id)).limit(1);
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Evento não encontrado" });
      return rows[0];
    }),

  /**
   * Criar novo evento de rua
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      type: z.enum(["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]),
      status: z.enum(["planejado", "confirmado", "realizado", "cancelado"]).default("planejado"),
      eventDate: z.date(),
      eventTime: z.string().max(5).default("09:00"),
      endTime: z.string().max(5).optional(),
      location: z.string().min(1).max(500),
      neighborhood: z.string().max(255).optional(),
      city: z.string().max(255).default("Brasília"),
      expectedAttendees: z.number().default(0),
      actualAttendees: z.number().optional(),
      mediaUrls: z.string().optional(), // JSON array de URLs
      notes: z.string().optional(),
      responsibleId: z.number().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.insert(streetEvents).values({
        title: input.title,
        description: input.description,
        type: input.type,
        status: input.status,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        endTime: input.endTime,
        location: input.location,
        neighborhood: input.neighborhood,
        city: input.city,
        expectedAttendees: input.expectedAttendees,
        actualAttendees: input.actualAttendees,
        mediaUrls: input.mediaUrls,
        notes: input.notes,
        responsibleId: input.responsibleId,
        lat: input.lat ? String(input.lat) : null,
        lng: input.lng ? String(input.lng) : null,
      });

      return { success: true, message: "Evento criado com sucesso" };
    }),

  /**
   * Atualizar evento de rua
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      type: z.enum(["caminhada", "reuniao", "panfletagem", "visita", "debate", "entrevista", "show", "outro"]).optional(),
      status: z.enum(["planejado", "confirmado", "realizado", "cancelado"]).optional(),
      eventDate: z.date().optional(),
      eventTime: z.string().max(5).optional(),
      endTime: z.string().max(5).optional(),
      location: z.string().min(1).max(500).optional(),
      neighborhood: z.string().max(255).optional(),
      city: z.string().max(255).optional(),
      expectedAttendees: z.number().optional(),
      actualAttendees: z.number().optional(),
      mediaUrls: z.string().optional(),
      notes: z.string().optional(),
      responsibleId: z.number().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, lat, lng, ...updateData } = input;
      const updateSet: Record<string, unknown> = {};
      Object.entries(updateData).forEach(([key, val]) => {
        if (val !== undefined) updateSet[key] = val;
      });
      // Coordenadas: aceitar null explicitamente para limpar
      if (lat !== undefined) updateSet.lat = lat !== null ? String(lat) : null;
      if (lng !== undefined) updateSet.lng = lng !== null ? String(lng) : null;

      if (Object.keys(updateSet).length === 0) {
        return { success: true, message: "Nenhuma alteração" };
      }

      await db.update(streetEvents).set(updateSet).where(eq(streetEvents.id, id));
      return { success: true, message: "Evento atualizado com sucesso" };
    }),

  /**
   * Remover evento de rua
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Apenas coordenador e superadmin podem deletar
      if (!ctx.user || !["coordinator", "superadmin"].includes(ctx.user.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas coordenadores e superadmins podem remover eventos" });
      }

      await db.delete(streetEvents).where(eq(streetEvents.id, input.id));
      return { success: true };
    }),

  /**
   * Upload de material gráfico/mídia para um evento
   */
  uploadMedia: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileBase64: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() || "bin";
      const fileKey = `street-events/${randomSuffix()}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType || "application/octet-stream");
      return { url, key: fileKey };
    }),
});
