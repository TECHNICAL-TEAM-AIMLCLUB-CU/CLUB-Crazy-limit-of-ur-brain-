import Link from 'next/link';
import SignalRoom from '@/components/announcements/SignalRoom';
import EventCard from '@/components/cards/EventCard';
import PastEventsGallery from '@/components/events/PastEventsGallery';
import ProjectsCardSwap from '@/components/projects/ProjectsCardSwap';
import TeamShowcase from '@/components/team/TeamShowcase';
import Hero from '@/components/site/Hero';
import JoinForm from '@/components/site/JoinForm';
import ButtonLink from '@/components/ui/ButtonLink';
import { EmptyState, Section } from '@/components/ui/Section';
import AboutExperience from '@/components/site/AboutExperience';
import { getUpcomingAnnouncements } from '@/lib/announcement-metadata';
import { DEFAULTS } from '@/lib/defaults';
import { getAnnouncements, getEvents, getProjects, getSettings, getTeam } from '@/lib/queries';
import { safeUrl } from '@/lib/utils';

export default async function HomePage() {
  const [settings, events, projects, team, announcements] = await Promise.all([
    getSettings(),
    getEvents(),
    getProjects(),
    getTeam(),
    getAnnouncements(),
  ]);
  const now = Date.now();
  const isUpcoming = (event: { date: string; endDate?: string }) =>
    new Date(event.endDate ?? event.date).getTime() >= now;
  const upcomingEvents = events.filter(isUpcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const pastEvents = events.filter((event) => !isUpcoming(event));
  const upcomingAnnouncements = getUpcomingAnnouncements(announcements);
  const socials = (settings.socials ?? [])
    .map((social) => ({ ...social, href: safeUrl(social.url) }))
    .filter((social) => social.href);
  
  return (
    <>
      <div id="home">
        <Hero
          clubName={settings.clubName || DEFAULTS.clubName}
          headline={settings.heroHeadline || DEFAULTS.heroHeadline}
          subtext={settings.heroSubtext || DEFAULTS.heroSubtext}
        />
      </div>

      <AboutExperience settings={settings} compact />
      
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
        <PastEventsGallery events={pastEvents} />
      </Section>

      <Section eyebrow="Built by members" title="Projects" id="projects" href="/projects" hrefLabel="All projects">
        {projects.length > 0 ? (
          <ProjectsCardSwap projects={projects} />
        ) : (
          <EmptyState title="No projects yet">Add projects in the content studio to see them here.</EmptyState>
        )}
      </Section>

      <TeamShowcase cmsTeam={team} compact />

      <Section eyebrow="Latest" title="Announcements" id="announcements" href="/announcements" hrefLabel="Explore all announcements">
        {announcements.length > 0 ? (
          <div className="-mx-5 sm:-mx-8">
            <SignalRoom announcements={announcements} upcomingAnnouncements={upcomingAnnouncements} />
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
