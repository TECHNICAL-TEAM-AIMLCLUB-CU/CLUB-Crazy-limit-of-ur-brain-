import AboutExperience from '@/components/site/AboutExperience';
import { getSettings } from '@/lib/queries';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About',
  description: 'Our mission, vision and what the club does.',
  path: '/about',
});

export default async function AboutPage() {
  const settings = await getSettings();

  return <AboutExperience settings={settings} />;
}