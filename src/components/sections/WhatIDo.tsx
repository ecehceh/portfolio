import type { Service } from '@/content/types';

export function WhatIDo({ services }: { services: readonly Service[] }) {
  return (
    <section className="whatido" id="whatido">
      <h2 className="whatido-title" data-reveal="">
        W<span className="hollow">HAT</span>
        <br />I<span className="hollow"> DO</span>
      </h2>
      <div className="whatido-cards">
        {services.map((service) => (
          <article className="do-card" data-reveal="" key={service.title}>
            <h3>{service.title}</h3>
            <p className="do-sub">{service.subtitle}</p>
            <p className="do-text">{service.text}</p>
            <p className="do-label">Skillset &amp; tools</p>
            <ul className="chips">
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
