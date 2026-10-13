import type { Service } from '@/content/types';
import { padIndex } from '@/lib/format';

export function WhatIDo({ services }: { services: readonly Service[] }) {
  return (
    <section className="whatido" id="whatido">
      <h2 className="whatido-title" data-reveal="">
        W<span className="hollow">HAT</span> I<span className="hollow"> DO</span>
      </h2>
      <div className="whatido-cards">
        {services.map((service, index) => (
          <article className="do-card" data-reveal="" key={service.title}>
            <span className="do-num" aria-hidden="true">
              {padIndex(index)}
            </span>
            <h3>{service.title}</h3>
            <p className="do-sub">{service.subtitle}</p>
            <p className="do-text">{service.text}</p>
            {/* role="list": Safari drops list semantics (and the label) once list-style is none. */}
            <ul className="chips" role="list" aria-label="Skills and tools">
              {service.skills.map((skill) => (
                <li className="chip" key={skill}>
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
