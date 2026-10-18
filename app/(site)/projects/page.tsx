import ProjectCard from '@/components/cards/ProjectCard';
import { EmptyState, PageHeader, Section } from '@/components/ui/Section';
import { getProjects } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';
import type { ProjectStatus } from '@/lib/types';

export const metadata = pageMetadata({ title: 'Projects', description: 'Projects built by club members.', path: '/projects' });

const GROUPS: { status: ProjectStatus; title: string }[] = [
  { status: 'ongoing', title: 'Ongoing' },
  { status: 'available', title: 'Available' },
  { status: 'completed', title: 'Completed' },
];

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader eyebrow="Projects" title="What we build" description="Open-source experiments, research prototypes and tools from our members." />
      {projects.length === 0 ? (
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <EmptyState title="No projects yet">Add projects in the content studio to see them here.</EmptyState>
        </div>
      ) : (
        GROUPS.map(({ status, title }) => {
          const items = projects.filter((p) => p.status === status);
          if (items.length === 0) return null;
          return (
            <Section key={status} title={title}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </Section>
          );
        })
      )}
    </>
  );
}
