import type { CSSProperties, FC } from 'react';

export interface FlexCarouselItem {
  memberId?: string;
  src: string;
  fallbackSrc?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
}

export interface FlexCarouselProps {
  items?: FlexCarouselItem[];
  preset?: 'liquid' | 'ring' | 'prism' | 'none';
  intro?: 'rise' | 'bloom' | 'spin' | 'deal' | 'fade' | 'none';
  cardHeight?: number;
  gap?: number;
  radius?: number;
  fit?: 'natural' | 'portrait' | 'square' | 'landscape';
  lensWidth?: number;
  lensHeight?: number;
  tilt?: number;
  roundness?: number;
  bend?: number;
  reach?: number;
  curl?: 'rise' | 'fall' | 'none';
  dispersion?: number;
  liquid?: number;
  followCursor?: boolean;
  squeeze?: number;
  focusOnClick?: boolean;
  loop?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  interval?: number;
  captions?: boolean;
  captureWheel?: boolean;
  ariaLabel?: string;
  onChange?: (index: number, item: FlexCarouselItem) => void;
  onSelect?: (index: number, item: FlexCarouselItem) => void;
  className?: string;
  style?: CSSProperties;
}

declare const FlexCarousel: FC<FlexCarouselProps>;
export default FlexCarousel;
