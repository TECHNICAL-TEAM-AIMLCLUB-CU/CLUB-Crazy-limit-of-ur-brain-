'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ResolvedTeamMember } from '@/lib/team-data';
import { TEAM_ACCENT_THEME } from './team-theme';
import { GroupGlyph, SocialIcon } from './TeamIcons';

interface Props {
  member: ResolvedTeamMember | null;
  members: ResolvedTeamMember[];
  onClose: () => void;
  onSelect: (member: ResolvedTeamMember) => void;
}

function ProfilePortrait({ member }: { member: ResolvedTeamMember }) {
  const [failed, setFailed] = useState(false);
  const theme = TEAM_ACCENT_THEME[member.accent];
  const hasPhoto = Boolean(member.portraitUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [member.id, member.portraitUrl]);

  return (
    <div
      className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-bg sm:aspect-[4/5]"
      style={{
        backgroundImage: `radial-gradient(circle at 25% 18%, ${theme.badgeBg}, transparent 62%)`,
      }}
    >
      {hasPhoto ? (
        <Image
          src={member.portraitUrl!}
          alt={member.portraitAlt}
          fill
          sizes="200px"
          className="object-cover object-top"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span
            className="inline-flex h-20 w-20 items-center justify-center rounded-full border font-display text-2xl font-semibold text-fg"
            style={{ borderColor: theme.badgeStroke, backgroundColor: 'rgba(5,6,10,0.75)' }}
          >
            {member.isPlaceholder ? '?' : member.initials}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {member.isPlaceholder ? 'Slot open' : 'Photo pending'}
          </span>
        </div>
      )}
    </div>
  );
}

export default function MemberProfileDialog({ member, members, onClose, onSelect }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const currentIndex = member ? members.findIndex((item) => item.id === member.id) : -1;
  const canStep = members.length > 1 && currentIndex >= 0;

  useEffect(() => {
    if (!member) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(member)]);

  useEffect(() => {
    if (!member) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (canStep && event.key === 'ArrowRight') {
        event.preventDefault();
        onSelect(members[(currentIndex + 1) % members.length]);
        return;
      }

      if (canStep && event.key === 'ArrowLeft') {
        event.preventDefault();
        onSelect(members[(currentIndex - 1 + members.length) % members.length]);
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, canStep, currentIndex, members, onClose, onSelect]);

  if (!member || typeof document === 'undefined') return null;

  const theme = TEAM_ACCENT_THEME[member.accent];
  const stepTo = (delta: number) => {
    if (!canStep) return;
    onSelect(members[(currentIndex + delta + members.length) % members.length]);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-bg/80 p-3 backdrop-blur-md sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-profile-title"
        className="relative flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <GroupGlyph group={member.group} className={`h-4 w-4 ${theme.textClass}`} />
            <span className="font-mono uppercase tracking-[0.18em]">{member.groupLabel}</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close profile dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-bg/70 text-muted transition hover:border-brand-cyan/60 hover:text-fg motion-reduce:transition-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-6 sm:grid-cols-[12.5rem_1fr] sm:items-start">
            <ProfilePortrait member={member} />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] ${theme.badgeClass}`}>
                  {member.role}
                </span>
                {member.isLead && !member.isPlaceholder && member.group !== 'executive' && (
                  <span className="rounded-full border border-line-strong bg-bg/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fg/80">
                    Team Lead
                  </span>
                )}
                {member.isPlaceholder && (
                  <span className="rounded-full border border-dashed border-line-strong bg-bg/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Placeholder Slot
                  </span>
                )}
              </div>

              <h3 id="team-profile-title" className="mt-3.5 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                {member.isPlaceholder
                  ? member.executiveSlot === 'secretary'
                    ? 'Club Secretary (Pending)'
                    : `${member.groupLabel} Members`
                  : member.name}
              </h3>

              {member.isPlaceholder ? (
                <p className="mt-3 text-sm leading-7 text-muted">{member.placeholderNote}</p>
              ) : member.bio ? (
                <p className="mt-3 text-sm leading-7 text-fg/90">{member.bio}</p>
              ) : (
                <p className="mt-3 text-sm leading-7 text-muted">
                  Verified member of the AIML Club core team under{' '}
                  <strong className="font-medium text-fg/90">{member.groupLabel}</strong>. Official biography will
                  appear here once updated in Content Studio.
                </p>
              )}

              {member.socials.length > 0 && (
                <div className="mt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Connect</p>
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {member.socials.map((social) => (
                      <li key={social.platform + social.href}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-bg/70 px-3.5 py-1.5 text-xs font-medium text-fg transition hover:border-brand-cyan/60 hover:text-brand-cyan motion-reduce:transition-none"
                        >
                          <SocialIcon platform={social.platform} className={`h-3.5 w-3.5 ${theme.textClass}`} />
                          <span>{social.platform}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {member.missingFields.length > 0 && (
                <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-bg/55 p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Details pending confirmation
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {member.missingFields.map((field) => (
                      <li
                        key={field}
                        className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] text-muted"
                      >
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {canStep && (
          <div className="flex items-center justify-between gap-3 border-t border-line bg-bg/50 px-5 py-3.5 sm:px-7">
            <button
              type="button"
              onClick={() => stepTo(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-fg transition hover:border-brand-cyan/60 hover:text-brand-cyan motion-reduce:transition-none"
            >
              <span aria-hidden="true">←</span> Previous
            </button>
            <p className="font-mono text-xs text-muted" aria-live="polite" aria-atomic="true">
              {String(currentIndex + 1).padStart(2, '0')} / {String(members.length).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={() => stepTo(1)}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-fg transition hover:border-brand-cyan/60 hover:text-brand-cyan motion-reduce:transition-none"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
