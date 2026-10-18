import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-brand-cyan">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for doesn&rsquo;t exist or has moved.</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-cyan px-6 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
      >
        Back to home
      </Link>
    </main>
  );
}
