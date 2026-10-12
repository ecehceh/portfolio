import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import type { ReactNode } from 'react';
import { portfolio } from '@/content/portfolio';
import { buildMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/site';
import './globals.css';

// The Font Awesome CSS is imported above, so don't let it inject a second copy at runtime.
fontAwesomeConfig.autoAddCss = false;

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

// Runs before the first paint so the intro targets start hidden (see "Intro" in globals.css).
const MOTION_FLAG_SCRIPT =
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')";

export const metadata: Metadata = buildMetadata(portfolio, siteUrl());

export const viewport: Viewport = {
  themeColor: '#0b080c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The inline script changes <html>'s class before React hydrates it.
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
