'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Lightfall = dynamic(() => import('../Lightfall/Lightfall'), { ssr: false });

type Mode = 'pending' | 'webgl' | 'static';

function hasWebGL2(): boolean {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
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
      setMode(!reduced.matches && hasWebGL2() ? 'webgl' : 'static');
    };
    update();
    reduced.addEventListener('change', update);
    small.addEventListener('change', update);
    return () => {
      reduced.removeEventListener('change', update);
      small.removeEventListener('change', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#05060a',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(65% 58% at 50% -5%, rgba(132,204,22,0.12), transparent 72%),' +
            'radial-gradient(50% 44% at 12% 28%, rgba(132,204,22,0.08), transparent 72%),' +
            'radial-gradient(58% 52% at 88% 48%, rgba(132,204,22,0.07), transparent 72%)',
        }}
      />
      {mode === 'webgl' && (
        <Lightfall
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          colors={['#ffffff', '#84cc16', '#ffffff']}
          backgroundColor="#272534"
          speed={light ? 0.35 : 0.5}
          streakCount={2}
          streakWidth={1.2}
          twinkle={1}
          backgroundGlow={0.44}
          headGlow={1}
          bloom={light ? 0.3 : 0.5}
          mouseInteraction
          holdToWarp
          intro
          glow={2.75}
          zoom={1.8}
          mouseRadius={0.8}
          lens={0.8}
          fade={0.45}
          dpr={light ? 1 : undefined}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,6,10,0.45), rgba(5,6,10,0.35) 40%, rgba(5,6,10,0.68))',
        }}
      />
    </div>
  );
}
