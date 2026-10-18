import type { ClubEvent } from '@/lib/types';
import { formatDateTime, safeUrl } from '@/lib/utils';
import SafeImage from '@/components/ui/SafeImage';

export default function EventCard({ event, past = false }: { event: ClubEvent; past?: boolean }) {
  const reg = safeUrl(event.registrationUrl);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/90 transition duration-200 hover:border-line-strong motion-reduce:transition-none">
      <SafeImage image={event.image} width={800} height={450} alt="" sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-1 flex-col p-5">
        <time dateTime={event.date} className="font-mono text-xs text-brand-cyan">
          {formatDateTime(event.date)}
        </time>
        <h3 className="mt-2 font-display text-xl font-semibold">{event.title}</h3>
        {event.location && <p className="mt-1 text-sm text-muted">{event.location}</p>}
        {event.description && <p className="mt-3 line-clamp-4 text-sm text-muted">{event.description}</p>}
        {reg && !past && (
          <a
            href={reg}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-fit rounded-full border border-brand-cyan/50 px-4 py-2 text-sm font-medium text-brand-cyan transition hover:bg-brand-cyan/10"
          >
            Register <span className="sr-only">for {event.title}</span>
          </a>
        )}
      </div>
    </article>
  );
}
