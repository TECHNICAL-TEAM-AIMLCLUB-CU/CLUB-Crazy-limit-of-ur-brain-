# Lightfall

Standalone React background animation. It uses WebGL 2 and has no dependencies beyond React.

## Use in another project

Copy `Lightfall.jsx` and `Lightfall.css` into your project. In Next.js or another server-rendered React app, load it on the client only:

```tsx
'use client';

import dynamic from 'next/dynamic';

const Lightfall = dynamic(() => import('./Lightfall'), { ssr: false });

export function Background() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 600 }}>
      <Lightfall
        colors={['#ffffff', '#84cc16', '#ffffff']}
        backgroundColor="#272534"
        speed={0.5}
        streakCount={2}
        streakWidth={1.2}
        twinkle={1}
        backgroundGlow={0.44}
        headGlow={1}
        bloom={0.5}
        mouseInteraction
        holdToWarp
        intro
        glow={2.75}
        zoom={1.8}
        mouseRadius={0.8}
        lens={0.8}
        fade={0.45}
      />
    </div>
  );
}
```

The parent must have a non-zero height. The component fills its parent and renders a transparent canvas, so it can be layered over a separate background color. It also supports `className` and `style` on the root element. For sites using TypeScript, copy `Lightfall.d.ts` alongside the component to get prop types.

Lightfall needs WebGL 2. For graceful degradation, check `canvas.getContext('webgl2')` before mounting and show a static background when unavailable. Respect `prefers-reduced-motion` by setting `paused` or by using a static fallback.
