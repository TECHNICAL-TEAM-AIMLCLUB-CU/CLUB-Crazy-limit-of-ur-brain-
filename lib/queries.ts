import { getSql } from './db';
import { isAnnouncementCategory } from './announcement-categories';
import { isAnnouncementPublicationStatus, isValidAnnouncementDate } from './announcement-metadata';
import { safeUrl } from './utils';
import type { Announcement, ClubEvent, Project, SiteImage, SiteSettings, TeamMember } from './types';

export async function getSettings(): Promise<SiteSettings> {
  const rows = await getSql()`SELECT data FROM cms_documents WHERE collection = 'settings' AND id = 'main'`;
  return (rows[0]?.data as SiteSettings | undefined) ?? {};
}

export async function getTeam(): Promise<TeamMember[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'team'
    ORDER BY CASE WHEN jsonb_typeof(data->'order') = 'number' THEN (data->>'order')::numeric ELSE 9999 END, data->>'name'
  `;
  return rows.map((row) => ({ ...(row.data as object), _id: String(row.id) }) as TeamMember);
}

export async function getEvents(): Promise<ClubEvent[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'events' AND data ? 'date'
    ORDER BY data->>'date' DESC
  `;
  return rows.map((row) => ({ ...(row.data as object), _id: String(row.id) }) as ClubEvent);
}

export async function getProjects(): Promise<Project[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'projects'
    ORDER BY CASE WHEN jsonb_typeof(data->'order') = 'number' THEN (data->>'order')::numeric ELSE 9999 END, data->>'title'
  `;
  return rows.map((row) => ({ ...(row.data as object), _id: String(row.id) }) as Project);
}

export async function getAnnouncements(limit = 100): Promise<Announcement[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'announcements'
      AND COALESCE(data->>'publicationStatus', 'published') = 'published'
      AND (data->>'publishedAt')::timestamptz <= now()
    ORDER BY (data->>'publishedAt')::timestamptz DESC
    LIMIT ${limit}
  `;
  return mapAnnouncementRows(rows);
}

export async function getAnnouncement(slug: string): Promise<Announcement | null> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'announcements'
      AND data->>'slug' = ${slug}
      AND COALESCE(data->>'publicationStatus', 'published') = 'published'
      AND (data->>'publishedAt')::timestamptz <= now()
    LIMIT 1
  `;
  return rows.length ? mapAnnouncementRows(rows)[0] : null;
}

function mapAnnouncementRows(rows: Record<string, unknown>[]): Announcement[] {
  return rows.map((row) => {
    const data = row.data as Record<string, unknown>;
    const ctaUrl = typeof data.ctaUrl === 'string' ? safeUrl(data.ctaUrl) : null;
    const imageData = data.image && typeof data.image === 'object' && !Array.isArray(data.image)
      ? data.image as Record<string, unknown>
      : undefined;
    const image: SiteImage | undefined = imageData
      ? {
          url: typeof imageData.url === 'string' ? imageData.url : undefined,
          alt: typeof imageData.alt === 'string' ? imageData.alt : undefined,
        }
      : undefined;
    return {
      ...data,
      _id: String(row.id),
      category: isAnnouncementCategory(data.category) ? data.category : undefined,
      featured: data.featured === true,
      publicationStatus: isAnnouncementPublicationStatus(data.publicationStatus)
        ? data.publicationStatus
        : 'published',
      image,
      eventDate: isValidAnnouncementDate(data.eventDate) ? data.eventDate : undefined,
      deadline: isValidAnnouncementDate(data.deadline) ? data.deadline : undefined,
      ctaLabel: typeof data.ctaLabel === 'string' ? data.ctaLabel : undefined,
      ctaUrl: ctaUrl ?? undefined,
    } as Announcement;
  });
}
