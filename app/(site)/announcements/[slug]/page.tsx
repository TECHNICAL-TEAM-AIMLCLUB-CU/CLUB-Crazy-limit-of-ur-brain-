import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/ui/RichText';
import { getAnnouncement } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAnnouncement(slug);
  if (!a) return { title: 'Announcement not found' };
  return pageMetadata({
    title: a.title,
    description: a.summary || `Announcement published ${formatDate(a.publishedAt)}.`,
    path: `/announcements/${a.slug}`,
  });
}

export default async function AnnouncementPage({ params }: Props) {
  const { slug } = await params;
  const a = await getAnnouncement(slug);
  if (!a) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
      <Link href="/#announcements" className="text-sm text-muted hover:text-brand-cyan">
        ← All announcements
      </Link>
      <time dateTime={a.publishedAt} className="mt-6 block font-mono text-xs text-brand-cyan">
        {formatDate(a.publishedAt)}
      </time>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{a.title}</h1>
      {a.summary && <p className="mt-4 text-lg text-muted">{a.summary}</p>}
      {a.body && (
        <div className="mt-8">
          <RichText value={a.body} />
        </div>
      )}
    </article>
  );
}
