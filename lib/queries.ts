import { getSql } from './db';
import { isAnnouncementCategory } from './announcement-categories';
import type { Announcement, ClubEvent, Project, SiteSettings, TeamMember } from './types';

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
    WHERE collection = 'announcements' AND (data->>'publishedAt')::timestamptz <= now()
    ORDER BY (data->>'publishedAt')::timestamptz DESC
    LIMIT ${limit}
  `;
  return mapAnnouncementRows(rows);
}

export async function getSignalRoomAnnouncements(): Promise<Announcement[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'announcements' AND (data->>'publishedAt')::timestamptz <= now()
    ORDER BY (data->>'publishedAt')::timestamptz DESC
  `;
  return mapAnnouncementRows(rows);
}

export async function getAnnouncement(slug: string): Promise<Announcement | null> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = 'announcements'
      AND data->>'slug' = ${slug}
      AND (data->>'publishedAt')::timestamptz <= now()
    LIMIT 1
  `;
  const row = rows[0];
  return row ? ({ ...(row.data as object), _id: String(row.id) } as Announcement) : null;
}

function mapAnnouncementRows(rows: Record<string, unknown>[]): Announcement[] {
  return rows.map((row) => {
    const data = row.data as Record<string, unknown>;
    return {
      ...data,
      _id: String(row.id),
      category: isAnnouncementCategory(data.category) ? data.category : undefined,
      featured: data.featured === true,
    } as Announcement;
  });
}
