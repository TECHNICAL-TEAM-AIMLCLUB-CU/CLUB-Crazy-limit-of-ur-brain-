import TeamShowcase from '@/components/team/TeamShowcase';
import { getTeam } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Team',
  description:
    'Meet the executive leadership, faculty mentors, and Tech, Operations, Marketing, and Media teams behind AIML Club.',
  path: '/team',
});

export default async function TeamPage() {
  const team = await getTeam();

  return <TeamShowcase cmsTeam={team} />;
}
