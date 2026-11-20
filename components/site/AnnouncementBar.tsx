'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { dismissAnnouncementBarAction } from '@/app/(site)/announcement-bar-actions';
import type { AnnouncementBarSelection } from '@/lib/announcement-bar';
import { getAnnouncementDeadlineStatus } from '@/lib/announcement-metadata';
import { formatAnnouncementDeadline, safeAnnouncementUrl } from '@/lib/utils';

const toneClasses = {
  notice: 'border-emerald-300/15 bg-[#062320] text-slate-100',
  important: 'border-rose-300/20 bg-[#2b151a] text-rose-50',
  deadline: 'border-amber-300/20 bg-[#2a1e0a] text-amber-50',
} as const;

const labelClasses = {
  notice: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
  important: 'border-rose-300/30 bg-rose-300/10 text-rose-200',
  deadline: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
} as const;

export default function AnnouncementBar({
  selection,
}: {
  selection: AnnouncementBarSelection | null;
}) {
  const router = useRouter();
  const refreshRequested = useRef<string | null>(null);
  const [now, setNow] = useState(selection?.selectedAt ?? 0);
  const deadline =
    selection?.type === 'deadline' ? selection.announcement.deadline : undefined;
  const publicationEndsAt = selection?.announcement.publicationEndsAt;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const updateActiveWindow = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      const currentDate = new Date(currentTime);
      const nextUtcMidnight = Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() + 1,
      );
      const deadlineTime = deadline ? Date.parse(deadline) : Number.POSITIVE_INFINITY;
      const endTime = publicationEndsAt ? Date.parse(publicationEndsAt) : Number.POSITIVE_INFINITY;
      const expired = deadlineTime <= currentTime || endTime <= currentTime;

      if (expired && selection && refreshRequested.current !== selection.fingerprint) {
        refreshRequested.current = selection.fingerprint;
        router.refresh();
      }

      const nextChange = Math.min(
        deadlineTime > currentTime ? deadlineTime : Number.POSITIVE_INFINITY,
        endTime > currentTime ? endTime : Number.POSITIVE_INFINITY,
        deadline && deadlineTime > currentTime ? nextUtcMidnight : Number.POSITIVE_INFINITY,
      );
      if (Number.isFinite(nextChange)) {
        const delay = Math.min(Math.max(1000, nextChange - currentTime + 50), 86_400_000);
        timer = setTimeout(updateActiveWindow, delay);
      }
    };

    if (!deadline && !publicationEndsAt) return;
    updateActiveWindow();
    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [deadline, publicationEndsAt, router, selection]);

  if (!selection) return null;

  const { announcement, fingerprint, type } = selection;
  const actionHref = safeAnnouncementUrl(announcement.ctaUrl);
  const showAction = Boolean(actionHref && announcement.ctaLabel);
  const externalAction = actionHref?.startsWith('http') ?? false;
  const nativeAnchorAction = externalAction || (actionHref?.startsWith('mailto:') ?? false);
  const deadlineStatus = deadline ? getAnnouncementDeadlineStatus(deadline, now) : null;
  const deadlineClosed = deadlineStatus === 'Closed';
  const publicationWindowEnded = publicationEndsAt
    ? Date.parse(publicationEndsAt) <= now
    : false;
  const actionExpired = deadlineClosed || publicationWindowEnded;
  const canDismiss = type !== 'important' && announcement.dismissible === true;
  const hasSecondaryContent = Boolean(deadlineStatus || showAction);

  return (
    <aside
      aria-label="Club announcement"
      className={`fixed inset-x-0 top-0 z-[60] h-[5.25rem] border-b sm:h-12 ${toneClasses[type]}`}
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[1fr_auto] items-center gap-x-3 px-4 py-1 sm:flex sm:gap-4 sm:px-8 sm:py-0">
        <span
          className={`row-span-2 inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] sm:text-[0.65rem] ${labelClasses[type]}`}
        >
          {type}
        </span>

        <p
          className={`min-w-0 text-[0.78rem] leading-4 sm:flex-1 sm:text-sm sm:leading-5 ${
            hasSecondaryContent ? 'row-start-1 line-clamp-2 sm:line-clamp-1' : 'row-span-2 line-clamp-3'
          }`}
        >
          {announcement.summary?.trim() || announcement.title}
        </p>

        {hasSecondaryContent && (
          <div className="col-start-2 row-start-2 flex min-w-0 items-center gap-2 text-[0.68rem] sm:ml-auto sm:gap-4 sm:text-xs">
            {deadlineStatus && deadline && (
              <span className="shrink-0 font-medium text-amber-200">
                <time
                  dateTime={deadline}
                  aria-label={`${formatAnnouncementDeadline(deadline)}, UTC`}
                >
                  {formatAnnouncementDeadline(deadline)}
                </time>
                <span aria-hidden="true"> · </span>
                {deadlineStatus}
              </span>
            )}
            {showAction && !actionExpired && actionHref && (
              nativeAnchorAction ? (
                <a
                  href={actionHref}
                  target={externalAction ? '_blank' : undefined}
                  rel={externalAction ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-11 max-w-32 items-center truncate font-medium text-current underline decoration-current/60 underline-offset-4 transition hover:decoration-current focus-visible:decoration-current sm:min-h-0 sm:max-w-56 sm:py-1"
                >
                  {announcement.ctaLabel} <span aria-hidden="true">→</span>
                </a>
              ) : (
                <Link
                  href={actionHref}
                  className="inline-flex min-h-11 max-w-32 items-center truncate font-medium text-current underline decoration-current/60 underline-offset-4 transition hover:decoration-current focus-visible:decoration-current sm:min-h-0 sm:max-w-56 sm:py-1"
                >
                  {announcement.ctaLabel} <span aria-hidden="true">→</span>
                </Link>
              )
            )}
          </div>
        )}

        {canDismiss && (
          <form
            action={dismissAnnouncementBarAction}
            aria-label="Dismiss announcement"
            className="col-start-3 row-span-2 sm:ml-0"
          >
            <input type="hidden" name="announcementId" value={announcement._id} />
            <input type="hidden" name="fingerprint" value={fingerprint} />
            <button
              type="submit"
              aria-label="Dismiss this announcement"
              className="grid size-11 place-items-center rounded-full text-current/75 transition hover:bg-white/5 hover:text-current focus-visible:text-current"
            >
              <span aria-hidden="true" className="text-xl leading-none">×</span>
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
