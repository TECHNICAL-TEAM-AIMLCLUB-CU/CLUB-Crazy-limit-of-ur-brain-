import ExpandingTeamGrid, { type GridMember } from '@/components/team/ExpandingTeamGrid';
import { EmptyState, PageHeader } from '@/components/ui/Section';
import { getTeam } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';
import { imageUrl, safeUrl } from '@/lib/utils';

export const metadata = pageMetadata({ title: 'Team', description: 'Meet the people behind the club.', path: '/team' });

export default async function TeamPage() {
  const team = await getTeam();

  const members: GridMember[] = team.map((m) => ({
    id: m._id,
    name: m.name,
    role: m.role,
    department: m.department,
    bio: m.bio,
    portraitUrl: imageUrl(m.portrait),
    portraitAlt: m.portrait?.alt || `Portrait of ${m.name}`,
    socials: (m.socials ?? []).flatMap((s) => {
      const href = safeUrl(s.url);
      return href ? [{ platform: s.platform, href }] : [];
    }),
  }));

  return (
    <>
      <PageHeader eyebrow="Team" title="Meet the team" description="The students who run the club, organise events and build projects." />
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        {members.length > 0 ? (
          <ExpandingTeamGrid members={members} />
        ) : (
          <EmptyState title="No team members yet">Add team members in the content studio to see them here.</EmptyState>
        )}
      </div>
    </>
  );
}
