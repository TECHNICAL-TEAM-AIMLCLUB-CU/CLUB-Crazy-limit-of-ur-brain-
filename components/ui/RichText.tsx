import { PortableText, type PortableTextComponents } from 'next-sanity';
import { safeUrl } from '@/lib/utils';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 leading-relaxed text-fg/85">{children}</p>,
    h2: ({ children }) => <h2 className="mt-10 font-display text-2xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 font-display text-xl font-semibold">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="mt-4 border-l-2 border-brand-cyan pl-4 text-muted">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 list-disc space-y-1 pl-6 text-fg/85">{children}</ul>,
    number: ({ children }) => <ol className="mt-4 list-decimal space-y-1 pl-6 text-fg/85">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = safeUrl((value as { href?: string } | undefined)?.href);
      return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-cyan underline underline-offset-2">
          {children}
        </a>
      ) : (
        <>{children}</>
      );
    },
  },
};

export default function RichText({ value }: { value: unknown[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components} />;
}
