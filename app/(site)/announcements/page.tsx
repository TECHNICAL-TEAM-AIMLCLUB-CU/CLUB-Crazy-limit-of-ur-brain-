import SignalRoom from '@/components/announcements/SignalRoom';
import { EmptyState, PageHeader } from '@/components/ui/Section';
import { getSignalRoomAnnouncements } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Signal Room',
  description: 'A considered look at the latest announcements and updates from the AIML Club.',
  path: '/announcements',
});

export default async function AnnouncementsPage() {
  const items = await getSignalRoomAnnouncements();
  return (
    <>
      <PageHeader
        eyebrow="Signal Room"
        title="Announcements"
        description="A clear signal from the club: ideas, events, and updates worth your attention."
      />
      {items.length > 0 ? (
        <SignalRoom announcements={items} />
      ) : (
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <EmptyState title="No announcements yet" />
        </div>
      )}
    </>
  );
}
