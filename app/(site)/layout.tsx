import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AnnouncementBar from '@/components/site/AnnouncementBar';
import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import SiteBackground from '@/components/site/SiteBackground';
import {
  ANNOUNCEMENT_DISMISSAL_COOKIE_PREFIX,
  selectAnnouncementBar,
} from '@/lib/announcement-bar';
import { DEFAULTS } from '@/lib/defaults';
import { isValidAnnouncementDate } from '@/lib/announcement-metadata';
import { getAnnouncements, getSettings } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.clubName || DEFAULTS.clubName;
  return {
    title: { default: name, template: `%s | ${name}` },
    description: s.tagline || DEFAULTS.tagline,
    openGraph: { siteName: name },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcements] = await Promise.all([
    getSettings(),
    getAnnouncements(null, true),
  ]);
  const cookieStore = await cookies();
  const dismissedFingerprints = new Set(
    cookieStore
      .getAll()
      .flatMap((cookie) =>
        cookie.name.startsWith(ANNOUNCEMENT_DISMISSAL_COOKIE_PREFIX) &&
        /^[a-f0-9]{64}$/.test(cookie.value)
          ? [cookie.value]
          : [],
      ),
  );
  const announcementSelection = selectAnnouncementBar(
    announcements,
    Date.now(),
    dismissedFingerprints,
    isValidAnnouncementDate,
  );
  const name = settings.clubName || DEFAULTS.clubName;

  return (
    <>
      <SiteBackground />
      {/* Everything interactive sits above the fixed, pointer-events:none background (z-index 0). */}
      <div
        className="site-shell relative z-[1] flex min-h-svh flex-col"
        data-announcement-active={announcementSelection ? 'true' : undefined}
      >
        <AnnouncementBar selection={announcementSelection} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-cyan focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Navbar clubName={name} />
        <main
          id="content"
          className="flex-1"
          style={{ paddingTop: 'var(--announcement-bar-main-offset)' }}
        >
          {children}
        </main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
