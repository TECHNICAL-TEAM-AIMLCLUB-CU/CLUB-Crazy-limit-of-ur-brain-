'use client';

import { useEffect, useState } from 'react';

type State = { status: 'loading' } | { status: 'ready'; total: number } | { status: 'error' };

// Module-level guard: React StrictMode double-mounts and route remounts reuse one request.
let inflight: Promise<number | null> | null = null;

function recordVisit(): Promise<number | null> {
  if (!inflight) {
    inflight = fetch('/api/visits', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (typeof j?.total === 'number' ? (j.total as number) : null))
      .catch(() => null);
  }
  return inflight;
}

export default function VisitCounter() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    recordVisit().then((total) => {
      if (!active) return;
      setState(total === null ? { status: 'error' } : { status: 'ready', total });
    });
    return () => {
      active = false;
    };
  }, []);

  const text =
    state.status === 'ready'
      ? new Intl.NumberFormat('en-IN').format(state.total)
      : state.status === 'error'
        ? '—'
        : '···';

  return (
    <p className="text-sm text-neutral-400">
      <span>Total Visits</span>{' '}
      {/* Fixed min-width prevents layout shift while loading. */}
      <span
        aria-live="polite"
        className="inline-block min-w-[5ch] text-right font-mono tabular-nums text-cyan-300"
      >
        {text}
      </span>
    </p>
  );
}
