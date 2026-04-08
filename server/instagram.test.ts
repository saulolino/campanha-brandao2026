import { describe, it, expect } from 'vitest';
import { instagramService } from './services/instagramService';

describe('Instagram Service (Dados Reais via MCP)', () => {
  it('deve estar configurado com dados reais', () => {
    expect(instagramService.isConfigured()).toBe(true);
  });

  it('deve retornar métricas reais da conta', async () => {
    const metrics = await instagramService.getMetrics();
    
    expect(metrics.username).toBe('eduardobrandaopv');
    expect(metrics.name).toBe('Eduardo Brandão');
    expect(metrics.followers).toBeGreaterThan(0);
    expect(metrics.posts).toBeGreaterThan(0);
    expect(metrics.likes).toBeGreaterThan(0);
    expect(metrics.comments).toBeGreaterThan(0);
  });

  it('deve retornar posts reais', async () => {
    const posts = await instagramService.getPosts(10);
    
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.length).toBeLessThanOrEqual(10);
    
    const firstPost = posts[0];
    expect(firstPost.id).toBeTruthy();
    expect(firstPost.mediaType).toBeTruthy();
    expect(firstPost.permalink).toContain('instagram.com');
  });

  it('deve retornar análise de crescimento', async () => {
    const growth = await instagramService.getGrowth();
    
    expect(growth.daily).toBeDefined();
    expect(growth.daily.length).toBeGreaterThan(0);
    
    const firstWeek = growth.daily[0];
    expect(firstWeek.date).toBeTruthy();
    expect(firstWeek.engagement).toBeGreaterThanOrEqual(0);
    expect(firstWeek.posts).toBeGreaterThan(0);
  });

  it('deve retornar engajamento por tipo', async () => {
    const byType = await instagramService.getEngagementByType();
    
    expect(byType.length).toBeGreaterThan(0);
    
    const firstType = byType[0];
    expect(firstType.type).toBeTruthy();
    expect(firstType.posts).toBeGreaterThan(0);
    expect(firstType.avgEngagement).toBeGreaterThanOrEqual(0);
  });

  it('deve retornar data da última sincronização', () => {
    const lastSync = instagramService.getLastSyncDate();
    expect(lastSync).toBeTruthy();
  });
});
