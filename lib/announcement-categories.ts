export const ANNOUNCEMENT_CATEGORIES = [
  { value: 'events', label: 'Events' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'notices', label: 'Notices' },
  { value: 'club-updates', label: 'Club updates' },
  { value: 'projects', label: 'Projects' },
  { value: 'achievements', label: 'Achievements' },
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number]['value'];
export const REQUIRED_ANNOUNCEMENT_FILTERS = ['events', 'workshops', 'opportunities', 'notices'] as const;

export function isAnnouncementCategory(value: unknown): value is AnnouncementCategory {
  return (
    typeof value === 'string' &&
    ANNOUNCEMENT_CATEGORIES.some((category) => category.value === value)
  );
}

export function announcementCategoryLabel(value: unknown): string {
  return isAnnouncementCategory(value)
    ? ANNOUNCEMENT_CATEGORIES.find((category) => category.value === value)?.label ?? 'Club Update'
    : 'Club Update';
}
