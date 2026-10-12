import type { Portfolio } from '@/content/types';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ArrowRightLongIcon, SocialIcon } from '@/components/ui/icons';

type Props = Pick<Portfolio, 'socials' | 'resumeUrl'>;

/** Fixed social icons on the left and the resume link on the right (desktop only). */
export function SideRail({ socials, resumeUrl }: Props) {
  return (
    <>
      <aside className="socials" aria-label="Social links">
        {socials.map((social) => (
          <ExternalLink key={social.label} href={social.url} aria-label={social.label}>
            <SocialIcon name={social.icon} />
          </ExternalLink>
        ))}
      </aside>
      <a className="resume" href={resumeUrl} target="_blank" rel="noopener noreferrer">
        Resume <ArrowRightLongIcon />
      </a>
    </>
  );
}
