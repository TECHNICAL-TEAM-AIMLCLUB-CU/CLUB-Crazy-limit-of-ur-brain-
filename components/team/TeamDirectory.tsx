'use client';

import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type {
  DepartmentSectionData,
  ResolvedTeamMember,
  TeamGroupId,
} from '@/lib/team-data';
import MemberProfileDialog from './MemberProfileDialog';
import TeamFlexShowcase from './TeamFlexShowcase';
import { TEAM_ACCENT_THEME } from './team-theme';
import { GroupGlyph } from './TeamIcons';

interface Props {
  sections: DepartmentSectionData[];
  compact?: boolean;
}

function formatTeamCount(section: DepartmentSectionData): string {
  if (section.meta.id === 'executive' && section.placeholderCount > 0) {
    return `${section.verifiedCount}/${section.members.length}`;
  }
  if (section.placeholderCount > 0) {
    return `${section.verifiedCount}+`;
  }
  return String(section.verifiedCount);
}

export default function TeamDirectory({ sections, compact = false }: Props) {
  const [activeTeamId, setActiveTeamId] = useState<TeamGroupId>(
    () => sections[0]?.meta.id ?? 'executive',
  );
  const [selectedMember, setSelectedMember] = useState<ResolvedTeamMember | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeTeamIndex = useMemo(() => {
    const idx = sections.findIndex((section) => section.meta.id === activeTeamId);
    return idx >= 0 ? idx : 0;
  }, [sections, activeTeamId]);

  const activeSection = sections[activeTeamIndex];

  if (!activeSection) return null;

  const { meta, members, verifiedCount, placeholderCount } = activeSection;
  const theme = TEAM_ACCENT_THEME[meta.accent];
  const prevSection = sections[(activeTeamIndex - 1 + sections.length) % sections.length];
  const nextSection = sections[(activeTeamIndex + 1) % sections.length];

  const selectTeamByIndex = (index: number, focusTab = false) => {
    const wrapped = (index + sections.length) % sections.length;
    const target = sections[wrapped];
    if (!target) return;
    setActiveTeamId(target.meta.id);
    if (focusTab) tabRefs.current[wrapped]?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTeamByIndex(index + 1, true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTeamByIndex(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTeamByIndex(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTeamByIndex(sections.length - 1, true);
    }
  };

  const tabId = (id: TeamGroupId) => `team-tab-${id}`;
  const panelId = `team-panel-${meta.id}`;

  return (
    <div>
      {/* Surface-free team name navigation */}
      <div
        role="tablist"
        aria-label="Select club team"
        className="-mx-1 flex items-center gap-5 overflow-x-auto border-b border-white/12 px-1 [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section, index) => {
          const isSelected = section.meta.id === meta.id;
          const itemTheme = TEAM_ACCENT_THEME[section.meta.accent];
          return (
            <button
              key={section.meta.id}
              id={tabId(section.meta.id)}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`team-panel-${section.meta.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTeamId(section.meta.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              style={{ textShadow: '0 2px 14px rgba(5, 6, 10, 0.95)' }}
              className={`group relative inline-flex shrink-0 items-center gap-2 pb-3.5 pt-1 text-sm transition-colors duration-200 focus-visible:outline-none motion-reduce:transition-none ${
                isSelected ? 'font-semibold text-fg' : 'font-medium text-fg/72 hover:text-fg'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full transition-opacity duration-200 motion-reduce:transition-none"
                style={{
                  backgroundColor: itemTheme.primary,
                  opacity: isSelected ? 1 : 0.65,
                  boxShadow: isSelected ? `0 0 10px ${itemTheme.glow}` : 'none',
                }}
              />
              <span className="font-display tracking-tight">{section.meta.shortLabel}</span>
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: isSelected ? itemTheme.primary : 'rgba(232, 236, 245, 0.55)' }}
              >
                {formatTeamCount(section)}
              </span>

              {/* Active team underline indicator */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] rounded-full transition-opacity duration-200 motion-reduce:transition-none"
                style={{
                  backgroundColor: itemTheme.primary,
                  opacity: isSelected ? 1 : 0,
                  boxShadow: isSelected ? `0 0 14px ${itemTheme.glow}` : 'none',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Active team open stage — zero card surface */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(meta.id)}
        className="pt-7 sm:pt-9"
      >
        {/* Prominent active team heading + quick team steppers */}
        <div
          className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          style={{ textShadow: '0 2px 16px rgba(5, 6, 10, 0.95)' }}
        >
          <div className="max-w-2xl">
            <p
              className="inline-flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] sm:text-xs"
              style={{ color: theme.primary }}
            >
              <span className="font-semibold tabular-nums">{meta.index}</span>
              <span aria-hidden="true" className="opacity-45">
                /
              </span>
              <GroupGlyph group={meta.id} className="h-3.5 w-3.5 shrink-0" />
              <span>{meta.eyebrow}</span>
            </p>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
              <h3 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                {meta.label}
              </h3>
              <span className="font-mono text-xs text-fg/65">
                {verifiedCount} {verifiedCount === 1 ? 'verified member' : 'verified members'}
                {placeholderCount > 0
                  ? meta.id === 'executive'
                    ? ' · Secretary open'
                    : ' · roster updating'
                  : ''}
              </span>
            </div>

            {!compact && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-fg/72">{meta.description}</p>
            )}
          </div>

          {sections.length > 1 && (
            <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-fg/75">
              <button
                type="button"
                onClick={() => selectTeamByIndex(activeTeamIndex - 1)}
                aria-label={`Previous team: ${prevSection.meta.label}`}
                className="inline-flex items-center gap-1.5 transition hover:text-fg focus-visible:outline-none focus-visible:underline motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  style={{ color: TEAM_ACCENT_THEME[prevSection.meta.accent].primary }}
                >
                  ←
                </span>
                <span className="hidden md:inline">{prevSection.meta.shortLabel}</span>
                <span className="md:hidden">Prev team</span>
              </button>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <button
                type="button"
                onClick={() => selectTeamByIndex(activeTeamIndex + 1)}
                aria-label={`Next team: ${nextSection.meta.label}`}
                className="inline-flex items-center gap-1.5 transition hover:text-fg focus-visible:outline-none focus-visible:underline motion-reduce:transition-none"
              >
                <span>{nextSection.meta.shortLabel}</span>
                <span
                  aria-hidden="true"
                  style={{ color: TEAM_ACCENT_THEME[nextSection.meta.accent].primary }}
                >
                  →
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Floating, borderless React Bits FlexCarousel for the selected team */}
        <TeamFlexShowcase
          members={members}
          teamLabel={meta.label}
          accent={meta.accent}
          onSelectMember={setSelectedMember}
        />

        {/* Semantic assistive-tech list of active team members */}
        <ul className="sr-only" aria-label={`${meta.label} member summary`}>
          {members.map((member) => (
            <li key={member.id}>
              {member.isPlaceholder
                ? member.executiveSlot === 'secretary'
                  ? 'Secretary — Position Open'
                  : `${member.groupLabel} — Additional members pending confirmation`
                : `${member.name} — ${member.role}`}
            </li>
          ))}
        </ul>
      </div>

      <MemberProfileDialog
        member={selectedMember}
        members={members}
        onClose={() => setSelectedMember(null)}
        onSelect={setSelectedMember}
      />
    </div>
  );
}
