import type { Metadata } from 'next';
import type { Portfolio } from '@/content/types';
import { displayName } from './format';

export function pageTitle(data: Portfolio): string {
  return `${displayName(data)} — Portfolio`;
}

/** Page metadata: title, description, canonical URL and the link-preview cards. */
export function buildMetadata(data: Portfolio, baseUrl: URL): Metadata {
  const name = displayName(data);
  const title = pageTitle(data);
  const keywords = [...new Set(data.whatIDo.flatMap((service) => service.skills))];
  return {
    metadataBase: baseUrl,
    title,
    description: data.tagline,
    applicationName: title,
    authors: [{ name, url: baseUrl.href }],
    creator: name,
    keywords,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'profile',
      url: '/',
      siteName: title,
      title,
      description: data.tagline,
      locale: 'en_US',
      firstName: data.firstName,
      lastName: data.lastName,
    },
    twitter: { card: 'summary_large_image', title, description: data.tagline },
    robots: { index: true, follow: true },
  };
}

/** schema.org Person data so search engines can show a rich result for the name. */
export function personJsonLd(data: Portfolio, baseUrl: URL): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName(data),
    url: baseUrl.href,
    email: `mailto:${data.email}`,
    description: data.tagline,
    jobTitle: data.jobTitle,
    knowsAbout: data.techstack.map((tech) => tech.label),
    address: { '@type': 'PostalAddress', addressLocality: data.location },
    sameAs: data.socials.map((social) => social.url).filter((url) => url.startsWith('https://')),
  };
}

/** JSON for an inline <script>; escapes "<" so the content can never close the tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
