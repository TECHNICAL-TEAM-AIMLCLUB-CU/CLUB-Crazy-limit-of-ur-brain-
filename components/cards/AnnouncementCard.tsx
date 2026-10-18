import Link from 'next/link';
import type { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <article className="rounded-2xl border border-line bg-surface/90 p-5 transition duration-200 hover:border-line-strong motion-reduce:transition-none">
      <time dateTime={item.publishedAt} className="font-mono text-xs text-brand-cyan">
        {formatDate(item.publishedAt)}
      </time>
      <h3 className="mt-2 font-display text-xl font-semibold">
        <Link href={`/announcements/${item.slug}`} className="hover:text-brand-cyan">
          {item.title}
        </Link>
      </h3>
      {item.summary && <p className="mt-2 text-sm text-muted">{item.summary}</p>}
    </article>
  );
}
