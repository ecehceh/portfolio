import { describe, expect, it } from 'vitest';
import { isExternalUrl, safeUrl } from './safe-url';

describe('safeUrl', () => {
  it.each([
    'https://linkedin.com/in/someone',
    'http://example.com',
    'mailto:me@example.com',
    '#contact',
    '/assets/cv.pdf',
    './local',
    '../up',
  ])('keeps the allowed url %s', (url) => {
    expect(safeUrl(url)).toBe(url);
  });

  it('trims surrounding whitespace', () => {
    expect(safeUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<b>x</b>',
    'vbscript:x',
    'ftp://x',
    '//evil.example/phish',
    './/evil.example',
    '',
  ])(
    'replaces the unsafe url %j with #',
    (url) => {
      expect(safeUrl(url)).toBe('#');
    },
  );

  it('replaces non-string input with #', () => {
    expect(safeUrl(undefined)).toBe('#');
    expect(safeUrl(42)).toBe('#');
  });
});

describe('isExternalUrl', () => {
  it('is true only for http(s) urls', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('HTTP://example.com')).toBe(true);
    expect(isExternalUrl('mailto:me@example.com')).toBe(false);
    expect(isExternalUrl('#top')).toBe(false);
    expect(isExternalUrl('/assets/cv.pdf')).toBe(false);
  });
});
