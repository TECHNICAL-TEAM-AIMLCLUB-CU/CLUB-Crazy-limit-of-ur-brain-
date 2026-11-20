export const ANNOUNCEMENT_PUBLICATION_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

export const ANNOUNCEMENT_TYPES = [
  { value: 'notice', label: 'Notice' },
  { value: 'important', label: 'Important' },
  { value: 'deadline', label: 'Deadline' },
] as const;

export type AnnouncementPublicationStatus = (typeof ANNOUNCEMENT_PUBLICATION_STATUSES)[number]['value'];
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number]['value'];

export function isAnnouncementPublicationStatus(value: unknown): value is AnnouncementPublicationStatus {
  return (
    typeof value === 'string' &&
    ANNOUNCEMENT_PUBLICATION_STATUSES.some((status) => status.value === value)
  );
}

export function isAnnouncementType(value: unknown): value is AnnouncementType {
  return typeof value === 'string' && ANNOUNCEMENT_TYPES.some((type) => type.value === value);
}

export function hasCompleteAnnouncementCta(label: string, url: string | null | undefined): boolean {
  return Boolean(label) === Boolean(url);
}

export function parseUtcDateTimeLocal(value: string): string | null {
  if (!value) return '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;

  const date = new Date(`${value}:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 16) !== value) return null;
  return date.toISOString();
}

export function isValidAnnouncementDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/,
  );
  if (!match) return false;
  const [, year, month, day, hour, minute, second = '0'] = match;
  const calendarDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return (
    !Number.isNaN(calendarDate.getTime()) &&
    calendarDate.toISOString().slice(0, 10) === `${year}-${month}-${day}` &&
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59 &&
    !Number.isNaN(new Date(value).getTime())
  );
}

export function getUpcomingAnnouncements<T extends { eventDate?: string }>(
  announcements: T[],
  now = Date.now(),
): (T & { eventDate: string })[] {
  return announcements
    .filter(
      (announcement): announcement is T & { eventDate: string } =>
        isValidAnnouncementDate(announcement.eventDate) && Date.parse(announcement.eventDate) > now,
    )
    .sort((a, b) => Date.parse(a.eventDate) - Date.parse(b.eventDate));
}

export function getAnnouncementDeadlineStatus(deadline: string, now: number): string | null {
  if (!isValidAnnouncementDate(deadline)) return null;
  const deadlineTime = Date.parse(deadline);
  if (deadlineTime <= now) return 'Closed';

  const current = new Date(now);
  const target = new Date(deadlineTime);
  const currentDay = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  const targetDay = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const daysRemaining = Math.round((targetDay - currentDay) / 86_400_000);
  if (daysRemaining <= 0) return 'Closes today';
  if (daysRemaining === 1) return '1 day left';
  return `${daysRemaining} days left`;
}
