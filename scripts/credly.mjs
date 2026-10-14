/*
 * Pure helpers for scripts/sync-credly.mjs: they turn Credly's public badge
 * JSON into the portfolio's Certification entries and render the generated
 * src/content/certifications.ts. No network or disk access here, so they can
 * be unit-tested (scripts/credly.test.mjs).
 */

/** Credly slugs look like "jane-doe" or "jane-doe.1a2b3c4d"; no slashes, so nothing can escape the URL path. */
const USERNAME = /^[a-z0-9][a-z0-9.-]*$/i;
const BADGE_ID = /^[a-z0-9-]+$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Badge images are only ever downloaded from Credly's own image host. */
const IMAGE_HOST = 'images.credly.com';
const MAX_SLUG_LENGTH = 60;
const ID_SUFFIX_LENGTH = 8;

/** @param {unknown} username */
export function isValidUsername(username) {
  return typeof username === 'string' && USERNAME.test(username);
}

/** @param {string} username */
export function profileUrl(username) {
  return `https://www.credly.com/users/${username}`;
}

/** @param {string} username @param {number} page */
export function badgeListUrl(username, page) {
  return `${profileUrl(username)}/badges.json?page=${page}`;
}

/** "AWS Certified: Cloud Practitioner" → "aws-certified-cloud-practitioner" */
export function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, '');
  return slug || 'badge';
}

/** True for an https URL on Credly's image host. Some end in /blob, so the format comes from the file itself. */
export function isCredlyImageUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === IMAGE_HOST;
  } catch {
    return false;
  }
}

const startsWith = (bytes, signature, offset = 0) =>
  bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte);
const ascii = (text) => [...text].map((char) => char.charCodeAt(0));
/** \x89 P N G \r \n \x1a \n */
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * The file extension for a downloaded image, read from its first bytes, or ''
 * when it is not a PNG, JPEG or WebP (next/image would need dangerouslyAllowSVG for SVG).
 * @param {Uint8Array} bytes
 */
export function imageExtension(bytes) {
  if (startsWith(bytes, PNG_SIGNATURE)) return '.png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return '.jpg';
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return '.webp';
  return '';
}

function issuerName(badge) {
  const entities = badge.issuer?.entities ?? badge.badge_template?.issuer?.entities ?? [];
  const primary = entities.find((item) => item?.primary) ?? entities[0];
  const name = primary?.entity?.name ?? String(badge.issuer?.summary ?? '').replace(/^issued by\s+/i, '');
  return typeof name === 'string' ? name.trim() : '';
}

/** Accepted, public and not expired: the badges worth showing. */
function isShowable(badge, today) {
  if (badge?.state !== 'accepted' || badge.public === false) return false;
  const expires = badge.expires_at_date;
  return !(typeof expires === 'string' && expires < today);
}

/**
 * One Credly badge → a Certification (minus the image path, which needs the
 * downloaded file's extension) plus where to download the image from, or the
 * reason it can't be used.
 */
function toCertification(badge) {
  const name = typeof badge.badge_template?.name === 'string' ? badge.badge_template.name.trim() : '';
  const { id, issued_at_date: issued } = badge;
  const sourceImage = badge.image_url ?? badge.badge_template?.image_url;
  const label = name || String(id);
  if (!name) return { error: `${label}: missing badge name` };
  if (typeof id !== 'string' || !BADGE_ID.test(id)) return { error: `${label}: invalid badge id` };
  if (typeof issued !== 'string' || !ISO_DATE.test(issued)) return { error: `${label}: invalid issue date` };
  if (!isCredlyImageUrl(sourceImage)) return { error: `${label}: image is not hosted on ${IMAGE_HOST}` };
  return {
    certification: {
      name,
      issuer: issuerName(badge) || 'Credly',
      issued,
      imageStem: `/badges/${slugify(name)}-${id.slice(0, ID_SUFFIX_LENGTH).toLowerCase()}`,
      url: `https://www.credly.com/badges/${id}`,
      sourceImage,
    },
  };
}

/**
 * Credly's badge list → Certifications, newest first. Pending, private and
 * expired badges are left out; malformed ones are reported in `skipped`.
 * @param {unknown[]} badges
 * @param {string} today ISO date, compared against each badge's expiry
 */
export function toCertifications(badges, today) {
  const results = badges.filter((badge) => isShowable(badge, today)).map(toCertification);
  const certifications = results
    .flatMap((result) => (result.certification ? [result.certification] : []))
    .toSorted((a, b) => b.issued.localeCompare(a.issued) || a.name.localeCompare(b.name));
  const skipped = results.flatMap((result) => (result.error ? [result.error] : []));
  return { certifications, skipped };
}

/** A single-quoted TypeScript string literal. */
function quote(value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
  return `'${escaped}'`;
}

function renderEntry({ name, issuer, issued, image, url }) {
  const fields = { name, issuer, issued, image, url };
  const lines = Object.entries(fields).map(([key, value]) => `    ${key}: ${quote(value)},`);
  return ['  {', ...lines, '  },'].join('\n');
}

/** The contents of src/content/certifications.ts. */
export function renderModule({ certifications, profile }) {
  const list = certifications.length ? `[\n${certifications.map(renderEntry).join('\n')}\n]` : '[]';
  return `/*
 * Generated by \`npm run sync:credly -- <credly-username>\` from your public
 * Credly profile; a re-sync overwrites manual edits. Badge images live in
 * public/badges/. Newest first.
 */
import type { Certification } from './types';

export const credlyProfileUrl = ${quote(profile)};

export const certifications: readonly Certification[] = ${list};
`;
}
