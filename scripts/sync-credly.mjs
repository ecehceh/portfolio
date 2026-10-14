/*
 * Pulls your public Credly badges into the portfolio:
 *   npm run sync:credly -- <credly-username>
 * The username is the last part of your profile URL, credly.com/users/<username>.
 * Downloads each badge image into public/badges/ and rewrites
 * src/content/certifications.ts. Run it again whenever you earn a badge and
 * commit both; the site itself never talks to Credly.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { badgeListUrl, imageExtension, isValidUsername, profileUrl, renderModule, toCertifications } from './credly.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BADGE_DIR = path.join(ROOT, 'public', 'badges');
const DATA_FILE = path.join(ROOT, 'src', 'content', 'certifications.ts');
/** Credly pages 48 badges at a time; this caps a runaway loop, not a real profile. */
const MAX_PAGES = 20;
const REQUEST_TIMEOUT_MS = 15_000;

async function fetchOk(url, accept) {
  const response = await fetch(url, {
    headers: { Accept: accept, 'User-Agent': 'portfolio-credly-sync' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404) throw new Error(`Not found: ${url}`);
  if (!response.ok) throw new Error(`${url} answered ${response.status} ${response.statusText}`);
  return response;
}

async function fetchAllBadges(username) {
  let badges = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const body = await (await fetchOk(badgeListUrl(username, page), 'application/json')).json();
    if (!Array.isArray(body?.data)) throw new Error('Credly sent an unexpected response (no "data" list).');
    badges = [...badges, ...body.data];
    if (page >= Number(body.metadata?.total_pages ?? 1)) break;
  }
  return badges;
}

/** Saves one badge image under the extension its bytes call for; null when it is not a PNG, JPEG or WebP. */
async function downloadImage({ imageStem, sourceImage, ...certification }) {
  const bytes = new Uint8Array(await (await fetchOk(sourceImage, 'image/*')).arrayBuffer());
  const extension = imageExtension(bytes);
  if (!extension) {
    console.warn(`Skipped ${certification.name}: its image is not a PNG, JPEG or WebP`);
    return null;
  }
  const image = `${imageStem}${extension}`;
  await writeFile(path.join(ROOT, 'public', image), bytes);
  return { ...certification, image };
}

async function downloadImages(certifications) {
  await mkdir(BADGE_DIR, { recursive: true });
  const saved = await Promise.all(certifications.map(downloadImage));
  return saved.filter(Boolean);
}

/** Removes badge images left over from badges that are no longer listed. */
async function pruneImages(certifications) {
  const keep = new Set(certifications.map(({ image }) => path.basename(image)));
  const stale = (await readdir(BADGE_DIR)).filter((file) => !keep.has(file));
  await Promise.all(stale.map((file) => rm(path.join(BADGE_DIR, file))));
  return stale.length;
}

async function main() {
  const username = process.argv[2];
  if (!isValidUsername(username)) {
    throw new Error('Usage: npm run sync:credly -- <credly-username>  (from credly.com/users/<credly-username>)');
  }
  const today = new Date().toISOString().slice(0, 10);
  const { certifications, skipped } = toCertifications(await fetchAllBadges(username), today);
  skipped.forEach((reason) => console.warn(`Skipped ${reason}`));

  const synced = await downloadImages(certifications);
  await writeFile(DATA_FILE, renderModule({ certifications: synced, profile: profileUrl(username) }));
  const pruned = await pruneImages(synced);

  console.log(`Synced ${synced.length} badge(s) from ${profileUrl(username)}.`);
  if (pruned) console.log(`Removed ${pruned} old badge image(s).`);
}

main().catch((error) => {
  const hint = String(error.message).startsWith('Not found')
    ? ' Check the username and that the Credly profile is public.'
    : '';
  console.error(`sync:credly failed: ${error.message}.${hint}`);
  process.exitCode = 1;
});
