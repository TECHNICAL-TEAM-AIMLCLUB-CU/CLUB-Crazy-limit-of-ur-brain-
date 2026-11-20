'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  getAnnouncementDismissalCookieName,
  getAnnouncementFingerprint,
  isAnnouncementDismissible,
} from '@/lib/announcement-bar';
import { getAnnouncements } from '@/lib/queries';

export async function dismissAnnouncementBarAction(formData: FormData): Promise<void> {
  const announcementId = formData.get('announcementId');
  const fingerprint = formData.get('fingerprint');
  if (
    typeof announcementId !== 'string' ||
    !announcementId ||
    typeof fingerprint !== 'string' ||
    !/^[a-f0-9]{64}$/.test(fingerprint)
  ) {
    throw new Error('Invalid announcement dismissal request.');
  }

  const announcements = await getAnnouncements(null, true);
  const announcement = announcements.find(
    (item) => item._id === announcementId && getAnnouncementFingerprint(item) === fingerprint,
  );
  if (!announcement || !isAnnouncementDismissible(announcement)) {
    revalidatePath('/', 'layout');
    return;
  }

  const cookieStore = await cookies();
  const cookieName = getAnnouncementDismissalCookieName(announcementId);
  if (cookieStore.get(cookieName)?.value !== fingerprint) {
    cookieStore.set(cookieName, fingerprint, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  revalidatePath('/', 'layout');
}
