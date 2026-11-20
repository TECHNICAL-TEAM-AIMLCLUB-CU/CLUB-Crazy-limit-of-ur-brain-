import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/ui/RichText';
import { announcementCategoryLabel } from '@/lib/announcement-categories';
import { getAnnouncement } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';
import { formatDate, formatDateTime, imageUrl, safeUrl } from '@/lib/utils';

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
  const category = announcementCategoryLabel(a.category);
  const image = imageUrl(a.image);
  const ctaUrl = safeUrl(a.ctaUrl);
  const ctaIsExternal = ctaUrl?.startsWith('http') ?? false;

  return (
    <article className="mx-auto w-full max-w-3xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
      <Link href="/announcements" className="text-sm text-muted hover:text-brand-cyan">
        ← All announcements
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-xs text-muted">
          {category}
        </span>
        <span className="font-mono text-xs text-brand-cyan">
          Published <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{a.title}</h1>
      {a.summary && <p className="mt-4 text-lg text-muted">{a.summary}</p>}
      {(a.eventDate || a.deadline) && (
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {a.eventDate && (
            <div className="flex gap-1.5">
              <dt>Event</dt>
              <dd><time dateTime={a.eventDate}>{formatDateTime(a.eventDate)}</time></dd>
            </div>
          )}
          {a.deadline && (
            <div className="flex gap-1.5">
              <dt>Deadline</dt>
              <dd><time dateTime={a.deadline}>{formatDateTime(a.deadline)}</time></dd>
            </div>
          )}
        </dl>
      )}
      {image && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line-strong/60">
          <Image
            src={image}
            alt={a.image?.alt || ''}
            width={1200}
            height={675}
            sizes="(max-width: 640px) 100vw, 768px"
            className="h-auto max-h-[34rem] w-full object-cover"
            unoptimized
          />
        </div>
      )}
      {a.body && (
        <div className="mt-8">
          <RichText value={a.body} />
        </div>
      )}
      {ctaUrl && a.ctaLabel && (
        <a
          href={ctaUrl}
          target={ctaIsExternal ? '_blank' : undefined}
          rel={ctaIsExternal ? 'noopener noreferrer' : undefined}
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-bg transition hover:brightness-110 motion-reduce:transition-none"
        >
          {a.ctaLabel}
        </a>
      )}
    </article>
  );
}
