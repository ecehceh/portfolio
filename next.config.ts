import type { NextConfig } from 'next';
import { routeHeaders } from './src/lib/security-headers';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Dockerfile sets NEXT_OUTPUT=standalone to emit a self-contained server in
  // .next/standalone. Everywhere else (npm start, CI, Vercel) builds as usual.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  // Pin the workspace root so a stray lockfile in a parent folder is never picked up.
  turbopack: { root: __dirname },
  async headers() {
    return routeHeaders(isDev);
  },
};

export default nextConfig;
