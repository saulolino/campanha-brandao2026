/**
 * Teste de validação das credenciais do Instagram Graph API
 * Verifica se o token e o account ID estão corretos e funcionais
 */
import { describe, it, expect } from 'vitest';

describe('Instagram credentials', () => {
  it('deve ter INSTAGRAM_GRAPH_API_TOKEN definido', () => {
    expect(process.env.INSTAGRAM_GRAPH_API_TOKEN).toBeTruthy();
    expect(process.env.INSTAGRAM_GRAPH_API_TOKEN!.length).toBeGreaterThan(50);
  });

  it('deve ter INSTAGRAM_BUSINESS_ACCOUNT_ID numérico correto', () => {
    const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    expect(id).toBeTruthy();
    // Deve ser um ID numérico (não um token)
    expect(/^\d+$/.test(id!)).toBe(true);
    // ID correto da conta @eduardobrandaopv
    expect(id).toBe('17841401389412709');
  });

  it('deve conseguir buscar dados reais da conta @eduardobrandaopv', async () => {
    const token = process.env.INSTAGRAM_GRAPH_API_TOKEN;
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}?fields=username,followers_count&access_token=${token}`
    );
    const data = await res.json() as { username?: string; followers_count?: number; error?: { message: string } };

    expect(data.error).toBeUndefined();
    expect(data.username).toBe('eduardobrandaopv');
    expect(typeof data.followers_count).toBe('number');
    expect(data.followers_count!).toBeGreaterThan(1000);
  }, 15000);
});
