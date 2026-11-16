export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'club-updates', label: 'Club updates' },
  { value: 'events', label: 'Events' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'projects', label: 'Projects' },
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'achievements', label: 'Achievements' },
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number]['value'];

export function isAnnouncementCategory(value: unknown): value is AnnouncementCategory {
  return (
    typeof value === 'string' &&
    ANNOUNCEMENT_CATEGORIES.some((category) => category.value === value)
  );
}

export function announcementCategoryLabel(value: unknown): string | undefined {
  return isAnnouncementCategory(value)
    ? ANNOUNCEMENT_CATEGORIES.find((category) => category.value === value)?.label
    : undefined;
}
