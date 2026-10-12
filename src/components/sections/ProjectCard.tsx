import Image from 'next/image';
import type { Project } from '@/content/types';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { padIndex, projectGradient } from '@/lib/format';
import { safeUrl } from '@/lib/safe-url';

function ProjectVisual({ project }: { project: Project }) {
  if (project.image) {
    return <Image src={safeUrl(project.image)} alt={`${project.title} preview`} width={800} height={550} />;
  }
  return (
    <div className="placeholder" style={{ background: projectGradient(project.colors) }}>
      {project.title}
    </div>
  );
}

/** The project image only becomes a link when the project has a real URL. */
function ProjectMedia({ project }: { project: Project }) {
  if (!project.link || project.link === '#') {
    return (
      <div className="work-image">
        <ProjectVisual project={project} />
      </div>
    );
  }
  return (
    <ExternalLink className="work-image" href={project.link} aria-label={`Open ${project.title}`}>
      <ProjectVisual project={project} />
      <span className="view">
        <ArrowUpRightIcon />
      </span>
    </ExternalLink>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="work-card">
      <div className="work-head">
        <span className="work-num">{padIndex(index)}</span>
        <div className="work-meta">
          <h3>{project.title}</h3>
          <p>{project.category}</p>
        </div>
      </div>
      <p className="work-tools">
        <strong>Tools &amp; features</strong>
        {project.tools}
      </p>
      <ProjectMedia project={project} />
    </article>
  );
}
