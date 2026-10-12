import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGithub, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faCopyright, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight, faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { SocialIcon as SocialIconName } from '@/content/types';

const SOCIAL_ICONS: Record<SocialIconName, IconDefinition> = {
  linkedin: faLinkedinIn,
  github: faGithub,
  instagram: faInstagram,
  email: faEnvelope,
};

export function SocialIcon({ name }: { name: SocialIconName }) {
  return <FontAwesomeIcon icon={SOCIAL_ICONS[name]} aria-hidden />;
}

/** Font Awesome's arrow-up-right is Pro-only, so the free arrow is rotated instead. */
export function ArrowUpRightIcon() {
  return <FontAwesomeIcon icon={faArrowRight} transform={{ rotate: -45 }} aria-hidden />;
}

export function ArrowRightLongIcon() {
  return <FontAwesomeIcon icon={faArrowRightLong} aria-hidden />;
}

export function CopyrightIcon() {
  return <FontAwesomeIcon icon={faCopyright} aria-hidden />;
}
