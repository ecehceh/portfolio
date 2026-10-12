export interface Header {
  key: string;
  value: string;
}

/**
 * Content Security Policy for a fully static page: every script, style, font
 * and image is served from our own origin.
 *
 * Trade-off: Next.js inlines its hydration scripts, and a nonce-based policy
 * would force the page to render on every request instead of being
 * prerendered, so script-src keeps 'unsafe-inline'. The page renders no user
 * input, which is what makes that acceptable here. Dev mode also needs
 * 'unsafe-eval' for React Fast Refresh.
 */
export function contentSecurityPolicy(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, sources]) => `${name} ${sources.join(' ')}`);
  return [...policy, ...(isDev ? [] : ['upgrade-insecure-requests'])].join('; ');
}

export function securityHeaders(isDev: boolean): Header[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(isDev) },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ];
}
