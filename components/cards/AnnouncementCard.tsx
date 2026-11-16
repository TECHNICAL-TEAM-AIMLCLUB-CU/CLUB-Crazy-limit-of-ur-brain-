'use client';

import Link from 'next/link';
import { useId, type PointerEvent } from 'react';
import { announcementCategoryLabel } from '@/lib/announcement-categories';
import type { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type Props = {
  item: Announcement;
  onSelect?: (item: Announcement, trigger: HTMLButtonElement) => void;
  featured?: boolean;
  featuredLabel?: string;
};

export default function AnnouncementCard({
  item,
  onSelect,
  featured = false,
  featuredLabel = 'Featured',
}: Props) {
  const instanceId = useId();
  const triggerId = `${instanceId}-announcement`;
  const category = announcementCategoryLabel(item.category);

  function applyTilt(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty('--signal-tilt-x', `${(0.5 - y) * 2.4}deg`);
    event.currentTarget.style.setProperty('--signal-tilt-y', `${(x - 0.5) * 2.4}deg`);
  }

  function resetTilt(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty('--signal-tilt-x');
    event.currentTarget.style.removeProperty('--signal-tilt-y');
  }

  return (
    <article
      onPointerMove={applyTilt}
      onPointerLeave={resetTilt}
      className={`signal-room-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line-strong/70 bg-surface/90 p-5 shadow-[0_14px_38px_rgba(3,8,23,0.14)] sm:p-6 ${
        featured ? 'min-h-72 bg-gradient-to-br from-sky-300/10 via-emerald-200/5 to-violet-300/10 sm:min-h-80 sm:p-8' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {featured && (
          <span className="rounded-full border border-sky-200/25 bg-sky-200/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-sky-100">
            {featuredLabel}
          </span>
        )}
        {category && (
          <span className="rounded-full border border-line-strong bg-bg/35 px-3 py-1 text-xs text-muted">
            {category}
          </span>
        )}
        <time dateTime={item.publishedAt} className="ml-auto font-mono text-xs text-muted">
          {formatDate(item.publishedAt)}
        </time>
      </div>

      <h2 className={`mt-5 font-display font-semibold tracking-tight ${featured ? 'text-2xl sm:text-4xl' : 'text-xl'}`}>
        {onSelect ? (
          <button
            id={triggerId}
            type="button"
            aria-label={`Expand announcement: ${item.title}`}
            onClick={(event) => onSelect(item, event.currentTarget)}
            className="text-left transition-colors hover:text-sky-100 focus-visible:text-sky-100 motion-reduce:transition-none"
          >
            {item.title}
          </button>
        ) : (
          <Link href={`/announcements/${item.slug}`} className="transition-colors hover:text-sky-100 motion-reduce:transition-none">
            {item.title}
          </Link>
        )}
      </h2>

      {item.summary && (
        <p className={`mt-3 max-w-3xl leading-relaxed text-muted ${featured ? 'text-base sm:text-lg' : 'text-sm'}`}>
          {item.summary}
        </p>
      )}

      <div className="mt-auto flex justify-end pt-6">
        {onSelect ? (
          <Link
            href={`/announcements/${item.slug}`}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-fg"
          >
            Open full story <span aria-hidden="true">↗</span>
          </Link>
        ) : (
          <Link
            href={`/announcements/${item.slug}`}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-fg"
          >
            Read announcement <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
