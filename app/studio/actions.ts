'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  adminSessionSeconds,
  ADMIN_SESSION_COOKIE,
  checkAdminCredentials,
  createAdminSession,
  requireAdmin,
} from '@/lib/admin-auth';
import { deleteCmsDocument, isCmsCollection, saveCmsDocument, type CmsCollection } from '@/lib/cms-admin';
import type { ProjectStatus, SiteImage } from '@/lib/types';
import { imageUrl, safeUrl } from '@/lib/utils';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS: ProjectStatus[] = ['ongoing', 'available', 'completed'];

function field(formData: FormData, name: string, maxLength = 10_000): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function rawPassword(formData: FormData): string {
  const value = formData.get('password');
  return typeof value === 'string' ? value : '';
}

function redirectError(collection: CmsCollection | null, error: string): never {
  const query = new URLSearchParams();
  if (collection) query.set('collection', collection);
  query.set('error', error);
  redirect(`/studio?${query.toString()}`);
}

function parseJsonArray(formData: FormData, name: string): Record<string, unknown>[] | null {
  const value = field(formData, name, 50_000);
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object' && !Array.isArray(item))
      ? (parsed as Record<string, unknown>[])
      : null;
  } catch {
    return null;
  }
}

function stringsFromList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))].slice(0, 100);
}

function dateField(formData: FormData, name: string): string | null {
  const value = field(formData, name, 100);
  if (!value) return '';
  const date = new Date(`${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function imageField(formData: FormData, prefix: string): SiteImage | null | undefined {
  const url = field(formData, `${prefix}Url`, 2000);
  const alt = field(formData, `${prefix}Alt`, 500);
  if (!url && !alt) return undefined;
  const image: SiteImage = { url, alt };
  if (url && !imageUrl(image)) return null;
  return image;
}

function urlField(formData: FormData, name: string): string | undefined | null {
  const value = field(formData, name, 2000);
  if (!value) return undefined;
  const url = safeUrl(value);
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
}

function socialLinks(formData: FormData, name: string): Record<string, unknown>[] | null {
  const links = parseJsonArray(formData, name);
  if (!links) return null;
  return links.every(
    (link) =>
      typeof link.platform === 'string' &&
      typeof link.url === 'string' &&
      Boolean(safeUrl(link.url)),
  )
    ? links
    : null;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = field(formData, 'email', 320);
  const password = rawPassword(formData);
  if (!checkAdminCredentials(email, password)) redirect('/studio?error=login');

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSession(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/studio',
    maxAge: adminSessionSeconds,
  });
  redirect('/studio');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/studio',
    maxAge: 0,
  });
  redirect('/studio');
}

export async function saveDocumentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const collectionValue = formData.get('collection');
  if (!isCmsCollection(collectionValue)) redirectError(null, 'invalid-collection');
  const collection = collectionValue;
  const id = field(formData, 'id', 200);
  const data: Record<string, unknown> = {};

  if (collection === 'settings') {
    const activities = parseJsonArray(formData, 'activities');
    const socials = socialLinks(formData, 'socials');
    const contactEmail = field(formData, 'contactEmail', 320);
    if (!activities || !activities.every((item) => typeof item.title === 'string')) redirectError(collection, 'invalid-arrays');
    if (!socials) redirectError(collection, 'invalid-arrays');
    Object.assign(data, {
      clubName: field(formData, 'clubName', 200),
      tagline: field(formData, 'tagline', 1000),
      heroHeadline: field(formData, 'heroHeadline', 500),
      heroSubtext: field(formData, 'heroSubtext', 3000),
      academicYear: field(formData, 'academicYear', 100),
      mission: field(formData, 'mission', 3000),
      vision: field(formData, 'vision', 3000),
      activities,
      aboutBody: field(formData, 'aboutBody', 20_000),
      joinText: field(formData, 'joinText', 3000),
      contactEmail,
      socials,
    });
    if (contactEmail && !EMAIL.test(contactEmail)) redirectError(collection, 'invalid-email');
  } else if (collection === 'team') {
    const name = field(formData, 'name', 200);
    const role = field(formData, 'role', 200);
    const portrait = imageField(formData, 'portrait');
    const socials = socialLinks(formData, 'socials');
    const order = field(formData, 'order', 20);
    if (!name || !role) redirectError(collection, 'required');
    if (portrait === null || !socials) redirectError(collection, 'invalid-fields');
    if (order && !Number.isFinite(Number(order))) redirectError(collection, 'invalid-fields');
    Object.assign(data, {
      name,
      role,
      department: field(formData, 'department', 200),
      bio: field(formData, 'bio', 5000),
      order: order ? Number(order) : undefined,
      portrait,
      socials,
    });
  } else if (collection === 'events') {
    const title = field(formData, 'title', 300);
    const date = dateField(formData, 'date');
    const endDate = dateField(formData, 'endDate');
    const image = imageField(formData, 'image');
    const registrationUrl = urlField(formData, 'registrationUrl');
    if (!title || date === '') redirectError(collection, 'required');
    if (date === null || endDate === null || image === null || registrationUrl === null) {
      redirectError(collection, 'invalid-fields');
    }
    Object.assign(data, {
      title,
      date,
      endDate: endDate || undefined,
      location: field(formData, 'location', 500),
      description: field(formData, 'description', 5000),
      registrationUrl,
      image,
    });
  } else if (collection === 'projects') {
    const title = field(formData, 'title', 300);
    const summary = field(formData, 'summary', 5000);
    const status = field(formData, 'status', 30);
    const image = imageField(formData, 'image');
    const repoUrl = urlField(formData, 'repoUrl');
    const demoUrl = urlField(formData, 'demoUrl');
    const order = field(formData, 'order', 20);
    if (!title || !summary) redirectError(collection, 'required');
    if (!STATUS.some((option) => option === status)) redirectError(collection, 'invalid-fields');
    if (image === null || repoUrl === null || demoUrl === null) redirectError(collection, 'invalid-fields');
    if (order && !Number.isFinite(Number(order))) redirectError(collection, 'invalid-fields');
    Object.assign(data, {
      title,
      summary,
      status,
      tags: stringsFromList(field(formData, 'tags', 3000)),
      contributors: stringsFromList(field(formData, 'contributors', 3000)),
      repoUrl,
      demoUrl,
      featured: formData.get('featured') === 'on',
      order: order ? Number(order) : undefined,
      image,
    });
  } else {
    const title = field(formData, 'title', 300);
    const slug = field(formData, 'slug', 200).toLowerCase();
    const publishedAt = dateField(formData, 'publishedAt');
    if (!title || publishedAt === '') redirectError(collection, 'required');
    if (publishedAt === null || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) redirectError(collection, 'invalid-fields');
    Object.assign(data, {
      title,
      slug,
      publishedAt,
      summary: field(formData, 'summary', 2000),
      body: field(formData, 'body', 20_000),
    });
  }

  try {
    await saveCmsDocument(collection, id, data);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      redirectError(collection, 'duplicate-slug');
    }
    throw error;
  }
  revalidatePath('/', 'layout');
  revalidatePath('/announcements/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  redirect(`/studio?collection=${collection}&saved=1`);
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const collectionValue = formData.get('collection');
  const id = field(formData, 'id', 200);
  if (!isCmsCollection(collectionValue) || collectionValue === 'settings' || !id) redirectError(null, 'invalid-collection');
  await deleteCmsDocument(collectionValue, id);
  revalidatePath('/', 'layout');
  revalidatePath('/announcements/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  redirect(`/studio?collection=${collectionValue}&saved=1`);
}
