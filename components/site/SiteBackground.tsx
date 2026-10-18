'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';

// WebGL is client-only: load three.js lazily so it never blocks first paint or SSR.
const Hyperspeed = dynamic(() => import('../Hyperspeed/Hyperspeed'), { ssr: false });

// Your chosen settings (desktop).
const DESKTOP = {
  curve: 'racing',
  curvature: 1,
  speed: 0.5,
  boost: 7,
  fov: 90,
  boostFov: 130,
  lanes: 3,
  roadWidth: 10,
  medianWidth: 2,
  density: 40,
  trailLength: 1,
  lightSize: 1,
  poles: 20,
  dust: 100,
  glow: 0.6,
  reflections: 0.5,
  roadOpacity: 0.1,
  steer: 0.35,
} as const;

// Lighter variant for phones / low-powered devices.
const LIGHT = {
  ...DESKTOP,
  speed: 0.4,
  density: 18,
  poles: 8,
  dust: 30,
  glow: 0.25,
  reflections: 0.25,
} as const;

const TAIL = ['#d856bf', '#6750a2', '#c247ac'];
const HEAD = ['#03b3c3', '#8da0b0', '#324555'];
const POLES = ['#84cc16'];

type Mode = 'pending' | 'webgl' | 'static';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// Hyperspeed creates its renderer inside an effect; if that throws, fall back instead of
// taking the whole page down. The error is still logged, not swallowed.
class BackgroundBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('Hyperspeed background failed, using static fallback:', error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SiteBackground() {
  const [mode, setMode] = useState<Mode>('pending');
  const [light, setLight] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 768px)');
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;

    const update = () => {
      setLight(small.matches || weak);
      setMode(!reduced.matches && hasWebGL() ? 'webgl' : 'static');
    };
    update();
    reduced.addEventListener('change', update);
    small.addEventListener('change', update);
    return () => {
      reduced.removeEventListener('change', update);
      small.removeEventListener('change', update);
    };
  }, []);

  const config = light ? LIGHT : DESKTOP;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none', // decorative only: never intercepts clicks, menus, forms or scroll
        overflow: 'hidden',
        background: '#05060a',
      }}
    >
      {/* Static layer: shown while WebGL loads, and as the permanent fallback. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 50% at 20% 15%, rgba(3,179,195,0.16), transparent 70%),' +
            'radial-gradient(55% 45% at 85% 25%, rgba(103,80,162,0.20), transparent 70%),' +
            'radial-gradient(70% 50% at 50% 100%, rgba(14,94,165,0.18), transparent 70%)',
        }}
      />
      {mode === 'webgl' && (
        <BackgroundBoundary onError={() => setMode('static')}>
          <Hyperspeed
            {...config}
            tailColors={TAIL}
            headColors={HEAD}
            poleColors={POLES}
            // The layer is pointer-events:none, so hold-to-boost and pointer steering
            // cannot receive events here; turning them off keeps the config honest.
            interactive={false}
          />
        </BackgroundBoundary>
      )}
      {/* Readability scrim so foreground text stays legible over bright trails. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,6,10,0.55), rgba(5,6,10,0.35) 40%, rgba(5,6,10,0.7))',
        }}
      />
    </div>
  );
}
