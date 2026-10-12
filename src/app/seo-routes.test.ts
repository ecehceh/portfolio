import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';

describe('robots.txt and sitemap.xml', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows crawling and points crawlers at the sitemap on the site origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://me.dev');
    expect(robots()).toEqual({ rules: { userAgent: '*', allow: '/' }, sitemap: 'https://me.dev/sitemap.xml' });
  });

  it('lists the single page', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://me.dev');
    expect(sitemap()).toEqual([{ url: 'https://me.dev/', changeFrequency: 'monthly', priority: 1 }]);
  });
});
