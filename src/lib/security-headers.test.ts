import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy, routeHeaders, securityHeaders } from './security-headers';

describe('contentSecurityPolicy', () => {
  it('locks production down to our own origin', () => {
    const policy = contentSecurityPolicy(false);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain('upgrade-insecure-requests');
    expect(policy).not.toContain('unsafe-eval');
    expect(policy).not.toMatch(/https?:\/\//);
  });

  it('relaxes only what Fast Refresh needs in development', () => {
    const policy = contentSecurityPolicy(true);
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain('connect-src \'self\' ws:');
    expect(policy).not.toContain('upgrade-insecure-requests');
  });
});

describe('securityHeaders', () => {
  it('sends the standard hardening headers', () => {
    const headers = Object.fromEntries(securityHeaders(false).map(({ key, value }) => [key, value]));
    expect(headers).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    expect(headers['Strict-Transport-Security']).toMatch(/max-age=\d+/);
    expect(headers['Content-Security-Policy']).toBe(contentSecurityPolicy(false));
  });
});

describe('routeHeaders', () => {
  it('sends the CSP on pages but not on the static assets such as the resume PDF', () => {
    const [pages, assets] = routeHeaders(false);
    const keys = (rule: typeof pages) => rule?.headers.map((header) => header.key) ?? [];
    expect(keys(pages)).toContain('Content-Security-Policy');
    expect(keys(assets)).not.toContain('Content-Security-Policy');
    expect(keys(assets)).toContain('X-Content-Type-Options');
    expect(assets?.source).toBe('/assets/:path*');
  });
});
