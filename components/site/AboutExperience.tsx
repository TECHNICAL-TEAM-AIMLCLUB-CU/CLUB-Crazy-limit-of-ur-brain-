
import { PageHeader, Section, EmptyState } from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import { DEFAULTS } from '@/lib/defaults';
import type { SiteSettings } from '@/lib/types';

type Props = {
  settings: SiteSettings;
  compact?: boolean;
};

function ContentCard({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string;
  accent: 'cyan' | 'violet';
}) {
  const hasContent = Boolean(
    value?.trim() && !value.trim().startsWith('Add your club')
  );

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-7 transition duration-300 hover:-translate-y-1 hover:border-line-strong sm:p-9">
      <div
        className={`mb-6 h-1 w-12 rounded-full ${
          accent === 'cyan' ? 'bg-brand-cyan' : 'bg-brand-violet'
        }`}
      />
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
        {label}
      </p>
      <p className="mt-4 text-lg leading-8 text-fg/90">
        {hasContent
          ? value
          : `${label} will appear here once added in Site settings.`}
      </p>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-brand-cyan/5 blur-3xl transition group-hover:bg-brand-cyan/10"
      />
    </article>
  );
}

export default function AboutExperience({
  settings,
  compact = false,
}: Props) {
  const activities = settings.activities ?? [];
  const story = settings.aboutBody?.trim();

  if (compact) {
    return (
      <>
        <Section eyebrow="About us" title="More than a club" id="about">
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-7 sm:p-9">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">
                Who we are
              </p>
              <h3 className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {settings.tagline || DEFAULTS.tagline}
              </h3>
              <p className="mt-5 max-w-xl leading-7 text-muted">
                {story
                  ? 'Explore our story, the ideas behind our community, and the activities that bring our members together.'
                  : 'A space to explore artificial intelligence and machine learning through curiosity and shared learning.'}
              </p>
              <a
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan transition hover:gap-3"
              >
                Discover our story <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="grid gap-5">
              <ContentCard label="Our mission" value={settings.mission} accent="cyan" />
              <ContentCard label="Our vision" value={settings.vision} accent="violet" />
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Get to know us"
        title={`About ${settings.clubName || DEFAULTS.clubName}`}
        description={settings.tagline || DEFAULTS.tagline}
      />

      <section className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-surface-2 p-7 sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-violet/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-cyan/10 blur-3xl"
          />
          <div className="relative max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-cyan">
              Curiosity meets possibility
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Build.
              <span className="gradient-text"> Learn.</span>
              <br />
              Explore together.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {settings.heroSubtext || DEFAULTS.heroSubtext}
            </p>
          </div>
          <div className="relative mt-12 flex flex-wrap gap-3">
            {['Artificial Intelligence', 'Machine Learning', 'Student Community'].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-line-strong bg-bg/60 px-4 py-2 font-mono text-xs text-fg/80"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <Section eyebrow="Our purpose" title="Mission & vision">
        <div className="grid gap-5 md:grid-cols-2">
          <ContentCard label="Our mission" value={settings.mission} accent="cyan" />
          <ContentCard label="Our vision" value={settings.vision} accent="violet" />
        </div>
      </Section>

      <Section eyebrow="What brings us together" title="What we do">
        {activities.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <article
                key={activity.title}
                className="group rounded-3xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-cyan/40 sm:p-7"
              >
                <span className="font-mono text-sm text-brand-cyan">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-7 font-display text-xl font-semibold">
                  {activity.title}
                </h3>
                {activity.description && (
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {activity.description}
                  </p>
                )}
                <div className="mt-7 h-px w-full bg-line transition group-hover:bg-brand-cyan/50" />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Our activities are coming soon">
            Activity details will appear here once they are added in Site settings.
          </EmptyState>
        )}
      </Section>

      {story && (
        <Section eyebrow="Behind the community" title="Our story">
          <div className="rounded-3xl border border-line bg-surface p-7 sm:p-10">
            <div className="max-w-3xl">
              <RichText value={story} />
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
