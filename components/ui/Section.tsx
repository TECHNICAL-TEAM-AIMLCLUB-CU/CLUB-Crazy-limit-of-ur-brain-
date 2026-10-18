import Link from 'next/link';
import type { ReactNode } from 'react';

export function Section({
  eyebrow,
  title,
  href,
  hrefLabel,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  id?: string;
}) {
  const headingId = `${id ?? title.toLowerCase().replace(/\W+/g, '-')}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">{eyebrow}</p>}
          <h2 id={headingId} className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-sm font-medium text-muted transition hover:text-brand-cyan">
            {hrefLabel ?? 'View all'} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 pb-6 pt-28 sm:px-8 sm:pt-36">
      {eyebrow && <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>}
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/80 px-6 py-14 text-center">
      <p className="font-display text-xl font-medium">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</p>}
    </div>
  );
}
