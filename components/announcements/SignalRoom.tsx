'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import AnnouncementCard from '@/components/cards/AnnouncementCard';
import AnnouncementExpansion from '@/components/announcements/AnnouncementExpansion';
import AnnouncementFilters from '@/components/announcements/AnnouncementFilters';
import FeaturedAnnouncementCarousel from '@/components/announcements/FeaturedAnnouncementCarousel';
import UpcomingTimeline from '@/components/announcements/UpcomingTimeline';
import {
  filterAnnouncements,
  getAvailableAnnouncementCategories,
  getFeaturedAnnouncements,
} from '@/lib/announcement-feed';
import {
  ANNOUNCEMENT_CATEGORIES,
  isAnnouncementCategory,
  REQUIRED_ANNOUNCEMENT_FILTERS,
  type AnnouncementCategory,
} from '@/lib/announcement-categories';
import type { Announcement } from '@/lib/types';

type Props = {
  announcements: Announcement[];
  upcomingAnnouncements: (Announcement & { eventDate: string })[];
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function updateWithTransition(
  trigger: HTMLButtonElement | null,
  direction: 'open' | 'close',
  update: () => void,
) {
  const viewTransitionDocument = document as ViewTransitionDocument;
  const card = trigger?.closest('article');
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    typeof viewTransitionDocument.startViewTransition !== 'function' ||
    !card
  ) {
    update();
    return;
  }
  if (direction === 'open') card.setAttribute('data-transition-source', 'true');
  viewTransitionDocument.startViewTransition(() => {
    flushSync(() => {
      if (direction === 'close') card.setAttribute('data-transition-source', 'true');
      else card.removeAttribute('data-transition-source');
      update();
    });
    if (direction === 'close') {
      window.setTimeout(() => card.removeAttribute('data-transition-source'), 320);
    }
  });
}

export default function SignalRoom({ announcements, upcomingAnnouncements }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (selected !== null || !triggerRef.current) return;
    const trigger = triggerRef.current;
    window.requestAnimationFrame(() => {
      if (trigger.isConnected) trigger.focus();
      else searchRef.current?.focus();
    });
  }, [selected]);

  const featuredAnnouncements = useMemo(() => {
    return getFeaturedAnnouncements(announcements);
  }, [announcements]);

  const availableCategories = useMemo(() => {
    return getAvailableAnnouncementCategories(
      announcements,
      ANNOUNCEMENT_CATEGORIES.map((item) => item.value),
      REQUIRED_ANNOUNCEMENT_FILTERS,
    );
  }, [announcements]);
  const categoryCount = new Set(
    announcements.flatMap((item) => (isAnnouncementCategory(item.category) ? [item.category] : [])),
  ).size;

  const visibleAnnouncements = useMemo(() => {
    return filterAnnouncements(announcements, category, query);
  }, [announcements, category, query]);

  function openAnnouncement(item: Announcement, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    updateWithTransition(trigger, 'open', () => setSelected(item));
  }

  function closeAnnouncement() {
    updateWithTransition(triggerRef.current, 'close', () => setSelected(null));
  }

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44rem] bg-[radial-gradient(ellipse_at_18%_8%,rgba(16,185,129,0.12),transparent_58%),radial-gradient(ellipse_at_82%_15%,rgba(139,92,246,0.12),transparent_55%),radial-gradient(ellipse_at_50%_70%,rgba(34,211,238,0.06),transparent_62%)]"
      />
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="relative z-[1]">
          <FeaturedAnnouncementCarousel
            announcements={featuredAnnouncements}
            onSelect={openAnnouncement}
            selectedSlug={selected?.slug ?? null}
            reducedMotion={reducedMotion}
            suspended={selected !== null}
          />

          <section aria-label="Announcement statistics" className="mb-12 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-line-strong/70 bg-surface/75 p-4">
              <p className="text-sm text-muted">Published announcements</p>
              <p className="mt-1 font-display text-2xl font-semibold">{announcements.length}</p>
            </div>
            <div className="rounded-2xl border border-line-strong/70 bg-surface/75 p-4">
              <p className="text-sm text-muted">Topics represented</p>
              <p className="mt-1 font-display text-2xl font-semibold">{categoryCount}</p>
            </div>
            <div className="rounded-2xl border border-line-strong/70 bg-surface/75 p-4">
              <p className="text-sm text-muted">Upcoming dated updates</p>
              <p className="mt-1 font-display text-2xl font-semibold">{upcomingAnnouncements.length}</p>
            </div>
          </section>

          <UpcomingTimeline announcements={upcomingAnnouncements} />
        </div>

        <section aria-labelledby="signal-room-browse-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Browse the archive</p>
              <h2 id="signal-room-browse-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                All announcements
              </h2>
            </div>
            <p aria-live="polite" aria-atomic="true" role="status" className="text-sm text-muted">
              {visibleAnnouncements.length} {visibleAnnouncements.length === 1 ? 'announcement' : 'announcements'}
            </p>
          </div>

          <div className="mb-7">
            <AnnouncementFilters
              categories={availableCategories}
              category={category}
              query={query}
              searchRef={searchRef}
              onCategoryChange={setCategory}
              onQueryChange={setQuery}
              onReset={() => {
                setQuery('');
                setCategory(null);
              }}
            />
          </div>

          {visibleAnnouncements.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleAnnouncements.map((item) => (
                <AnnouncementCard
                  key={item._id}
                  item={item}
                  expanded={selected?.slug === item.slug}
                  onSelect={openAnnouncement}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line-strong bg-surface/55 px-6 py-12 text-center">
              <h3 className="font-display text-xl font-medium">No matching announcements</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Try another search or clear the selected category to browse all updates.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory(null);
                  searchRef.current?.focus();
                }}
                className="mt-5 min-h-11 rounded-full border border-line-strong px-5 py-2 text-sm text-fg transition hover:border-sky-200/50 hover:text-sky-100"
              >
                Clear search and filters
              </button>
            </div>
          )}
        </section>

        <section className="mt-14 rounded-3xl border border-line-strong/70 bg-gradient-to-br from-emerald-300/10 via-surface/80 to-violet-300/10 px-6 py-8 sm:px-9 sm:py-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">Build with us</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Don&apos;t just watch the future. Build it.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Explore the club, find a team, and tell us what you&apos;re excited to learn or create.
          </p>
          <Link
            href="/#join"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-bg transition hover:brightness-110 motion-reduce:transition-none"
          >
            Join the Club
          </Link>
        </section>
      </div>

      {selected && (
        <AnnouncementExpansion
          announcement={selected}
          onClose={closeAnnouncement}
        />
      )}
    </div>
  );
}
