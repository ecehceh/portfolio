'use client';

import type { Portfolio } from '@/content/types';
import { useScrolledPast } from '@/hooks/useScrolledPast';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
] as const;

/** Once the page scrolls this far, the bar gets a backdrop so content never shows through the links. */
const SOLID_AFTER_PX = 24;

type Props = Pick<Portfolio, 'logo' | 'email'>;

export function Nav({ logo, email }: Props) {
  const isScrolled = useScrolledPast(SOLID_AFTER_PX);
  return (
    <header className={isScrolled ? 'nav is-scrolled' : 'nav'}>
      <a href="#top" className="nav-logo">
        {logo}
      </a>
      <a className="nav-email" href={`mailto:${email}`}>
        {email}
      </a>
      <nav aria-label="Main">
        <ul className="nav-links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
