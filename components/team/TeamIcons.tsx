import type { TeamGroupId } from '@/lib/team-data';

export function SocialIcon({ platform, className = 'h-4 w-4' }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();

  if (p.includes('github') || p === 'git') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.04 1.53 1.04.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      </svg>
    );
  }

  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68Z" />
      </svg>
    );
  }

  if (p.includes('instagram') || p === 'ig') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (p === 'x' || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
      </svg>
    );
  }

  if (p.includes('mail') || p.includes('email')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function GroupGlyph({ group, className = 'h-4 w-4' }: { group: TeamGroupId; className?: string }) {
  switch (group) {
    case 'executive':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'mentors':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <path d="m2 9 10-5 10 5-10 5L2 9Z" strokeLinejoin="round" />
          <path d="M6 11.2V16c0 1.8 2.7 3.2 6 3.2s6-1.4 6-3.2v-4.8" strokeLinecap="round" />
          <path d="M22 9v6" strokeLinecap="round" />
        </svg>
      );
    case 'tech':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'operations':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <path d="M8.2 6h7.6M6 8.2V14a4 4 0 0 0 4 4h5.8" strokeLinecap="round" />
        </svg>
      );
    case 'marketing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <path d="M4 11v3a1 1 0 0 0 1 1h2.5l3 5h2l-2-5H13l6 3V6l-6 3H5a1 1 0 0 0-1 2Z" strokeLinejoin="round" />
        </svg>
      );
    case 'media':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="17.2" cy="8.2" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
