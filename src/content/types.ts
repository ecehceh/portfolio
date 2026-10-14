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

export interface Certification {
  name: string;
  issuer: string;
  /** ISO date (YYYY-MM-DD) the badge was issued. */
  issued: string;
  /** Badge image under /public (e.g. "/badges/cloud-practitioner-1a2b3c4d.png"). */
  image: string;
  /** The badge's public Credly page, where anyone can verify it. */
  url: string;
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
  /** Used for search results and link previews. */
  jobTitle: string;
  /** One-line summary used for the page description and link previews. */
  tagline: string;
  about: string;
  whatIDo: readonly Service[];
  /** Oldest first — the timeline reads top to bottom. */
  career: readonly CareerEntry[];
  projects: readonly Project[];
  techstack: readonly Tech[];
  /** Newest first. Hidden when empty. */
  certifications: readonly Certification[];
  /** Credly profile for the "View all" link; empty to hide it. */
  credlyUrl: string;
  socials: readonly Social[];
  education: string;
  location: string;
}
