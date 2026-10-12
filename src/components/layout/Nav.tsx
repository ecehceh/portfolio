import type { Portfolio } from '@/content/types';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
] as const;

type Props = Pick<Portfolio, 'logo' | 'email'>;

export function Nav({ logo, email }: Props) {
  return (
    <header className="nav">
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
