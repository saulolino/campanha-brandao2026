/**
 * Serviço de renovação automática do token de longa duração do Instagram.
 *
 * O token de longa duração do Instagram expira em ~60 dias.
 * Este serviço verifica diariamente se o token expira em ≤30 dias e tenta
 * renová-lo automaticamente via endpoint /refresh_access_token da Graph API.
 *
 * Fluxo:
 *  1. Busca a data de expiração em campaignSettings (instagramTokenExpiresAt)
 *  2. Se expirar em ≤30 dias → tenta renovar via API
 *  3. Se renovação OK → salva novo token + nova data de expiração no banco
 *  4. Se renovação falhar → cria notificação token_expirando para a equipe
 *  5. Se já expirou → cria notificação urgente
 */

import { getDb } from "./db";
import { campaignSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "./routers/notifications";
import { notifyOwner } from "./_core/notification";

const DAYS_BEFORE_EXPIRY_TO_RENEW = 30;

/**
 * Renova o token via Instagram Graph API /refresh_access_token.
 * Retorna o novo token e a nova data de expiração, ou null em caso de erro.
 */
async function refreshInstagramToken(currentToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
} | null> {
  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`;
    const res = await fetch(url);
    const data = await res.json() as any;

    if (!res.ok || !data.access_token) {
      console.error("[TokenRenewal] Resposta inválida da API:", data);
      return null;
    }

    // expires_in vem em segundos
    const expiresInMs = (data.expires_in ?? 5184000) * 1000; // padrão: 60 dias
    const expiresAt = new Date(Date.now() + expiresInMs);

    return { accessToken: data.access_token, expiresAt };
  } catch (err: any) {
    console.error("[TokenRenewal] Erro ao chamar API de renovação:", err.message);
    return null;
  }
}

/**
 * Verifica e renova o token do Instagram se necessário.
 * Deve ser chamado pelo scheduler uma vez por dia.
 */
export async function checkAndRenewInstagramToken(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[TokenRenewal] Banco de dados não disponível.");
    return;
  }

  try {
    // Buscar configurações atuais
    const [settings] = await db
      .select()
      .from(campaignSettings)
      .limit(1);

    if (!settings) {
      console.log("[TokenRenewal] Nenhuma configuração encontrada. Pulando verificação.");
      return;
    }

    const token = settings.instagramAccessToken ?? process.env.INSTAGRAM_GRAPH_API_TOKEN;
    if (!token) {
      console.log("[TokenRenewal] Token do Instagram não configurado. Pulando verificação.");
      return;
    }

    const now = new Date();

    // Se não há data de expiração salva, usar a data conhecida do token atual (09/06/2026)
    let expiresAt = settings.instagramTokenExpiresAt;
    if (!expiresAt) {
      // Data de expiração conhecida do token atual: 09/06/2026
      expiresAt = new Date("2026-06-09T00:00:00.000Z");
      // Salvar no banco para referência futura
      await db
        .update(campaignSettings)
        .set({ instagramTokenExpiresAt: expiresAt })
        .where(eq(campaignSettings.id, settings.id));
      console.log("[TokenRenewal] Data de expiração inicial salva:", expiresAt.toISOString());
    }

    const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`[TokenRenewal] Token expira em ${daysUntilExpiry} dias (${expiresAt.toLocaleDateString("pt-BR")})`);

    // Token já expirado
    if (daysUntilExpiry <= 0) {
      console.error("[TokenRenewal] Token EXPIRADO! Criando notificação urgente.");
      await createNotification({
        type: "token_expirando",
        title: "🚨 Token do Instagram EXPIRADO",
        message: `O token do Instagram expirou em ${expiresAt.toLocaleDateString("pt-BR")}. As métricas e publicações automáticas estão interrompidas. Acesse Configurações → Instagram para renovar manualmente.`,
        metadata: { expiresAt: expiresAt.toISOString(), daysUntilExpiry },
      });
      await notifyOwner({
        title: "🚨 Token do Instagram EXPIRADO",
        content: `O token do Instagram expirou em ${expiresAt.toLocaleDateString("pt-BR")}.\n\nAs métricas e publicações automáticas estão **interrompidas**.\n\nAcesse **Configurações → Instagram** para renovar o token manualmente.`,
      }).catch(() => {});
      return;
    }

    // Token expira em ≤30 dias → tentar renovar
    if (daysUntilExpiry <= DAYS_BEFORE_EXPIRY_TO_RENEW) {
      console.log(`[TokenRenewal] Token expira em ${daysUntilExpiry} dias. Tentando renovar...`);

      const renewed = await refreshInstagramToken(token);

      if (renewed) {
        // Salvar novo token e nova data de expiração
        await db
          .update(campaignSettings)
          .set({
            instagramAccessToken: renewed.accessToken,
            instagramTokenExpiresAt: renewed.expiresAt,
          })
          .where(eq(campaignSettings.id, settings.id));

        const newDays = Math.floor((renewed.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`[TokenRenewal] Token renovado com sucesso! Novo vencimento: ${renewed.expiresAt.toLocaleDateString("pt-BR")} (${newDays} dias)`);

        await createNotification({
          type: "token_expirando",
          title: "✅ Token do Instagram renovado automaticamente",
          message: `O token do Instagram foi renovado com sucesso. Novo vencimento: ${renewed.expiresAt.toLocaleDateString("pt-BR")} (${newDays} dias).`,
          metadata: { newExpiresAt: renewed.expiresAt.toISOString(), newDays },
        });
      } else {
        // Renovação falhou → notificar equipe
        console.error(`[TokenRenewal] Falha na renovação automática. Token expira em ${daysUntilExpiry} dias.`);

        await createNotification({
          type: "token_expirando",
          title: `⚠️ Token do Instagram expira em ${daysUntilExpiry} dias`,
          message: `A renovação automática falhou. O token expira em ${expiresAt.toLocaleDateString("pt-BR")}. Acesse Configurações → Instagram para renovar manualmente antes do vencimento.`,
          metadata: { expiresAt: expiresAt.toISOString(), daysUntilExpiry },
        });

        await notifyOwner({
          title: `⚠️ Token do Instagram expira em ${daysUntilExpiry} dias`,
          content: `A renovação automática do token falhou.\n\nO token expira em **${expiresAt.toLocaleDateString("pt-BR")}** (${daysUntilExpiry} dias).\n\nAcesse **Configurações → Instagram** para renovar manualmente.`,
        }).catch(() => {});
      }
    } else {
      console.log(`[TokenRenewal] Token válido por mais ${daysUntilExpiry} dias. Nenhuma ação necessária.`);
    }
  } catch (err: any) {
    console.error("[TokenRenewal] Erro inesperado:", err.message);
  }
}
