'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '@/lib/config';

export default function Navbar({ clubName }: { clubName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const linkCls = (href: string) =>
    `rounded-md px-3 py-2 text-sm transition motion-reduce:transition-none ${
      isActive(href) ? 'text-brand-cyan' : 'text-muted hover:text-fg'
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold" aria-label={`${clubName} home`}>
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="11" fill="none" stroke="url(#lg)" strokeWidth="1.6" />
            <circle cx="7" cy="13" r="2" fill="#22d3ee" />
            <circle cx="19" cy="8" r="2" fill="#8b5cf6" />
            <circle cx="19" cy="18" r="2" fill="#3b82f6" />
            <path d="M9 13 17 8.4M9 13l8 4.6" stroke="#9aa4b8" strokeWidth="1" />
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="26" y2="26">
                <stop stopColor="#22d3ee" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span>{clubName}</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={linkCls(l.href)}>
                {l.label}
              </Link>
            </li>
          ))}
          <li className="ml-3">
            <Link
              href="/join"
              className="rounded-full bg-brand-cyan px-5 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              Join the Club
            </Link>
          </li>
        </ul>

        <button
          ref={buttonRef}
          type="button"
          className="rounded-md p-2 text-fg lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-bg/95 lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={`block ${linkCls(l.href)} py-3 text-base`}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/join" className="block rounded-full bg-brand-cyan px-5 py-3 text-center text-sm font-semibold text-bg">
                Join the Club
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
