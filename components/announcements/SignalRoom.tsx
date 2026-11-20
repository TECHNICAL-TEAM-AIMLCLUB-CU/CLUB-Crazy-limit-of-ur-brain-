'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import AnnouncementCard from '@/components/cards/AnnouncementCard';
import AnnouncementExpansion from '@/components/announcements/AnnouncementExpansion';
import AnnouncementFilters from '@/components/announcements/AnnouncementFilters';
import FeaturedAnnouncementCarousel from '@/components/announcements/FeaturedAnnouncementCarousel';
import { ANNOUNCEMENT_CATEGORIES, isAnnouncementCategory, type AnnouncementCategory } from '@/lib/announcement-categories';
import type { Announcement } from '@/lib/types';

type Props = {
  announcements: Announcement[];
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

export default function SignalRoom({ announcements }: Props) {
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
    const explicit = announcements.filter((item) => item.featured === true);
    return explicit.length > 0 ? explicit : announcements.slice(0, 1);
  }, [announcements]);

  const availableCategories = useMemo(() => {
    const present = new Set(
      announcements.flatMap((item) => (isAnnouncementCategory(item.category) ? [item.category] : [])),
    );
    return ANNOUNCEMENT_CATEGORIES
      .filter((item) => present.has(item.value))
      .map((item) => item.value);
  }, [announcements]);

  const visibleAnnouncements = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return announcements.filter((item) => {
      if (category && item.category !== category) return false;
      if (!normalizedQuery) return true;
      return [item.title, item.summary, item.body]
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
    });
  }, [announcements, category, query]);

  function openAnnouncement(item: Announcement, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    updateWithTransition(trigger, 'open', () => setSelected(item));
  }

  function closeAnnouncement() {
    updateWithTransition(triggerRef.current, 'close', () => setSelected(null));
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <FeaturedAnnouncementCarousel
          announcements={featuredAnnouncements}
          onSelect={openAnnouncement}
          reducedMotion={reducedMotion}
          suspended={selected !== null}
        />

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
      </div>

      {selected && (
        <AnnouncementExpansion
          announcement={selected}
          onClose={closeAnnouncement}
        />
      )}
    </>
  );
}
