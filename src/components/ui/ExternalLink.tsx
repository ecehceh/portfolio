import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { isExternalUrl, safeUrl } from '@/lib/safe-url';

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
}

/** A link whose URL is passed through the safe-url filter; http(s) links open in a new tab. */
export function ExternalLink({ href, children, ...rest }: ExternalLinkProps) {
  const url = safeUrl(href);
  const newTab = isExternalUrl(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a href={url} {...newTab} {...rest}>
      {children}
    </a>
  );
}
