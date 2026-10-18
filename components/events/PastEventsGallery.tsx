'use client';

import DomeGallery from '@/components/DomeGallery';
import type { ClubEvent } from '@/lib/types';
import { formatDateTime, imageUrl } from '@/lib/utils';

export default function PastEventsGallery({ events }: { events: ClubEvent[] }) {
  const images = events.flatMap((event) => {
    const src = imageUrl(event.image);
    return src ? [{ src, alt: event.image?.alt || `${event.title} — ${formatDateTime(event.date)}` }] : [];
  });

  return (
    <div>
      <div role="region" aria-label="Past event photo gallery" className="mb-8 overflow-hidden rounded-3xl border border-line bg-surface/80 p-2 sm:p-3">
        <div className="h-[26rem] sm:h-[34rem]">
          <DomeGallery images={images.length > 0 ? images : undefined} />
        </div>
        <p className="px-3 pb-2 pt-3 text-center text-sm text-muted">
          {images.length > 0
            ? 'Drag to explore past event photos. Select a photo to enlarge it.'
            : 'Drag to explore the gallery. Past event photos will appear here when added in Studio.'}
        </p>
      </div>

      {events.length === 0 ? (
        <p className="mb-8 rounded-2xl border border-line bg-surface/80 p-5 text-sm text-muted">
          No past events have been added yet. The gallery is showing its sample images for now.
        </p>
      ) : null}

      {events.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Past event details">
          {events.map((event) => (
            <li key={event._id} className="rounded-2xl border border-line bg-surface/90 p-5">
              <time dateTime={event.date} className="font-mono text-xs text-brand-cyan">
                {formatDateTime(event.date)}
              </time>
              <h3 className="mt-2 font-display text-xl font-semibold">{event.title}</h3>
              {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
              {event.description && <p className="mt-3 line-clamp-4 text-sm text-muted">{event.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
