import ProjectsCardSwap from '@/components/projects/ProjectsCardSwap';
import { EmptyState, PageHeader, Section } from '@/components/ui/Section';
import { getProjects } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ title: 'Projects', description: 'Projects built by club members.', path: '/projects' });

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
        <Section eyebrow="Built by members" title="Explore our projects">
          <ProjectsCardSwap projects={projects} />
        </Section>
      )}
    </>
  );
}
