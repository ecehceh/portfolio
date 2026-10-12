import type { Portfolio } from '@/content/types';
import { CurrentYear } from '@/components/ui/CurrentYear';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ArrowUpRightIcon, CopyrightIcon } from '@/components/ui/icons';

type Props = Pick<Portfolio, 'email' | 'education' | 'location' | 'socials'> & { name: string };

export function Contact({ name, email, education, location, socials }: Props) {
  return (
    <section className="contact" id="contact">
      <h2 className="section-title" data-reveal="">
        Contact
      </h2>
      <div className="contact-grid">
        <div className="contact-col" data-reveal="">
          <h3>Email</h3>
          <a href={`mailto:${email}`}>{email}</a>
          <h3>Education</h3>
          <p>{education}</p>
          <h3>Location</h3>
          <p>{location}</p>
        </div>
        <div className="contact-col" data-reveal="">
          <h3>Social</h3>
          <ul className="contact-socials">
            {socials.map((social) => (
              <li key={social.label}>
                <ExternalLink href={social.url}>
                  {social.label}
                  <ArrowUpRightIcon />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="contact-col contact-credit" data-reveal="">
          <p>
            Designed and Developed
            <br />
            by <span className="accent">{name}</span>
          </p>
          <p className="copyright">
            <CopyrightIcon /> <CurrentYear buildYear={new Date().getFullYear()} />
          </p>
        </div>
      </div>
    </section>
  );
}
