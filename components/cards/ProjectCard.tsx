import type { Project, ProjectStatus } from '@/lib/types';
import { safeUrl } from '@/lib/utils';
import SafeImage from '@/components/ui/SafeImage';

const STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  available: { label: 'Available', cls: 'border-brand-cyan/40 text-brand-cyan' },
  ongoing: { label: 'Ongoing', cls: 'border-brand-violet/50 text-violet-300' },
  completed: { label: 'Completed', cls: 'border-line-strong text-muted' },
};

export default function ProjectCard({ project }: { project: Project }) {
  const repo = safeUrl(project.repoUrl);
  const demo = safeUrl(project.demoUrl);
  const status = STATUS[project.status] ?? STATUS.ongoing;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/90 transition duration-200 hover:border-line-strong motion-reduce:transition-none">
      <SafeImage image={project.image} width={800} height={450} alt="" sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-1 flex-col p-5">
        <span className={`w-fit rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${status.cls}`}>
          {status.label}
        </span>
        <h3 className="mt-3 font-display text-xl font-semibold">{project.title}</h3>
        <p className="mt-2 text-sm text-muted">{project.summary}</p>
        {project.tags && project.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
            {project.tags.map((tag) => (
              <li key={tag} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-muted">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {project.contributors && project.contributors.length > 0 && (
          <p className="mt-4 text-xs text-muted">By {project.contributors.join(', ')}</p>
        )}
        {(repo || demo) && (
          <div className="mt-5 flex gap-4 text-sm font-medium">
            {repo && (
              <a href={repo} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                Repository<span className="sr-only"> for {project.title}</span>
              </a>
            )}
            {demo && (
              <a href={demo} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                Live demo<span className="sr-only"> of {project.title}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
