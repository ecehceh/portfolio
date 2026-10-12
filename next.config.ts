import type { NextConfig } from 'next';
import { routeHeaders } from './src/lib/security-headers';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root so a stray lockfile in a parent folder is never picked up.
  turbopack: { root: __dirname },
  async headers() {
    return routeHeaders(isDev);
  },
};

export default nextConfig;
