import type { CSSProperties, FC } from 'react';

export type HyperspeedCurve = 'straight' | 'gentle' | 'winding' | 'hills' | 'racing' | 'deep';

export interface HyperspeedProps {
  tailColors?: string[];
  headColors?: string[];
  poleColors?: string[];
  curve?: HyperspeedCurve;
  curvature?: number;
  speed?: number;
  boost?: number;
  fov?: number;
  boostFov?: number;
  lanes?: number;
  roadWidth?: number;
  medianWidth?: number;
  density?: number;
  trailLength?: number;
  lightSize?: number;
  poles?: number;
  poleHeight?: number;
  dust?: number;
  glow?: number;
  reflections?: number;
  roadOpacity?: number;
  steer?: number;
  roadColor?: string;
  lineColor?: string;
  background?: string;
  theme?: 'dark' | 'light';
  interactive?: boolean;
  boosting?: boolean;
  onBoostStart?: () => void;
  onBoostEnd?: () => void;
  className?: string;
  style?: CSSProperties;
}

declare const Hyperspeed: FC<HyperspeedProps>;
export default Hyperspeed;
