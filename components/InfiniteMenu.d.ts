import type * as React from 'react';

export interface InfiniteMenuItem {
  image?: string;
  title?: string;
  description?: string;
  link?: string;
}

export interface InfiniteMenuProps {
  items?: InfiniteMenuItem[];
  count?: number;
  tileSize?: number;
  roundness?: number;
  zoom?: number;
  pullBack?: number;
  stretch?: number;
  inertia?: number;
  autoplay?: number;
  grayscale?: boolean;
  dim?: number;
  intro?: boolean;
  showInfo?: boolean;
  renderInfo?: (item: InfiniteMenuItem, index: number, moving: boolean) => React.ReactNode;
  theme?: 'dark' | 'light';
  accentColor?: string;
  backgroundColor?: React.CSSProperties['backgroundColor'];
  onActiveChange?: (item: InfiniteMenuItem | undefined, index: number) => void;
  onItemClick?: (item: InfiniteMenuItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function InfiniteMenu(props: InfiniteMenuProps): React.JSX.Element;
