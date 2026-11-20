'use client';

import { useEffect, useState } from 'react';
import AnnouncementCard from '@/components/cards/AnnouncementCard';
import type { Announcement } from '@/lib/types';

type Props = {
  announcements: Announcement[];
  onSelect: (item: Announcement, trigger: HTMLButtonElement) => void;
  selectedSlug: string | null;
  reducedMotion: boolean;
  suspended: boolean;
};

export default function FeaturedAnnouncementCarousel({
  announcements,
  onSelect,
  selectedSlug,
  reducedMotion,
  suspended,
}: Props) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rotationPaused = hovered || focusWithin || userPaused || suspended;

  useEffect(() => {
    const updateVisibility = () => setVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (announcements.length < 2 || rotationPaused || reducedMotion || !visible) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % announcements.length),
      7500,
    );
    return () => window.clearTimeout(timer);
  }, [announcements.length, index, reducedMotion, rotationPaused, visible]);

  if (announcements.length === 0) return null;

  const currentIndex = index % announcements.length;
  const current = announcements[currentIndex];
  const featuredLabel = announcements.some((item) => item.featured === true) ? 'Featured' : 'Latest';
  const move = (offset: number) => {
    setIndex((currentValue) => (currentValue + offset + announcements.length) % announcements.length);
  };

  return (
    <section
      aria-label="Featured announcements"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
      className="mb-12"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-100/80">In focus</p>
        {announcements.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-mono text-xs text-muted">
              {currentIndex + 1} / {announcements.length}
            </span>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                aria-pressed={userPaused}
                aria-label={userPaused ? 'Resume featured announcement rotation' : 'Pause featured announcement rotation'}
                className="min-h-11 rounded-full border border-line-strong px-3 text-xs text-muted transition hover:border-sky-200/50 hover:text-fg"
              >
                {userPaused ? 'Play' : 'Pause'}
              </button>
            )}
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Show previous featured announcement"
              className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface/80 text-fg transition hover:border-sky-200/50 hover:text-sky-100"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Show next featured announcement"
              className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface/80 text-fg transition hover:border-sky-200/50 hover:text-sky-100"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
      <div key={current._id} aria-live={rotationPaused ? 'polite' : 'off'} aria-atomic="true" className="signal-room-slide">
        <AnnouncementCard
          item={current}
          featured
          featuredLabel={featuredLabel}
          expanded={current.slug === selectedSlug}
          onSelect={onSelect}
        />
      </div>
    </section>
  );
}
