import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';
import { getAnnouncements } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/about', '/team', '/events', '/projects', '/announcements', '/join'];
  const announcements = await getAnnouncements();
  return [
    ...routes.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 })),
    ...announcements.map((a) => ({
      url: `${siteUrl}/announcements/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
