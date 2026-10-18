export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const NAV_LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#team', label: 'Team' },
  { href: '/#events', label: 'Events' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#announcements', label: 'Announcements' },
] as const;
