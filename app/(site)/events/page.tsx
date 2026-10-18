import EventCard from '@/components/cards/EventCard';
import PastEventsGallery from '@/components/events/PastEventsGallery';
import { EmptyState, PageHeader, Section } from '@/components/ui/Section';
import { getEvents } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ title: 'Events', description: 'Upcoming and past club events.', path: '/events' });

export default async function EventsPage() {
  const events = await getEvents(); // newest first
  const now = Date.now();
  const isUpcoming = (e: { date: string; endDate?: string }) => new Date(e.endDate ?? e.date).getTime() >= now;

  const upcoming = events.filter(isUpcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date)); // soonest first
  const past = events.filter((e) => !isUpcoming(e)); // already newest first

  return (
    <>
      <PageHeader eyebrow="Events" title="Events & activities" description="Workshops, talks and meetups organised by the club." />
      <Section title="Upcoming">
        {upcoming.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e._id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming events">Check back soon, or follow the announcements page.</EmptyState>
        )}
      </Section>
      <Section title="Past events">
        {past.length > 0 ? (
          <PastEventsGallery events={past} />
        ) : (
          <EmptyState title="No past events yet" />
        )}
      </Section>
    </>
  );
}
