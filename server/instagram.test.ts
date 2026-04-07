import { describe, it, expect } from 'vitest';
import { instagramRouter } from './routers/instagram';

describe('Instagram Router', () => {
  describe('getMetrics', () => {
    it('deve retornar métricas do Instagram', async () => {
      const caller = instagramRouter.createCaller({} as any);
      const metrics = await caller.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.followers).toBeGreaterThan(0);
      expect(metrics.posts).toBeGreaterThan(0);
      expect(metrics.engagement).toBeGreaterThan(0);
      expect(metrics.reach).toBeGreaterThan(0);
      expect(metrics.impressions).toBeGreaterThan(0);
    });
  });

  describe('getPosts', () => {
    it('deve retornar lista de posts', async () => {
      const caller = instagramRouter.createCaller({} as any);
      const posts = await caller.getPosts();

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);

      // Verificar estrutura do primeiro post
      const post = posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('caption');
      expect(post).toHaveProperty('mediaType');
      expect(post).toHaveProperty('likes');
      expect(post).toHaveProperty('comments');
    });
  });

  describe('getGrowth', () => {
    it('deve retornar dados de crescimento', async () => {
      const caller = instagramRouter.createCaller({} as any);
      const growth = await caller.getGrowth();

      expect(growth).toBeDefined();
      expect(growth.daily).toBeDefined();
      expect(Array.isArray(growth.daily)).toBe(true);
      expect(growth.daily.length).toBeGreaterThan(0);

      // Verificar estrutura do primeiro dia
      const day = growth.daily[0];
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('followers');
      expect(day).toHaveProperty('engagement');
    });
  });
});
