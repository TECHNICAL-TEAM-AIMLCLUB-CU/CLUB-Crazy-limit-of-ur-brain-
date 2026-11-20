import type { AnnouncementCategory } from './announcement-categories';
import type { Announcement } from './types';

export function getFeaturedAnnouncements(announcements: Announcement[]): Announcement[] {
  const featured = announcements.filter((item) => item.featured === true);
  return featured.length > 0 ? featured : announcements.slice(0, 1);
}

export function getAvailableAnnouncementCategories(
  announcements: Announcement[],
  categories: readonly AnnouncementCategory[],
  requiredCategories: readonly AnnouncementCategory[],
): AnnouncementCategory[] {
  const knownCategories = new Set(categories);
  const presentCategories = new Set(
    announcements.flatMap((item) =>
      item.category && knownCategories.has(item.category) ? [item.category] : [],
    ),
  );
  const required = new Set(requiredCategories);
  return categories.filter((category) => presentCategories.has(category) || required.has(category));
}

export function filterAnnouncements(
  announcements: Announcement[],
  category: AnnouncementCategory | null,
  query: string,
): Announcement[] {
  const normalizedQuery = query.trim().toLowerCase();
  return announcements.filter((item) => {
    if (category && item.category !== category) return false;
    if (!normalizedQuery) return true;
    return [item.title, item.summary, item.body]
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
  });
}
