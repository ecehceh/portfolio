export interface NameParts {
  firstName: string;
  lastName: string;
  fullName?: string;
}

export interface TextToken {
  kind: 'word' | 'space';
  value: string;
}

const DEFAULT_GRADIENT: readonly [string, string] = ['#7c3aed', '#1e1b4b'];

export function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function displayName({ firstName, lastName, fullName }: NameParts): string {
  return fullName || toTitleCase(`${firstName} ${lastName}`);
}

/** Splits text into words and whitespace so each word can be animated on its own. */
export function splitWords(text: string): TextToken[] {
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((value) => ({ kind: /^\s+$/.test(value) ? 'space' : 'word', value }));
}

/** 0 → "01", 9 → "10". */
export function padIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function projectGradient(colors: readonly [string, string] = DEFAULT_GRADIENT): string {
  const [from, to] = colors;
  return `radial-gradient(circle at 30% 20%, ${from}, ${to} 75%)`;
}
