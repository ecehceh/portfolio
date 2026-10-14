import { describe, expect, it } from 'vitest';
import {
  badgeListUrl,
  imageExtension,
  isCredlyImageUrl,
  isValidUsername,
  renderModule,
  slugify,
  toCertifications,
} from './credly.mjs';

const TODAY = '2026-10-14';

function badge(overrides = {}) {
  return {
    id: 'ABCDEF12-3456-7890-abcd-ef1234567890',
    state: 'accepted',
    public: true,
    issued_at_date: '2025-03-01',
    expires_at_date: null,
    image_url: 'https://images.credly.com/images/abc/image.png',
    badge_template: { name: 'Cloud Practitioner' },
    issuer: { entities: [{ primary: true, entity: { name: 'Amazon Web Services' } }] },
    ...overrides,
  };
}

describe('isValidUsername', () => {
  it('accepts Credly-style slugs and rejects anything that could break the URL', () => {
    expect(isValidUsername('christopher-evan')).toBe(true);
    expect(isValidUsername('christopher-evan.b3a24eb4')).toBe(true);
    expect(isValidUsername('../etc')).toBe(false);
    expect(isValidUsername('a/b')).toBe(false);
    expect(isValidUsername('')).toBe(false);
    expect(isValidUsername(undefined)).toBe(false);
  });

  it('builds the paged badge list url', () => {
    expect(badgeListUrl('jane-doe', 2)).toBe('https://www.credly.com/users/jane-doe/badges.json?page=2');
  });
});

describe('slugify', () => {
  it('turns a badge name into a safe file name', () => {
    expect(slugify('AWS Certified: Cloud Practitioner')).toBe('aws-certified-cloud-practitioner');
    expect(slugify('Café   Ops!')).toBe('cafe-ops');
    expect(slugify('***')).toBe('badge');
    expect(slugify('a'.repeat(100))).toHaveLength(60);
  });
});

describe('isCredlyImageUrl', () => {
  it('only allows https urls on images.credly.com, with or without an extension', () => {
    expect(isCredlyImageUrl('https://images.credly.com/images/x/image.png')).toBe(true);
    expect(isCredlyImageUrl('https://images.credly.com/images/x/blob')).toBe(true);
    expect(isCredlyImageUrl('http://images.credly.com/images/x/image.png')).toBe(false);
    expect(isCredlyImageUrl('https://evil.example/images.credly.com/image.png')).toBe(false);
    expect(isCredlyImageUrl('not a url')).toBe(false);
    expect(isCredlyImageUrl(42)).toBe(false);
  });
});

describe('imageExtension', () => {
  /** Bytes from a mix of numbers and ASCII strings. */
  const bytes = (...parts) =>
    new Uint8Array(parts.flatMap((part) => (typeof part === 'string' ? [...part].map((c) => c.charCodeAt(0)) : part)));

  it('recognises PNG, JPEG and WebP from their first bytes', () => {
    expect(imageExtension(bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a, 0, 0))).toBe('.png');
    expect(imageExtension(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('.jpg');
    expect(imageExtension(bytes('RIFF', 0, 0, 0, 0, 'WEBPVP8 '))).toBe('.webp');
  });

  it('rejects SVG, HTML, other RIFF files and truncated data', () => {
    expect(imageExtension(bytes('<svg xmlns="http://www.w3.org/2000/svg">'))).toBe('');
    expect(imageExtension(bytes('<!doctype html>'))).toBe('');
    expect(imageExtension(bytes('RIFF', 0, 0, 0, 0, 'WAVE'))).toBe('');
    expect(imageExtension(bytes(0x89, 'PN'))).toBe('');
    expect(imageExtension(new Uint8Array())).toBe('');
  });
});

describe('toCertifications', () => {
  it('maps a badge to a certification with a local image name and a verification link', () => {
    const { certifications, skipped } = toCertifications([badge()], TODAY);
    expect(skipped).toEqual([]);
    expect(certifications).toEqual([
      {
        name: 'Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issued: '2025-03-01',
        imageStem: '/badges/cloud-practitioner-abcdef12',
        url: 'https://www.credly.com/badges/ABCDEF12-3456-7890-abcd-ef1234567890',
        sourceImage: 'https://images.credly.com/images/abc/image.png',
      },
    ]);
  });

  it('leaves out pending, private and expired badges but keeps unexpired ones', () => {
    const { certifications } = toCertifications(
      [
        badge({ state: 'pending' }),
        badge({ public: false }),
        badge({ expires_at_date: '2026-01-01' }),
        badge({ expires_at_date: '2027-01-01', badge_template: { name: 'Still Valid' } }),
      ],
      TODAY,
    );
    expect(certifications.map((cert) => cert.name)).toEqual(['Still Valid']);
  });

  it('sorts newest first, then by name', () => {
    const { certifications } = toCertifications(
      [
        badge({ issued_at_date: '2024-01-01', badge_template: { name: 'Old' } }),
        badge({ issued_at_date: '2025-06-01', badge_template: { name: 'Zeta' } }),
        badge({ issued_at_date: '2025-06-01', badge_template: { name: 'Alpha' } }),
      ],
      TODAY,
    );
    expect(certifications.map((cert) => cert.name)).toEqual(['Alpha', 'Zeta', 'Old']);
  });

  it('falls back to the template issuer, then the issuer summary', () => {
    const fromTemplate = badge({
      issuer: undefined,
      badge_template: { name: 'T', issuer: { entities: [{ entity: { name: 'Cisco' } }] } },
    });
    const fromSummary = badge({ issuer: { summary: 'issued by IBM' } });
    const unknown = badge({ issuer: undefined });
    const names = toCertifications([fromTemplate, fromSummary, unknown], TODAY).certifications.map((c) => c.issuer);
    expect(names.toSorted()).toEqual(['Cisco', 'Credly', 'IBM']);
  });

  it('uses the template image when the badge has none', () => {
    const template = { name: 'T', image_url: 'https://images.credly.com/images/t/blob' };
    const [cert] = toCertifications([badge({ image_url: undefined, badge_template: template })], TODAY).certifications;
    expect(cert?.sourceImage).toBe(template.image_url);
  });

  it('reports malformed badges instead of publishing them', () => {
    const { certifications, skipped } = toCertifications(
      [
        badge({ badge_template: {} }),
        badge({ id: '../../x' }),
        badge({ issued_at_date: 'yesterday' }),
        badge({ image_url: 'https://evil.example/x.png' }),
      ],
      TODAY,
    );
    expect(certifications).toEqual([]);
    expect(skipped).toEqual([
      expect.stringContaining('missing badge name'),
      expect.stringContaining('invalid badge id'),
      expect.stringContaining('invalid issue date'),
      expect.stringContaining('image is not hosted'),
    ]);
  });
});

describe('renderModule', () => {
  it('renders an empty list', () => {
    const source = renderModule({ certifications: [], profile: '' });
    expect(source).toContain("export const credlyProfileUrl = '';");
    expect(source).toContain('export const certifications: readonly Certification[] = [];');
  });

  it('renders entries without the source image and escapes quotes', () => {
    const { certifications } = toCertifications([badge({ badge_template: { name: "Jane's \\ Badge" } })], TODAY);
    const saved = certifications.map(({ imageStem, ...cert }) => ({ ...cert, image: `${imageStem}.png` }));
    const source = renderModule({ certifications: saved, profile: 'https://www.credly.com/users/jane' });
    expect(source).toContain("    name: 'Jane\\'s \\\\ Badge',");
    expect(source).toContain("    issuer: 'Amazon Web Services',");
    expect(source).toContain("    image: '/badges/jane-s-badge-abcdef12.png',");
    expect(source).not.toContain('sourceImage');
    expect(source).toContain("export const credlyProfileUrl = 'https://www.credly.com/users/jane';");
  });
});
