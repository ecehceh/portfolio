import Image from 'next/image';
import type { Certification } from '@/content/types';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { formatMonthYear } from '@/lib/format';
import { safeUrl } from '@/lib/safe-url';

/** Matches the .cert-badge box in globals.css; Credly badges are square. */
const BADGE_SIZE = 160;

interface Props {
  certifications: readonly Certification[];
  /** Credly profile for the "View all" link; empty to hide it. */
  profileUrl: string;
}

/** Every badge links to its Credly page, so visitors can verify it. Renders nothing until badges are synced. */
export function Certifications({ certifications, profileUrl }: Props) {
  if (certifications.length === 0) return null;
  return (
    <section className="certs" id="certifications">
      <div className="certs-head" data-reveal="">
        <h2 className="section-title">
          My <span className="accent">certifications</span>
        </h2>
        {profileUrl && (
          <ExternalLink className="certs-all" href={profileUrl}>
            View all on Credly
            <ArrowUpRightIcon />
          </ExternalLink>
        )}
      </div>
      <ul className="cert-grid" role="list">
        {certifications.map((cert) => (
          <li data-reveal="" key={cert.url}>
            <ExternalLink className="cert-card" href={cert.url}>
              <Image
                className="cert-badge"
                src={safeUrl(cert.image)}
                alt=""
                width={BADGE_SIZE}
                height={BADGE_SIZE}
              />
              <h3>{cert.name}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <p className="cert-foot">
                <time dateTime={cert.issued}>{formatMonthYear(cert.issued)}</time>
                <span className="cert-verify">
                  Verify
                  <ArrowUpRightIcon />
                </span>
              </p>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
