export type SocialIcon = 'linkedin' | 'github' | 'instagram' | 'email';

export interface Social {
  label: string;
  icon: SocialIcon;
  url: string;
}

export interface Service {
  title: string;
  subtitle: string;
  text: string;
  skills: readonly string[];
}

export interface CareerEntry {
  role: string;
  org: string;
  year: string;
  desc: string;
}

export interface Project {
  title: string;
  category: string;
  tools: string;
  /** Path under /public (e.g. "/projects/wazuh.webp"); empty for a gradient placeholder. */
  image: string;
  /** Full URL makes the card clickable; empty for work that isn't public. */
  link: string;
  colors?: readonly [string, string];
}

export interface Tech {
  label: string;
  /** Ball colour. */
  color: string;
  /** Label colour. */
  text: string;
}

export interface Portfolio {
  firstName: string;
  lastName: string;
  fullName?: string;
  logo: string;
  email: string;
  resumeUrl: string;
  /** Hero reads: "<heroKicker> / <rotating heroWords> / <heroTitle>". */
  heroKicker: string;
  heroWords: readonly string[];
  heroTitle: string;
  /** One-line summary used for the page description and link previews. */
  tagline: string;
  about: string;
  whatIDo: readonly Service[];
  /** Oldest first — the timeline reads top to bottom. */
  career: readonly CareerEntry[];
  projects: readonly Project[];
  techstack: readonly Tech[];
  socials: readonly Social[];
  education: string;
  location: string;
}
