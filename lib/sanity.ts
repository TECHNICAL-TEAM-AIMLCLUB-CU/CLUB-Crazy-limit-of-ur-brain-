import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { isSanityConfigured, sanityConfig } from './config';
import type { SanityImageRef } from './types';

const client = createClient({
  projectId: sanityConfig.projectId || 'unconfigured',
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: true,
  perspective: 'published', // drafts are never exposed on the public site
});

let warned = false;

/**
 * Fetch from Sanity with ISR caching. When Sanity env vars are missing (fresh clone), returns `empty`
 * so pages render their empty states. Real fetch errors are NOT swallowed: they reach error.tsx.
 */
export async function sanityFetch<T>(query: string, empty: T, params: Record<string, unknown> = {}): Promise<T> {
  if (!isSanityConfigured) {
    if (!warned) {
      console.warn('NEXT_PUBLIC_SANITY_PROJECT_ID is not set; rendering empty states.');
      warned = true;
    }
    return empty;
  }
  const result = await client.fetch<T | null>(query, params, { next: { revalidate: 60 } });
  return result ?? empty;
}

const builder = imageUrlBuilder({ projectId: sanityConfig.projectId, dataset: sanityConfig.dataset });

/** Build an optimized image URL; returns null when there's no asset. */
export function imageUrl(image: SanityImageRef | undefined, width: number, height?: number): string | null {
  if (!image?.asset?._ref) return null;
  let b = builder.image(image as SanityImageSource).width(width).auto('format').quality(80);
  if (height) b = b.height(height).fit('crop');
  return b.url();
}
