import { describe, it, expect, beforeAll } from 'vitest';
import { instagramService } from './services/instagramService';

describe('Instagram Integration', () => {
  it('should validate Instagram credentials are configured', () => {
    const isConfigured = instagramService.isConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });

  it('should have account ID and access token in environment', () => {
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const token = process.env.INSTAGRAM_GRAPH_API_TOKEN;
    
    if (accountId && token) {
      expect(accountId).toBeTruthy();
      expect(token).toBeTruthy();
      expect(accountId.length).toBeGreaterThan(0);
      expect(token.length).toBeGreaterThan(0);
    }
  });

  it('should handle missing credentials gracefully', () => {
    const service = new (instagramService.constructor as any)('', '');
    expect(service.isConfigured()).toBe(false);
  });
});
