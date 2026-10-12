// Relative paths may start with ./ ../ or /, but never // (a protocol-relative link to another host).
const SAFE_URL = /^(https?:|mailto:|#|(?:\.{1,2})?\/(?!\/))/i;
const EXTERNAL_URL = /^https?:/i;

/** Only allow http(s), mailto, anchors and relative paths — never javascript: or data: URLs. */
export function safeUrl(url: unknown): string {
  if (typeof url !== 'string') return '#';
  const trimmed = url.trim();
  return SAFE_URL.test(trimmed) ? trimmed : '#';
}

/** True for links that leave the site and should open in a new tab. */
export function isExternalUrl(url: string): boolean {
  return EXTERNAL_URL.test(url);
}
