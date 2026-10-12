import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import type { ReactNode } from 'react';
import { portfolio } from '@/content/portfolio';
import { displayName } from '@/lib/format';
import './globals.css';

// The Font Awesome CSS is imported above, so don't let it inject a second copy at runtime.
fontAwesomeConfig.autoAddCss = false;

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = {
  title: `${displayName(portfolio)} — Portfolio`,
  description: portfolio.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
