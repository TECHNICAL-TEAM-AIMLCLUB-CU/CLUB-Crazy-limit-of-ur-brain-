'use client';

import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from '@/lib/announcement-categories';
import type { RefObject } from 'react';

type Props = {
  categories: AnnouncementCategory[];
  category: AnnouncementCategory | null;
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  onCategoryChange: (category: AnnouncementCategory | null) => void;
  onQueryChange: (query: string) => void;
  onReset: () => void;
};

export default function AnnouncementFilters({
  categories,
  category,
  query,
  searchRef,
  onCategoryChange,
  onQueryChange,
  onReset,
}: Props) {
  const labels = new Map(ANNOUNCEMENT_CATEGORIES.map((item) => [item.value, item.label]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search announcements</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search announcements"
            className="w-full rounded-2xl border border-line-strong bg-surface/85 px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-sky-200/50"
          />
        </label>
        {(query || category) && (
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 shrink-0 rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition hover:border-line-strong hover:text-fg"
          >
            Clear filters
          </button>
        )}
      </div>

      <div role="group" aria-label="Filter announcements by category" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={category === null}
          onClick={() => onCategoryChange(null)}
          className={`min-h-10 rounded-full border px-4 py-2 text-sm transition ${
            category === null
              ? 'border-sky-200/40 bg-sky-200/10 text-sky-100'
              : 'border-line bg-surface/60 text-muted hover:text-fg'
          }`}
        >
          All
        </button>
        {categories.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => onCategoryChange(value)}
            className={`min-h-10 rounded-full border px-4 py-2 text-sm transition ${
              category === value
                ? 'border-sky-200/40 bg-sky-200/10 text-sky-100'
                : 'border-line bg-surface/60 text-muted hover:text-fg'
            }`}
          >
            {labels.get(value)}
          </button>
        ))}
      </div>
    </div>
  );
}
