export interface SiteImage {
  url?: string;
  alt?: string;
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
  aboutBody?: string;
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
  portrait?: SiteImage;
  socials?: SocialLink[];
}

export interface ClubEvent {
  _id: string;
  title: string;
  date: string;
  endDate?: string;
  location?: string;
  description?: string;
  image?: SiteImage;
  registrationUrl?: string;
  featured?: boolean;
}

export type ProjectStatus = 'available' | 'ongoing' | 'completed';

export interface Project {
  _id: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  image?: SiteImage;
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
  body?: string;
}
