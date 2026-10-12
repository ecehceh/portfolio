import { describe, expect, it } from 'vitest';
import { safeUrl } from '@/lib/safe-url';
import { portfolio } from './portfolio';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

describe('portfolio content', () => {
  it('has the hero text the page needs', () => {
    expect(portfolio.firstName).not.toBe('');
    expect(portfolio.lastName).not.toBe('');
    expect(portfolio.heroWords.length).toBeGreaterThan(0);
  });

  it('only uses urls that pass the safe-url filter', () => {
    const urls = [
      portfolio.resumeUrl,
      ...portfolio.socials.map((social) => social.url),
      ...portfolio.projects.map((project) => project.link).filter(Boolean),
      ...portfolio.projects.map((project) => project.image).filter(Boolean),
    ];
    urls.forEach((url) => expect(safeUrl(url)).toBe(url));
  });

  it('serves the resume from the public folder', () => {
    expect(portfolio.resumeUrl.startsWith('/')).toBe(true);
  });

  it('uses valid hex colours for project gradients and tech balls', () => {
    const colors = [
      ...portfolio.projects.flatMap((project) => project.colors ?? []),
      ...portfolio.techstack.flatMap((tech) => [tech.color, tech.text]),
    ];
    colors.forEach((color) => expect(color).toMatch(HEX_COLOR));
  });

  it('has unique labels, which double as React keys', () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(portfolio.techstack.map((tech) => tech.label))).toBe(true);
    expect(unique(portfolio.socials.map((social) => social.label))).toBe(true);
    expect(unique(portfolio.projects.map((project) => project.title))).toBe(true);
    expect(unique(portfolio.whatIDo.map((card) => card.title))).toBe(true);
  });
});
