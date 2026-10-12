import type { CareerEntry } from '@/content/types';
import { cssVars } from '@/lib/css-vars';

export function Career({ entries }: { entries: readonly CareerEntry[] }) {
  return (
    <section className="career" id="career">
      <h2 className="section-title" data-reveal="">
        My career <span className="accent">&amp;</span>
        <br />
        <span className="accent">experience</span>
      </h2>
      <div className="timeline" style={cssVars({ '--rows': entries.length + 1 })}>
        <div className="timeline-line">
          <span className="timeline-fill" />
        </div>
        {entries.map((entry, index) => (
          <div className="timeline-item" style={cssVars({ '--row': index + 1 })} key={`${entry.year}-${entry.role}`}>
            <div className="t-info">
              <h3>{entry.role}</h3>
              <p>{entry.org}</p>
            </div>
            <p className="t-year">{entry.year}</p>
            <p className="t-desc">{entry.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
