'use client';

import { useEffect, useRef } from 'react';
import ButtonLink from '@/components/ui/ButtonLink';

// Deterministic "neural network" accent: 3 columns of nodes, fully connected between neighbours.
const COLS = [
  [120, 150, 300, 450, 520].map((y) => ({ x: 120, y })),
  [260, 220, 330, 440].map((y, i) => ({ x: 340 + (i % 2) * 20, y })),
  [180, 300, 420].map((y) => ({ x: 580, y })),
];

function NeuralAccent() {
  const lines: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
  for (let c = 0; c < COLS.length - 1; c++) for (const a of COLS[c]) for (const b of COLS[c + 1]) lines.push({ a, b });
  return (
    <svg viewBox="0 0 700 640" className="h-full w-full" fill="none" aria-hidden="true">
      {lines.map((l, i) => (
        <line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke="rgba(154,164,184,0.22)" strokeWidth="1" />
      ))}
      {COLS.flat().map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 7 : 5} fill={['#22d3ee', '#3b82f6', '#8b5cf6'][i % 3]} opacity="0.85" />
      ))}
    </svg>
  );
}

export default function Hero({ clubName, headline, subtext }: { clubName: string; headline: string; subtext: string }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(min-width: 1024px) and (pointer: fine)');

    let raf = 0;
    let visible = true;
    let sy = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      if (!visible) return;
      const motion = !reduce.matches;
      // Scroll parallax: full on capable desktops, strongly reduced on touch/mobile, off for reduced motion.
      const scrollFactor = !motion ? 0 : fine.matches ? 1 : 0.2;
      const pointerFactor = motion && fine.matches ? 1 : 0;
      for (const el of layers) {
        const d = Number(el.dataset.depth ?? 0);
        const x = px * d * 24 * pointerFactor;
        const y = sy * d * 0.3 * scrollFactor + py * d * 16 * pointerFactor;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      sy = window.scrollY;
      schedule();
    };
    const onPointer = (e: PointerEvent) => {
      if (!fine.matches) return;
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      schedule();
    };

    // Stop doing work once the hero has scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(root);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    reduce.addEventListener('change', schedule);
    fine.addEventListener('change', schedule);
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      reduce.removeEventListener('change', schedule);
      fine.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <section ref={rootRef} aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      {/* Decorative depth layers (aria-hidden, pointer-events none). Each moves at its own small rate. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div data-depth="0.25" className="absolute -right-24 top-10 will-change-transform">
          <div className="h-[34rem] w-[34rem] rounded-full border border-brand-violet/20 shadow-[0_0_120px_-30px_rgba(139,92,246,0.5)]" />
        </div>
        <div data-depth="0.6" className="absolute right-[2%] top-24 hidden h-[30rem] w-[34rem] will-change-transform md:block">
          <NeuralAccent />
        </div>
        <div data-depth="0.9" className="absolute bottom-24 left-[8%] hidden will-change-transform lg:block">
          <div className="h-24 w-24 rounded-full bg-brand-cyan/10 blur-2xl" />
        </div>
      </div>

      <div data-depth="0.08" className="mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-center px-5 pb-24 pt-32 will-change-transform sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-cyan">{clubName}</p>
        <h1 id="hero-heading" className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="gradient-text">{headline}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-fg/80">{subtext}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/#projects">Explore Our Work</ButtonLink>
          <ButtonLink href="/#join" variant="secondary">
            Join the Club
          </ButtonLink>
        </div>
      </div>

      {/* Clean transition into the content below */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </section>
  );
}
