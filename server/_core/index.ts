import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeScheduler } from "../scheduler";
import { initializeCollaborationServer } from "../collaboration";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Proxy de imagem para thumbnails do Instagram (evita bloqueio CORS)
  app.get("/api/image-proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url || !url.startsWith('https://')) {
        res.status(400).json({ error: 'URL inválida' });
        return;
      }
      // Permitir apenas domínios do Instagram/Facebook CDN
      const allowed = ['cdninstagram.com', 'fbcdn.net', 'instagram.com', 'scontent'];
      const isAllowed = allowed.some(d => url.includes(d));
      if (!isAllowed) {
        res.status(403).json({ error: 'Domínio não permitido' });
        return;
      }
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CampanhaDashboard/1.0)',
          'Referer': 'https://www.instagram.com/',
        },
      });
      if (!response.ok) {
        res.status(response.status).end();
        return;
      }
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const buffer = await response.arrayBuffer();
      res.end(Buffer.from(buffer));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Rota REST para tarefa agendada: sincronização automática de posts via Apify
  // Aberta para qualquer requisição autenticada (incluindo scheduled-task cookie)
  app.post("/api/scheduled/sync-instagram", async (req, res) => {
    try {
      const { instagramService } = await import("../services/instagramService.js");
      console.log('[Scheduled] Iniciando sync automático de posts Instagram via Apify...');
      const result = await instagramService.syncPostsFromApify();
      console.log('[Scheduled] Sync concluído:', result);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Scheduled] Erro no sync automático:', msg);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // Rota REST para tarefa agendada: verificação e disparo de alertas eleitorais
  app.post("/api/scheduled/check-electoral-alerts", async (req, res) => {
    try {
      const { checkAndSendElectoralAlerts } = await import("../routers/electoralAlerts.js");
      console.log('[Scheduled] Verificando marcos eleitorais críticos...');
      const result = await checkAndSendElectoralAlerts();
      console.log('[Scheduled] Alertas eleitorais:', result);
      res.json({ success: true, ...result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Scheduled] Erro na verificação de alertas eleitorais:', msg);
      res.status(500).json({ success: false, error: msg });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

   server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Inicializar scheduler de posts
    initializeScheduler();
    // Inicializar WebSocket para colaboração
    initializeCollaborationServer(server);
    // Seed automático: importar posts históricos do JSON para o banco se ainda não foram importados
    seedInstagramPostsFromJson().catch((err) =>
      console.error('[Startup] Erro no seed automático de posts:', err)
    );
  });
}

/**
 * Importa os posts históricos do instagram_real_data.json para a tabela instagram_published_posts.
 * Executa apenas se o banco estiver vazio (evita re-importação desnecessária).
 * Mapeia o campo `id` do JSON como instagramId e as métricas reais (likes, comments, videoViewCount).
 */
async function seedInstagramPostsFromJson() {
  try {
    const { countInstagramPublishedPosts, bulkUpsertInstagramPublishedPosts } = await import('../db.js');
    const count = await countInstagramPublishedPosts();
    if (count > 0) {
      console.log(`[Startup] Banco já tem ${count} posts publicados — seed ignorado.`);
      return;
    }
    // Carregar JSON
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const rawData = require('../data/instagram_real_data.json');
    const posts: any[] = (rawData as any).posts ?? [];
    if (posts.length === 0) {
      console.warn('[Startup] JSON de posts vazio — seed ignorado.');
      return;
    }
    // Mapear tipo Apify -> mediaType do banco
    const typeMap: Record<string, string> = {
      Video: 'VIDEO',
      Image: 'IMAGE',
      Sidecar: 'CAROUSEL_ALBUM',
    };
    const postsToUpsert = posts.map((p: any) => ({
      instagramId: String(p.id || p.shortCode || ''),
      caption: p.caption ?? null,
      mediaType: (typeMap[p.type] ?? 'IMAGE') as any,
      mediaProductType: (p.type === 'Video' ? 'REELS' : 'FEED') as any,
      permalink: p.url ?? null,
      thumbnailUrl: p.thumbnailUrl ?? null,
      mediaUrl: p.thumbnailUrl ?? null,
      likes: Number(p.likesCount ?? 0),
      comments: Number(p.commentsCount ?? 0),
      shares: Number(p.sharesCount ?? 0),
      saves: Number(p.savesCount ?? 0),
      reach: Number(p.reach ?? 0),
      views: Number(p.videoViewCount ?? 0),
      postedAt: new Date(p.timestamp ?? Date.now()),
      syncSource: 'json' as const,
      lastSyncedAt: new Date(),
    }));
    const { inserted, updated } = await bulkUpsertInstagramPublishedPosts(postsToUpsert);
    console.log(`[Startup] Seed automático concluído: ${inserted} posts inseridos, ${updated} atualizados (total JSON: ${posts.length}).`);
  } catch (err: any) {
    console.error('[Startup] Falha no seed automático:', err.message);
  }
}

startServer().catch(console.error);
