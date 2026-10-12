import { ImageResponse } from 'next/og';
import { portfolio } from '@/content/portfolio';
import { displayName } from '@/lib/format';
import { pageTitle } from '@/lib/seo';

// Generated once at build time and used for link previews (LinkedIn, WhatsApp, X…).
export const alt = pageTitle(portfolio);
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: 'radial-gradient(circle at 78% 45%, #5b21b6 0%, #1e1035 38%, #0b080c 70%)',
          color: '#eae5ec',
        }}
      >
        <div style={{ fontSize: 34, color: '#c2a4ff' }}>Hello! I&apos;m</div>
        <div style={{ fontSize: 96, lineHeight: 1.05 }}>{displayName(portfolio)}</div>
        <div style={{ marginTop: 32, fontSize: 52, color: '#a56bff' }}>{portfolio.jobTitle}</div>
        <div style={{ marginTop: 12, fontSize: 32, color: '#a39fa8' }}>{portfolio.education}</div>
      </div>
    ),
    size,
  );
}
