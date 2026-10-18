'use client';

/**
 * Interactive portrait grid for the Team page.
 *
 * NOTE: this is the in-repo fallback for the React Bits Pro "Expanding Grid". The Pro component needs a
 * license key and registry install that could not be done when this project was generated. To swap it in,
 * install it per the React Bits Pro docs and replace the usage in app/(site)/team/page.tsx; the `members`
 * data shape below is all the page passes in.
 *
 * Behaviour: on desktop (lg+) members sit in rows of panels; hovering, focusing or clicking one expands it
 * and reveals details. On touch/small screens it is a tile grid where tapping a tile opens its details.
 * Nothing is hover-only; Escape closes; motion respects prefers-reduced-motion.
 */

import Image from 'next/image';
import { useState } from 'react';

export interface GridMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  portraitUrl: string | null;
  portraitAlt: string;
  socials: { platform: string; href: string }[];
}

const ROW_SIZE = 5;

function Portrait({ m, sizes }: { m: GridMember; sizes: string }) {
  if (m.portraitUrl) {
    return <Image src={m.portraitUrl} alt={m.portraitAlt} fill sizes={sizes} className="object-cover" />;
  }
  const initials = m.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div
      role="img"
      aria-label={m.portraitAlt}
      className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.3),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(139,92,246,0.35),transparent_60%)] font-display text-5xl text-fg/80"
    >
      {initials}
    </div>
  );
}

function Details({ m }: { m: GridMember }) {
  return (
    <>
      <p className="font-display text-xl font-semibold">{m.name}</p>
      <p className="text-sm text-brand-cyan">
        {m.role}
        {m.department ? ` · ${m.department}` : ''}
      </p>
      {m.bio && <p className="mt-3 text-sm text-fg/80">{m.bio}</p>}
      {m.socials.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {m.socials.map((s) => (
            <li key={s.platform + s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">
                {s.platform}
                <span className="sr-only"> ({m.name})</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ExpandingTeamGrid({ members }: { members: GridMember[] }) {
  const [active, setActive] = useState<string | null>(null);

  const rows: GridMember[][] = [];
  for (let i = 0; i < members.length; i += ROW_SIZE) rows.push(members.slice(i, i + ROW_SIZE));

  return (
    <div onKeyDown={(e) => e.key === 'Escape' && setActive(null)}>
      {/* Desktop: expanding panels */}
      <div className="hidden space-y-3 lg:block" onMouseLeave={() => setActive(null)}>
        {rows.map((row, r) => (
          <div key={r} className={`flex h-[30rem] gap-3 ${row.length < 4 ? 'mx-auto max-w-3xl' : ''}`}>
            {row.map((m) => {
              const isActive = active === m.id;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setActive(m.id)}
                  onFocus={() => setActive(m.id)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive((a) => (a === m.id ? null : a));
                  }}
                  style={{ flexGrow: isActive ? 4 : 1 }}
                  className="relative min-w-0 basis-0 overflow-hidden rounded-2xl border border-line bg-surface transition-[flex-grow] duration-500 ease-out motion-reduce:transition-none"
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={`details-${m.id}`}
                    onClick={() => setActive(m.id)}
                    className="absolute inset-0 block w-full text-left"
                  >
                    <Portrait m={m} sizes="(min-width: 1024px) 40vw, 100vw" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent p-4 pt-16">
                      <span className="block truncate font-display text-base font-semibold">{m.name}</span>
                      <span className="block truncate text-xs text-brand-cyan">{m.role}</span>
                    </span>
                  </button>
                  <div
                    id={`details-${m.id}`}
                    inert={!isActive}
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/95 to-bg/0 p-5 pt-24 transition-opacity duration-300 motion-reduce:transition-none ${
                      isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <Details m={m} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Touch / small screens: tap a tile to open it */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
        {members.map((m) => {
          const isActive = active === m.id;
          return (
            <li key={m.id} className={isActive ? 'col-span-full' : ''}>
              <div className={`overflow-hidden rounded-2xl border border-line bg-surface ${isActive ? 'sm:flex' : ''}`}>
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`m-details-${m.id}`}
                  onClick={() => setActive(isActive ? null : m.id)}
                  className={`relative block aspect-[3/4] w-full text-left ${isActive ? 'sm:w-2/5 sm:shrink-0' : ''}`}
                >
                  <Portrait m={m} sizes="(min-width: 640px) 33vw, 50vw" />
                  {!isActive && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/95 to-transparent p-3 pt-12">
                      <span className="block truncate font-display text-sm font-semibold">{m.name}</span>
                      <span className="block truncate text-xs text-brand-cyan">{m.role}</span>
                    </span>
                  )}
                </button>
                {isActive && (
                  <div id={`m-details-${m.id}`} className="p-5 sm:flex-1">
                    <Details m={m} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
