import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import SiteBackground from '@/components/site/SiteBackground';
import { DEFAULTS } from '@/lib/defaults';
import { getSettings } from '@/lib/queries';

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
  const settings = await getSettings();
  const name = settings.clubName || DEFAULTS.clubName;

  return (
    <>
      <SiteBackground />
      {/* Everything interactive sits above the fixed, pointer-events:none background (z-index 0). */}
      <div className="relative z-[1] flex min-h-svh flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-cyan focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Navbar clubName={name} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
