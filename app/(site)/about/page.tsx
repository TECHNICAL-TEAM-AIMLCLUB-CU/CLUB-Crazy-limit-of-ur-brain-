import { EmptyState, PageHeader, Section } from '@/components/ui/Section';
import RichText from '@/components/ui/RichText';
import { DEFAULTS } from '@/lib/defaults';
import { getSettings } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;
export const metadata = pageMetadata({
  title: 'About',
  description: 'Our mission, vision and what the club does.',
  path: '/about',
});

export default async function AboutPage() {
  const s = await getSettings();
  const activities = s.activities ?? [];
  const hasStory = Array.isArray(s.aboutBody) && s.aboutBody.length > 0;

  return (
    <>
      <PageHeader eyebrow="About" title={`About ${s.clubName || DEFAULTS.clubName}`} description={s.tagline || DEFAULTS.tagline} />

      <Section title="Mission & vision">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface/90 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">Mission</h3>
            <p className="mt-3 text-lg text-fg/90">{s.mission || DEFAULTS.mission}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface/90 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brand-violet">Vision</h3>
            <p className="mt-3 text-lg text-fg/90">{s.vision || DEFAULTS.vision}</p>
          </div>
        </div>
      </Section>

      <Section title="What we do">
        {activities.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <li key={a.title} className="rounded-2xl border border-line bg-surface/90 p-6">
                <h3 className="font-display text-xl font-semibold">{a.title}</h3>
                {a.description && <p className="mt-2 text-sm text-muted">{a.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No activities listed yet">Add them in Studio under Site settings → About page.</EmptyState>
        )}
      </Section>

      {hasStory && (
        <Section title="Our story">
          <div className="max-w-3xl">
            <RichText value={s.aboutBody as unknown[]} />
          </div>
        </Section>
      )}
    </>
  );
}
