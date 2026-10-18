import Image from 'next/image';
import { imageUrl } from '@/lib/utils';
import type { SiteImage } from '@/lib/types';

/** Server component: renders an image at a fixed aspect ratio, or a gradient placeholder. */
export default function SafeImage({
  image,
  width,
  height,
  alt,
  sizes,
  className = '',
}: {
  image?: SiteImage;
  width: number;
  height: number;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const src = imageUrl(image);
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      {src ? (
        <Image src={src} alt={image?.alt || alt} fill sizes={sizes} className="object-cover" unoptimized />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.28),transparent_60%)]"
        />
      )}
    </div>
  );
}
