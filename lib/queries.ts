import { sanityFetch } from './sanity';
import type { Announcement, ClubEvent, Project, SiteSettings, TeamMember } from './types';

const IMG = '{ asset, alt, hotspot, crop }';

const SETTINGS = `*[_type == "siteSettings"][0]{
  clubName, tagline, heroHeadline, heroSubtext, academicYear, mission, vision,
  activities[]{ title, description }, aboutBody, joinText, contactEmail,
  socials[]{ platform, url }
}`;

const TEAM = `*[_type == "teamMember"] | order(coalesce(order, 9999) asc, name asc){
  _id, name, role, department, bio, order, portrait${IMG}, socials[]{ platform, url }
}`;

const EVENT_FIELDS = `_id, title, date, endDate, location, description, registrationUrl, featured, image${IMG}`;
const PROJECT_FIELDS = `_id, title, summary, status, tags, contributors, repoUrl, demoUrl, featured, image${IMG}`;
const ANNOUNCEMENT_FIELDS = `_id, title, "slug": slug.current, publishedAt, summary`;

export const getSettings = () => sanityFetch<SiteSettings>(SETTINGS, {});
export const getTeam = () => sanityFetch<TeamMember[]>(TEAM, []);

export const getEvents = () =>
  sanityFetch<ClubEvent[]>(`*[_type == "event" && defined(date)] | order(date desc){ ${EVENT_FIELDS} }`, []);

export const getUpcomingEvents = (limit: number) =>
  sanityFetch<ClubEvent[]>(
    `*[_type == "event" && defined(date) && coalesce(endDate, date) >= now()] | order(date asc)[0...$limit]{ ${EVENT_FIELDS} }`,
    [],
    { limit },
  );

export const getProjects = () =>
  sanityFetch<Project[]>(`*[_type == "project"] | order(coalesce(order, 9999) asc, title asc){ ${PROJECT_FIELDS} }`, []);

export const getFeaturedProjects = (limit: number) =>
  sanityFetch<Project[]>(
    `*[_type == "project" && featured == true] | order(coalesce(order, 9999) asc)[0...$limit]{ ${PROJECT_FIELDS} }`,
    [],
    { limit },
  );

export const getAnnouncements = (limit = 100) =>
  sanityFetch<Announcement[]>(
    `*[_type == "announcement" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc)[0...$limit]{ ${ANNOUNCEMENT_FIELDS} }`,
    [],
    { limit },
  );

export const getAnnouncement = (slug: string) =>
  sanityFetch<Announcement | null>(
    `*[_type == "announcement" && slug.current == $slug && publishedAt <= now()][0]{ ${ANNOUNCEMENT_FIELDS}, body }`,
    null,
    { slug },
  );
