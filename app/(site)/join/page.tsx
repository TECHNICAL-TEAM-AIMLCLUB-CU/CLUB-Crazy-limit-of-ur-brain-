import JoinForm from '@/components/site/JoinForm';
import { PageHeader } from '@/components/ui/Section';
import { DEFAULTS } from '@/lib/defaults';
import { getSettings } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';
import { safeUrl } from '@/lib/utils';

export const metadata = pageMetadata({ title: 'Join', description: 'Join the club or get in touch with the team.', path: '/join' });

export default async function JoinPage() {
  const s = await getSettings();
  const socials = (s.socials ?? []).map((x) => ({ ...x, href: safeUrl(x.url) })).filter((x) => x.href);

  return (
    <>
      <PageHeader eyebrow="Join" title="Join the club" description={s.joinText || DEFAULTS.joinText} />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
        <JoinForm />
        <aside className="h-fit rounded-2xl border border-line bg-surface/90 p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">Other ways to reach us</h2>
          {s.contactEmail || socials.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm">
              {s.contactEmail && (
                <li>
                  <a href={`mailto:${s.contactEmail}`} className="text-brand-cyan hover:underline">
                    {s.contactEmail}
                  </a>
                </li>
              )}
              {socials.map((x) => (
                <li key={x.platform + x.url}>
                  <a href={x.href!} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                    {x.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Official contact links will appear here once they are added in Studio.</p>
          )}
        </aside>
      </div>
    </>
  );
}
