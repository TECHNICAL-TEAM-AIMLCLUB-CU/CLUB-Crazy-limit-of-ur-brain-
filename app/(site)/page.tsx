import Link from 'next/link';
import AnnouncementCard from '@/components/cards/AnnouncementCard';
import EventCard from '@/components/cards/EventCard';
import ProjectCard from '@/components/cards/ProjectCard';
import Hero from '@/components/site/Hero';
import ButtonLink from '@/components/ui/ButtonLink';
import { Section } from '@/components/ui/Section';
import SafeImage from '@/components/ui/SafeImage';
import { DEFAULTS } from '@/lib/defaults';
import { getAnnouncements, getFeaturedProjects, getSettings, getTeam, getUpcomingEvents } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, events, projects, team, announcements] = await Promise.all([
    getSettings(),
    getUpcomingEvents(3),
    getFeaturedProjects(3),
    getTeam(),
    getAnnouncements(3),
  ]);
  const highlights = team.slice(0, 4);

  return (
    <>
      <Hero
        clubName={settings.clubName || DEFAULTS.clubName}
        headline={settings.heroHeadline || DEFAULTS.heroHeadline}
        subtext={settings.heroSubtext || DEFAULTS.heroSubtext}
      />

      {settings.mission && (
        <Section eyebrow="Our mission" title="What we are about">
          <p className="max-w-3xl text-xl leading-relaxed text-fg/85">{settings.mission}</p>
        </Section>
      )}

      {events.length > 0 && (
        <Section eyebrow="Happening soon" title="Upcoming events" href="/events">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section eyebrow="Built by members" title="Featured projects" href="/projects">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {highlights.length > 0 && (
        <Section eyebrow="The people" title="Meet the team" href="/team" hrefLabel="Full team">
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {highlights.map((m) => (
              <li key={m._id} className="overflow-hidden rounded-2xl border border-line bg-surface/90">
                <SafeImage image={m.portrait} width={600} height={800} alt={m.name} sizes="(min-width: 1024px) 280px, 50vw" />
                <div className="p-4">
                  <p className="font-display font-semibold">{m.name}</p>
                  <p className="text-sm text-brand-cyan">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {announcements.length > 0 && (
        <Section eyebrow="Latest" title="Announcements" href="/announcements">
          <div className="grid gap-5 md:grid-cols-3">
            {announcements.map((a) => (
              <AnnouncementCard key={a._id} item={a} />
            ))}
          </div>
        </Section>
      )}

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl border border-line-strong bg-surface/90 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Want to be part of it?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Whether you are new to machine learning or already building models, there is a place for you.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/join">Join the Club</ButtonLink>
            <Link href="/about" className="self-center text-sm font-medium text-muted hover:text-brand-cyan">
              Learn more →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
