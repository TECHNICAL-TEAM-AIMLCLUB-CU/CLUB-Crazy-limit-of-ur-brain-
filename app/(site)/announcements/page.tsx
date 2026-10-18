import AnnouncementCard from '@/components/cards/AnnouncementCard';
import { EmptyState, PageHeader } from '@/components/ui/Section';
import { getAnnouncements } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ title: 'Announcements', description: 'News and updates from the club.', path: '/announcements' });

export default async function AnnouncementsPage() {
  const items = await getAnnouncements();
  return (
    <>
      <PageHeader eyebrow="News" title="Announcements" description="The latest updates from the club." />
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        {items.length > 0 ? (
          <div className="max-w-3xl space-y-4">
            {items.map((a) => (
              <AnnouncementCard key={a._id} item={a} />
            ))}
          </div>
        ) : (
          <EmptyState title="No announcements yet" />
        )}
      </div>
    </>
  );
}
