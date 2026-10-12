const LOCAL_URL = 'http://localhost:3000';

type SiteEnv = Partial<Record<'NEXT_PUBLIC_SITE_URL' | 'VERCEL_PROJECT_PRODUCTION_URL', string>>;

/**
 * The public origin used for canonical URLs, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL once the custom domain is live; on Vercel it falls
 * back to the project's production domain. An invalid value fails the build.
 */
export function siteUrl(
  env: SiteEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  },
): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || (vercel ? `https://${vercel}` : LOCAL_URL);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL must be an absolute URL, got "${raw}"`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`NEXT_PUBLIC_SITE_URL must use http(s), got "${raw}"`);
  }
  return url;
}
