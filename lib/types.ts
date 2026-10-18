export interface SanityImageRef {
  asset?: { _ref: string; _type?: string };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  clubName?: string;
  tagline?: string;
  heroHeadline?: string;
  heroSubtext?: string;
  academicYear?: string;
  mission?: string;
  vision?: string;
  activities?: { title: string; description?: string }[];
  aboutBody?: unknown[];
  joinText?: string;
  contactEmail?: string;
  socials?: SocialLink[];
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  order?: number;
  portrait?: SanityImageRef;
  socials?: SocialLink[];
}

export interface ClubEvent {
  _id: string;
  title: string;
  date: string;
  endDate?: string;
  location?: string;
  description?: string;
  image?: SanityImageRef;
  registrationUrl?: string;
  featured?: boolean;
}

export type ProjectStatus = 'available' | 'ongoing' | 'completed';

export interface Project {
  _id: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  image?: SanityImageRef;
  tags?: string[];
  contributors?: string[];
  repoUrl?: string;
  demoUrl?: string;
  featured?: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  summary?: string;
  body?: unknown[];
}
