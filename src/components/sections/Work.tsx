import type { Project } from '@/content/types';
import { ProjectCard } from './ProjectCard';

export function Work({ projects }: { projects: readonly Project[] }) {
  return (
    <section className="work" id="work">
      <h2 className="section-title work-title">
        My <span className="accent">Work</span>
      </h2>
      <div className="work-track">
        {projects.map((project, index) => (
          <ProjectCard project={project} index={index} key={project.title} />
        ))}
      </div>
    </section>
  );
}
