'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ResolvedTeamMember, TeamAccent } from '@/lib/team-data';
import type { FlexCarouselItem } from './FlexCarousel/FlexCarousel';
import { TEAM_ACCENT_THEME, TEAM_CARD_BADGE } from './team-theme';
import { SocialIcon } from './TeamIcons';

const FlexCarousel = dynamic(() => import('./FlexCarousel/FlexCarousel'), { ssr: false });

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function seedNumber(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function splitNameLines(name: string): [string, string | null] {
  if (name.length <= 17) return [name, null];
  const words = name.split(/\s+/);
  if (words.length <= 1) return [name.slice(0, 17), null];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/**
 * Generates a crisp 600x800 team-accented portrait poster for members awaiting official photos
 * (and as a CORS-safe WebGL texture fallback). Each team gets a unique color signature and
 * prominent team label so teams are unmistakable at a glance.
 */
function buildMemberPosterSvg(member: ResolvedTeamMember): string {
  const theme = TEAM_ACCENT_THEME[member.accent];
  const teamBadge = TEAM_CARD_BADGE[member.group];
  const seed = seedNumber(member.id);
  const n1 = { x: 108 + (seed % 68), y: 176 + ((seed >> 3) % 56) };
  const n2 = { x: 422 + ((seed >> 5) % 68), y: 182 + ((seed >> 7) % 60) };
  const n3 = { x: 118 + ((seed >> 9) % 62), y: 452 + ((seed >> 11) % 52) };
  const n4 = { x: 424 + ((seed >> 13) % 62), y: 444 + ((seed >> 15) % 56) };

  const displayName = member.isPlaceholder
    ? member.executiveSlot === 'secretary'
      ? 'To Be Announced'
      : 'Roster Open'
    : member.name;
  const [line1, line2] = splitNameLines(displayName);
  const roleLabel = member.isPlaceholder
    ? member.executiveSlot === 'secretary'
      ? 'CLUB SECRETARY'
      : `${teamBadge} MEMBERS`
    : (member.role.length > 28 ? `${member.role.slice(0, 27)}…` : member.role).toUpperCase();
  const statusLabel = member.isPlaceholder ? 'OPEN SLOT' : 'PHOTO PENDING';
  const strokeDash = member.isPlaceholder ? 'stroke-dasharray="10 8"' : '';

  const badgeWidth = Math.max(152, teamBadge.length * 13 + 42);
  const badgeX = 552 - badgeWidth;
  const badgeCenterX = badgeX + badgeWidth / 2;

  const centerSymbol = member.isPlaceholder
    ? `<circle cx="300" cy="306" r="24" fill="none" stroke="${theme.primary}" stroke-width="3.2" opacity="0.9"/>
       <path d="M254 372c9-22 25-33 46-33s37 11 46 33" fill="none" stroke="${theme.primary}" stroke-width="3.2" stroke-linecap="round" opacity="0.9"/>`
    : `<text x="300" y="344" text-anchor="middle" fill="#f1f5fb" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="68" font-weight="700" letter-spacing="-1.5">${escapeXml(member.initials)}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.88" y2="1">
      <stop offset="0%" stop-color="#131929"/>
      <stop offset="54%" stop-color="#0b0f1a"/>
      <stop offset="100%" stop-color="#06080e"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.2" cy="0.16" r="0.68">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.84" cy="0.84" r="0.62">
      <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="100%" stop-color="${theme.secondary}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#06080e" stop-opacity="0"/>
      <stop offset="100%" stop-color="#05070d" stop-opacity="0.95"/>
    </linearGradient>
  </defs>

  <rect width="600" height="800" fill="url(#bg)"/>
  <rect width="600" height="800" fill="url(#glowA)"/>
  <rect width="600" height="800" fill="url(#glowB)"/>
  <rect x="14" y="14" width="572" height="772" rx="32" fill="none" stroke="${theme.badgeStroke}" stroke-opacity="0.62" stroke-width="2" ${strokeDash}/>

  <rect x="48" y="48" width="84" height="6" rx="3" fill="url(#bar)"/>
  <text x="48" y="84" fill="#9aa4b8" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14" letter-spacing="3">AIML CLUB</text>

  <rect x="${badgeX}" y="44" width="${badgeWidth}" height="38" rx="19" fill="${theme.badgeBg}" stroke="${theme.badgeStroke}" stroke-width="1.6"/>
  <text x="${badgeCenterX}" y="68" text-anchor="middle" fill="${theme.primary}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13.5" font-weight="700" letter-spacing="2.2">${escapeXml(teamBadge)}</text>

  <line x1="${n1.x}" y1="${n1.y}" x2="300" y2="320" stroke="rgba(154,164,184,0.22)" stroke-width="1.4"/>
  <line x1="${n2.x}" y1="${n2.y}" x2="300" y2="320" stroke="rgba(154,164,184,0.22)" stroke-width="1.4"/>
  <line x1="${n3.x}" y1="${n3.y}" x2="300" y2="320" stroke="rgba(154,164,184,0.16)" stroke-width="1.4"/>
  <line x1="${n4.x}" y1="${n4.y}" x2="300" y2="320" stroke="rgba(154,164,184,0.16)" stroke-width="1.4"/>
  <circle cx="${n1.x}" cy="${n1.y}" r="5.5" fill="${theme.primary}" opacity="0.92"/>
  <circle cx="${n2.x}" cy="${n2.y}" r="4.5" fill="#9aa4b8" opacity="0.65"/>
  <circle cx="${n3.x}" cy="${n3.y}" r="4.5" fill="#9aa4b8" opacity="0.55"/>
  <circle cx="${n4.x}" cy="${n4.y}" r="5.5" fill="${theme.secondary}" opacity="0.88"/>

  <circle cx="300" cy="320" r="126" fill="none" stroke="${theme.badgeStroke}" stroke-width="1.4" stroke-opacity="0.55" stroke-dasharray="4 7"/>
  <circle cx="300" cy="320" r="98" fill="#080b14" fill-opacity="0.92" stroke="${theme.primary}" stroke-opacity="0.72" stroke-width="2.4"/>
  ${centerSymbol}

  <rect x="0" y="492" width="600" height="308" fill="url(#fade)"/>
  <line x1="48" y1="560" x2="552" y2="560" stroke="${theme.badgeStroke}" stroke-opacity="0.32" stroke-width="1.5"/>

  <text x="48" y="598" fill="${theme.primary}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="15" font-weight="700" letter-spacing="2.3">${escapeXml(roleLabel)}</text>
  <text x="48" y="${line2 ? '646' : '656'}" fill="#f1f5fb" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${line2 ? '37' : '40'}" font-weight="700" letter-spacing="-0.6">${escapeXml(line1)}</text>
  ${line2 ? `<text x="48" y="690" fill="#f1f5fb" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="37" font-weight="700" letter-spacing="-0.6">${escapeXml(line2)}</text>` : ''}

  <text x="48" y="744" fill="#a8b2c6" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="2.2">${escapeXml(member.groupLabel.toUpperCase())}</text>
  <text x="552" y="744" text-anchor="end" fill="#6f7a92" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="1.8">${statusLabel}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function detectWebGL2(): 'pending' | 'supported' | 'unsupported' {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') ? 'supported' : 'unsupported';
  } catch {
    return 'unsupported';
  }
}

interface Props {
  members: ResolvedTeamMember[];
  teamLabel: string;
  accent: TeamAccent;
  onSelectMember: (member: ResolvedTeamMember) => void;
}

export default function TeamFlexShowcase({
  members,
  teamLabel,
  accent,
  onSelectMember,
}: Props) {
  const [webglState, setWebglState] = useState<'pending' | 'supported' | 'unsupported'>('pending');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setWebglState(detectWebGL2());
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [members]);

  const items: FlexCarouselItem[] = useMemo(
    () =>
      members.map((member) => {
        const poster = buildMemberPosterSvg(member);
        const title = member.isPlaceholder
          ? member.executiveSlot === 'secretary'
            ? 'Secretary — Position Open'
            : `${member.groupLabel} — Roster Updating`
          : member.name;
        return {
          memberId: member.id,
          src: member.portraitUrl ?? poster,
          fallbackSrc: poster,
          alt: member.portraitAlt,
          title,
          subtitle: `${member.role} · ${member.groupLabel}`,
        };
      }),
    [members],
  );

  if (members.length === 0) return null;

  const theme = TEAM_ACCENT_THEME[accent];
  const safeIndex = Math.min(Math.max(activeIndex, 0), members.length - 1);
  const activeMember = members[safeIndex];
  const memberTheme = activeMember ? TEAM_ACCENT_THEME[activeMember.accent] : theme;

  // Graceful surface-free fallback only when a browser lacks WebGL2 support.
  if (webglState === 'unsupported') {
    return (
      <ul className="divide-y divide-line/60" aria-label={`${teamLabel} roster`}>
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-fg">
                {member.isPlaceholder
                  ? member.executiveSlot === 'secretary'
                    ? 'Secretary (Position Open)'
                    : `${member.groupLabel} (Roster Updating)`
                  : member.name}
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                <span style={{ color: TEAM_ACCENT_THEME[member.accent].primary }}>{member.role}</span>
                {' · '}
                {member.groupLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectMember(member)}
              className="shrink-0 font-mono text-xs text-muted transition hover:text-fg"
            >
              Details →
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const carouselStyle = {
    '--flex-carousel-accent': memberTheme.primary,
  } as CSSProperties;

  return (
    <div className="relative">
      {/* Surface-free, transparent WebGL2 FlexCarousel floating directly over the background */}
      <div className="relative h-[430px] w-full sm:h-[520px]">
        {webglState === 'supported' && (
          <FlexCarousel
            items={items}
            preset="liquid"
            intro="rise"
            fit="portrait"
            cardHeight={0.56}
            gap={18}
            radius={22}
            squeeze={0.2}
            focusOnClick
            loop={items.length >= 5}
            showArrows
            captions
            tilt={85}
            curl="rise"
            captureWheel={false}
            ariaLabel={`${teamLabel} members carousel`}
            style={carouselStyle}
            onChange={(idx) => setActiveIndex(idx)}
          />
        )}
      </div>

      {/* Minimal borderless inline action for the centered member */}
      {activeMember && (
        <div className="-mt-1 flex flex-wrap items-center justify-center gap-4">
          {activeMember.socials.map((social) => (
            <a
              key={social.platform + social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${activeMember.name} on ${social.platform}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-fg motion-reduce:transition-none"
            >
              <SocialIcon platform={social.platform} className="h-3.5 w-3.5" />
              <span>{social.platform}</span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => onSelectMember(activeMember)}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted transition hover:text-fg focus-visible:outline-none focus-visible:underline motion-reduce:transition-none"
          >
            <span>{activeMember.isPlaceholder ? 'Slot details' : 'View profile'}</span>
            <span aria-hidden="true" style={{ color: memberTheme.primary }}>
              ↗
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
