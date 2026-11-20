'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import RichText from '@/components/ui/RichText';
import { announcementCategoryLabel } from '@/lib/announcement-categories';
import type { Announcement } from '@/lib/types';
import { formatDate, formatDateTime, imageUrl, safeUrl } from '@/lib/utils';

type Props = {
  announcement: Announcement;
  onClose: () => void;
};

export default function AnnouncementExpansion({ announcement, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const headingId = useId();
  const category = announcementCategoryLabel(announcement.category);
  const image = imageUrl(announcement.image);
  const ctaUrl = safeUrl(announcement.ctaUrl);
  const ctaIsExternal = ctaUrl?.startsWith('http') ?? false;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-close-button]')?.focus();
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (dialog.open) dialog.close();
    };
  }, []);

  function requestClose() {
    if (closing) return;
    setClosing(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    closeTimerRef.current = window.setTimeout(onClose, delay);
  }

  return (
    <dialog
      ref={dialogRef}
      id={`announcement-detail-${announcement.slug}`}
      aria-labelledby={headingId}
      data-closing={closing ? 'true' : undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="signal-room-dialog"
    >
      <article data-transition-detail="true" className="signal-room-expansion relative">
        <button
          type="button"
          data-close-button
          onClick={requestClose}
          aria-label="Close announcement details"
          className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-bg/70 text-lg text-fg transition hover:border-sky-200/50 hover:text-sky-100 sm:right-6 sm:top-6"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="border-b border-line bg-gradient-to-br from-sky-300/10 via-emerald-200/5 to-violet-300/10 px-6 pb-8 pt-20 sm:px-10 sm:pb-10 sm:pt-24">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-line-strong bg-bg/40 px-3 py-1 text-xs text-muted">
              {category}
            </span>
            <span className="font-mono text-xs text-muted">
              Published <time dateTime={announcement.publishedAt}>{formatDate(announcement.publishedAt)}</time>
            </span>
          </div>
          <h2 id={headingId} className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            {announcement.title}
          </h2>
          {announcement.summary && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
              {announcement.summary}
            </p>
          )}
          {(announcement.eventDate || announcement.deadline) && (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {announcement.eventDate && (
                <div className="flex gap-1.5">
                  <dt>Event</dt>
                  <dd><time dateTime={announcement.eventDate}>{formatDateTime(announcement.eventDate)}</time></dd>
                </div>
              )}
              {announcement.deadline && (
                <div className="flex gap-1.5">
                  <dt>Deadline</dt>
                  <dd><time dateTime={announcement.deadline}>{formatDateTime(announcement.deadline)}</time></dd>
                </div>
              )}
            </dl>
          )}
        </div>

        <div className="px-6 py-7 sm:px-10 sm:py-9">
          {image && (
            <div className="mb-7 overflow-hidden rounded-2xl border border-line-strong/60">
              <Image
                src={image}
                alt={announcement.image?.alt || ''}
                width={1200}
                height={675}
                sizes="(max-width: 640px) 100vw, 840px"
                className="h-auto max-h-[28rem] w-full object-cover"
                unoptimized
              />
            </div>
          )}
          {announcement.body && <RichText value={announcement.body} />}
          <div className="mt-9 border-t border-line pt-5">
            {ctaUrl && announcement.ctaLabel && (
              <a
                href={ctaUrl}
                target={ctaIsExternal ? '_blank' : undefined}
                rel={ctaIsExternal ? 'noopener noreferrer' : undefined}
                className="mr-3 inline-flex min-h-11 items-center rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-bg transition hover:brightness-110 motion-reduce:transition-none"
              >
                {announcement.ctaLabel}
              </a>
            )}
            <Link
              href={`/announcements/${announcement.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 py-2 text-sm font-medium text-fg transition hover:border-sky-200/50 hover:text-sky-100"
            >
              Open shareable announcement <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
          </div>
        </div>
      </article>
    </dialog>
  );
}
