import Link from 'next/link';
import { announcementCategoryLabel } from '@/lib/announcement-categories';
import type { Announcement } from '@/lib/types';
import { formatDateTime, safeAnnouncementUrl } from '@/lib/utils';

type UpcomingAnnouncement = Announcement & { eventDate: string };

export default function UpcomingTimeline({ announcements }: { announcements: UpcomingAnnouncement[] }) {
  if (announcements.length === 0) return null;

  return (
    <section aria-labelledby="signal-room-upcoming-heading" className="mb-12">
      <div className="mb-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">On the horizon</p>
        <h2 id="signal-room-upcoming-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Upcoming dates
        </h2>
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {announcements.map((announcement) => {
          const ctaUrl = safeAnnouncementUrl(announcement.ctaUrl);
          const external = ctaUrl?.startsWith('http') ?? false;
          const usesAnchor = external || (ctaUrl?.startsWith('mailto:') ?? false);
          return (
            <li key={announcement._id} className="rounded-2xl border border-line-strong/70 bg-surface/85 p-5 sm:p-6">
              <article>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <time dateTime={announcement.eventDate}>{formatDateTime(announcement.eventDate)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{announcementCategoryLabel(announcement.category)}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  <Link href={`/announcements/${announcement.slug}`} className="transition-colors hover:text-brand-cyan">
                    {announcement.title}
                  </Link>
                </h3>
                {announcement.summary && <p className="mt-2 text-sm leading-relaxed text-muted">{announcement.summary}</p>}
                {announcement.deadline && (
                  <p className="mt-3 text-sm text-fg/85">
                    <span className="font-medium">Deadline:</span>{' '}
                    <time dateTime={announcement.deadline}>{formatDateTime(announcement.deadline)}</time>
                  </p>
                )}
                {ctaUrl && announcement.ctaLabel && (
                  usesAnchor ? (
                    <a
                      href={ctaUrl}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-brand-cyan transition hover:border-brand-cyan/50"
                    >
                      {announcement.ctaLabel}
                    </a>
                  ) : (
                    <Link
                      href={ctaUrl}
                      className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-brand-cyan transition hover:border-brand-cyan/50"
                    >
                      {announcement.ctaLabel}
                    </Link>
                  )
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
