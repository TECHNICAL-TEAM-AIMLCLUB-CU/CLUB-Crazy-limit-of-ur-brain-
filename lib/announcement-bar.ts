import { createHash } from 'node:crypto';
import type { Announcement } from './types';
import type { AnnouncementType } from './announcement-metadata';

export const ANNOUNCEMENT_DISMISSAL_COOKIE_PREFIX = 'aiml_announcement_dismissed_';

export type AnnouncementDateValidator = (value: unknown) => value is string;

export type AnnouncementBarSelection = {
  announcement: Announcement;
  fingerprint: string;
  type: AnnouncementType;
  selectedAt: number;
};

type EligibleAnnouncement = AnnouncementBarSelection & { rank: number };

export function getAnnouncementFingerprint(announcement: Announcement): string {
  const material = [
    announcement._id,
    announcement.updatedAt,
    announcement.slug,
    announcement.title,
    announcement.summary,
    announcement.category,
    announcement.announcementType,
    announcement.priority,
    announcement.publishedAt,
    announcement.publicationEndsAt,
    announcement.announcementBarEventEligible,
    announcement.eventDate,
    announcement.deadline,
    announcement.dismissible,
    announcement.ctaLabel,
    announcement.ctaUrl,
  ];
  return createHash('sha256').update(JSON.stringify(material)).digest('hex');
}

export function getAnnouncementDismissalCookieName(announcementId: string): string {
  const identifier = createHash('sha256').update(announcementId).digest('hex').slice(0, 32);
  return `${ANNOUNCEMENT_DISMISSAL_COOKIE_PREFIX}${identifier}`;
}

export function isAnnouncementDismissible(announcement: Announcement): boolean {
  return announcement.announcementType !== 'important' && announcement.dismissible === true;
}

export function selectAnnouncementBar(
  announcements: Announcement[],
  now: number,
  dismissedFingerprints: ReadonlySet<string>,
  isValidDate: AnnouncementDateValidator,
): AnnouncementBarSelection | null {
  const eligible: EligibleAnnouncement[] = [];

  for (const announcement of announcements) {
    const status = announcement.publicationStatus;
    if (status !== undefined && status !== 'published') continue;

    const publishedAt = Date.parse(announcement.publishedAt);
    if (!Number.isFinite(publishedAt) || publishedAt > now) continue;

    if (
      announcement.publicationEndsAt !== undefined &&
      (!isValidDate(announcement.publicationEndsAt) || Date.parse(announcement.publicationEndsAt) <= now)
    ) {
      continue;
    }

    const type: AnnouncementType =
      announcement.announcementType === 'important' ||
      announcement.announcementType === 'deadline' ||
      announcement.announcementType === 'notice'
        ? announcement.announcementType
        : 'notice';

    let rank = 0;
    if (type === 'important') {
      rank = 3;
    } else if (type === 'deadline') {
      if (!announcement.deadline || !isValidDate(announcement.deadline) || Date.parse(announcement.deadline) <= now) {
        continue;
      }
      rank = 2;
    } else if (
      announcement.announcementBarEventEligible === true &&
      announcement.category === 'events' &&
      announcement.eventDate &&
      isValidDate(announcement.eventDate) &&
      Date.parse(announcement.eventDate) > now
    ) {
      rank = 1;
    }

    const fingerprint = getAnnouncementFingerprint(announcement);
    if (isAnnouncementDismissible(announcement) && dismissedFingerprints.has(fingerprint)) continue;

    eligible.push({ announcement, fingerprint, type, selectedAt: now, rank });
  }

  eligible.sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    const aPriority = Number.isSafeInteger(a.announcement.priority) ? a.announcement.priority ?? 0 : 0;
    const bPriority = Number.isSafeInteger(b.announcement.priority) ? b.announcement.priority ?? 0 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;

    const publishedDifference = Date.parse(b.announcement.publishedAt) - Date.parse(a.announcement.publishedAt);
    if (publishedDifference !== 0) return publishedDifference;

    const slugDifference = a.announcement.slug.localeCompare(b.announcement.slug, 'en');
    if (slugDifference !== 0) return slugDifference;
    return a.announcement._id.localeCompare(b.announcement._id, 'en');
  });

  const selected = eligible[0];
  if (!selected) return null;
  const announcement = { ...selected.announcement };
  delete announcement.updatedAt;
  return {
    announcement,
    fingerprint: selected.fingerprint,
    type: selected.type,
    selectedAt: selected.selectedAt,
  };
}
