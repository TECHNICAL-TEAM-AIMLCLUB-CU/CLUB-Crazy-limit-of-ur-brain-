import Link from 'next/link';
import { NAV_LINKS } from '@/lib/config';
import type { SiteSettings } from '@/lib/types';
import { DEFAULTS } from '@/lib/defaults';
import { safeUrl } from '@/lib/utils';
import VisitCounter from './VisitCounter';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const name = settings.clubName || DEFAULTS.clubName;
  const socials = (settings.socials ?? []).map((s) => ({ ...s, href: safeUrl(s.url) })).filter((s) => s.href);
  const year = settings.academicYear || String(new Date().getFullYear());

  return (
    <footer className="border-t border-line bg-bg/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">{name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{settings.tagline || DEFAULTS.tagline}</p>
          {settings.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`} className="mt-4 inline-block text-sm text-brand-cyan hover:underline">
              {settings.contactEmail}
            </a>
          )}
        </div>

        <nav aria-label="Footer">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[...NAV_LINKS.slice(1), { href: '/join', label: 'Join' }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-fg/80 hover:text-brand-cyan">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {socials.length > 0 && (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Follow</p>
              <ul className="mt-3 space-y-2 text-sm">
                {socials.map((s) => (
                  <li key={s.platform + s.url}>
                    <a href={s.href!} target="_blank" rel="noopener noreferrer" className="text-fg/80 hover:text-brand-cyan">
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {year} {name}
          </p>
          <VisitCounter />
        </div>
      </div>
    </footer>
  );
}
