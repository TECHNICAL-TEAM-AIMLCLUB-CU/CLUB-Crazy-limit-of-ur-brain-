'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 pt-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-muted">We couldn&rsquo;t load this page. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-brand-cyan px-6 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}
