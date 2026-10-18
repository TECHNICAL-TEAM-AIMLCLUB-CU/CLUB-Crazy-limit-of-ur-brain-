import Link from 'next/link';
import AnnouncementCard from '@/components/cards/AnnouncementCard';
import EventCard from '@/components/cards/EventCard';
import PastEventsGallery from '@/components/events/PastEventsGallery';
import ProjectsCardSwap from '@/components/projects/ProjectsCardSwap';
import ExpandingTeamGrid, { type GridMember } from '@/components/team/ExpandingTeamGrid';
import Hero from '@/components/site/Hero';
import JoinForm from '@/components/site/JoinForm';
import ButtonLink from '@/components/ui/ButtonLink';
import { EmptyState, Section } from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import { DEFAULTS } from '@/lib/defaults';
import { getAnnouncements, getEvents, getProjects, getSettings, getTeam } from '@/lib/queries';
import { imageUrl, safeUrl } from '@/lib/utils';

export default async function HomePage() {
  const [settings, events, projects, team, announcements] = await Promise.all([
    getSettings(),
    getEvents(),
    getProjects(),
    getTeam(),
    getAnnouncements(),
  ]);
  const members: GridMember[] = team.map((m) => ({
    id: m._id,
    name: m.name,
    role: m.role,
    department: m.department,
    bio: m.bio,
    portraitUrl: imageUrl(m.portrait),
    portraitAlt: m.portrait?.alt || `Portrait of ${m.name}`,
    socials: (m.socials ?? []).flatMap((social) => {
      const href = safeUrl(social.url);
      return href ? [{ platform: social.platform, href }] : [];
    }),
  }));
  const now = Date.now();
  const isUpcoming = (event: { date: string; endDate?: string }) =>
    new Date(event.endDate ?? event.date).getTime() >= now;
  const upcomingEvents = events.filter(isUpcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const pastEvents = events.filter((event) => !isUpcoming(event));
  const socials = (settings.socials ?? [])
    .map((social) => ({ ...social, href: safeUrl(social.url) }))
    .filter((social) => social.href);
  const activities = settings.activities ?? [];
  const aboutBody = settings.aboutBody ?? '';

  return (
    <>
      <div id="home">
        <Hero
          clubName={settings.clubName || DEFAULTS.clubName}
          headline={settings.heroHeadline || DEFAULTS.heroHeadline}
          subtext={settings.heroSubtext || DEFAULTS.heroSubtext}
        />
      </div>

      <Section eyebrow="About us" title="Mission & vision" id="about">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface/90 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">Mission</h3>
            <p className="mt-3 text-lg text-fg/90">{settings.mission || DEFAULTS.mission}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface/90 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brand-violet">Vision</h3>
            <p className="mt-3 text-lg text-fg/90">{settings.vision || DEFAULTS.vision}</p>
          </div>
        </div>
      </Section>

      {activities.length > 0 && (
        <Section eyebrow="Our work" title="What we do">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <li key={activity.title} className="rounded-2xl border border-line bg-surface/90 p-6">
                <h3 className="font-display text-xl font-semibold">{activity.title}</h3>
                {activity.description && <p className="mt-2 text-sm text-muted">{activity.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {aboutBody && (
        <Section eyebrow="Our story" title="How we got here">
          <div className="max-w-3xl">
            <RichText value={aboutBody} />
          </div>
        </Section>
      )}

      <Section eyebrow="Happening soon" title="Upcoming events" id="events">
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming events">Check back soon, or follow the announcements below.</EmptyState>
        )}
      </Section>

      <Section title="Past events">
        {pastEvents.length > 0 ? (
          <PastEventsGallery events={pastEvents} />
        ) : (
          <EmptyState title="No past events yet" />
        )}
      </Section>

      <Section eyebrow="Built by members" title="Projects" id="projects" href="/projects" hrefLabel="All projects">
        {projects.length > 0 ? (
          <ProjectsCardSwap projects={projects} />
        ) : (
          <EmptyState title="No projects yet">Add projects in the content studio to see them here.</EmptyState>
        )}
      </Section>

      <Section eyebrow="The people" title="Meet the team" id="team">
        {members.length > 0 ? (
          <ExpandingTeamGrid members={members} />
        ) : (
          <EmptyState title="No team members yet">Add team members in the content studio to see them here.</EmptyState>
        )}
      </Section>

      <Section eyebrow="Latest" title="Announcements" id="announcements">
        {announcements.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement._id} item={announcement} />
            ))}
          </div>
        ) : (
          <EmptyState title="No announcements yet" />
        )}
      </Section>

      <Section eyebrow="Get involved" title="Join the club" id="join">
        <p className="mb-6 max-w-2xl text-muted">{settings.joinText || DEFAULTS.joinText}</p>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <JoinForm />
          <aside className="h-fit rounded-2xl border border-line bg-surface/90 p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold">Other ways to reach us</h3>
            {settings.contactEmail || socials.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm">
                {settings.contactEmail && (
                  <li>
                    <a href={`mailto:${settings.contactEmail}`} className="text-brand-cyan hover:underline">
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
                {socials.map((social) => (
                  <li key={social.platform + social.url}>
                    <a href={social.href!} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Official contact links will appear here once they are added in Studio.</p>
            )}
          </aside>
        </div>
      </Section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl border border-line-strong bg-surface/90 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Want to be part of it?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Whether you are new to machine learning or already building models, there is a place for you.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/#join">Join the Club</ButtonLink>
            <Link href="/#about" className="self-center text-sm font-medium text-muted hover:text-brand-cyan">
              Learn more →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
