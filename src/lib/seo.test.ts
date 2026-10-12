import { describe, expect, it } from 'vitest';
import { portfolio } from '@/content/portfolio';
import { buildMetadata, pageTitle, personJsonLd, serializeJsonLd } from './seo';
import { siteUrl } from './site';

const BASE = new URL('https://example.dev');

describe('siteUrl', () => {
  it('prefers NEXT_PUBLIC_SITE_URL', () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: 'https://me.dev', VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app' }).href).toBe(
      'https://me.dev/',
    );
  });

  it("falls back to Vercel's production domain, then localhost", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'me.vercel.app' }).href).toBe('https://me.vercel.app/');
    expect(siteUrl({}).href).toBe('http://localhost:3000/');
  });

  it('fails fast on a value that is not an http(s) URL', () => {
    expect(() => siteUrl({ NEXT_PUBLIC_SITE_URL: 'not a url' })).toThrow(/absolute URL/);
    expect(() => siteUrl({ NEXT_PUBLIC_SITE_URL: 'ftp://me.dev' })).toThrow(/http\(s\)/);
  });
});

describe('buildMetadata', () => {
  const metadata = buildMetadata(portfolio, BASE);

  it('titles the page with the full name and uses the tagline as description', () => {
    expect(metadata.title).toBe(pageTitle(portfolio));
    expect(pageTitle(portfolio)).toBe('Christopher Evan Wijaksana — Portfolio');
    expect(metadata.description).toBe(portfolio.tagline);
  });

  it('sets the canonical URL and link-preview cards', () => {
    expect(metadata.metadataBase).toBe(BASE);
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph).toMatchObject({ type: 'profile', title: pageTitle(portfolio) });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('derives unique keywords from the skills', () => {
    const keywords = metadata.keywords as string[];
    expect(keywords).toContain('Docker Swarm');
    expect(new Set(keywords).size).toBe(keywords.length);
  });
});

describe('personJsonLd', () => {
  it('describes the person with only public https profile links', () => {
    const person = personJsonLd(portfolio, BASE);
    expect(person).toMatchObject({ '@type': 'Person', name: 'Christopher Evan Wijaksana', url: 'https://example.dev/' });
    expect(person.jobTitle).toBe(portfolio.jobTitle);
    expect(person.sameAs).toEqual(['https://linkedin.com/in/christopher-evan-w']);
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so the JSON cannot break out of its script tag', () => {
    expect(serializeJsonLd({ x: '</script><script>alert(1)</script>' })).not.toContain('<');
  });
});
