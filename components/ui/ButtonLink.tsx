import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  className?: string;
};

const base =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-200 motion-reduce:transition-none';
const variants = {
  primary: 'bg-brand-cyan text-bg hover:brightness-110 shadow-[0_0_24px_-6px_rgba(34,211,238,0.6)]',
  secondary: 'border border-line-strong bg-surface/80 text-fg hover:border-brand-cyan/60 hover:text-brand-cyan',
};

export default function ButtonLink({ href, children, variant = 'primary', external, className = '' }: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
