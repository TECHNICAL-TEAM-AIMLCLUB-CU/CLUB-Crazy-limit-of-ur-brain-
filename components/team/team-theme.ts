import type { TeamAccent, TeamGroupId } from '@/lib/team-data';

export interface TeamAccentTheme {
  primary: string;
  secondary: string;
  badgeBg: string;
  badgeStroke: string;
  glow: string;
  textClass: string;
  badgeClass: string;
}

/**
 * Six distinct, dark-palette-harmonized team color signatures so each team
 * is immediately recognizable in tabs, headings, carousel posters, and captions.
 */
export const TEAM_ACCENT_THEME: Record<TeamAccent, TeamAccentTheme> = {
  cyan: {
    primary: '#22d3ee',
    secondary: '#06b6d4',
    badgeBg: 'rgba(34, 211, 238, 0.14)',
    badgeStroke: 'rgba(34, 211, 238, 0.52)',
    glow: 'rgba(34, 211, 238, 0.65)',
    textClass: 'text-cyan-400',
    badgeClass: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300',
  },
  violet: {
    primary: '#a78bfa',
    secondary: '#8b5cf6',
    badgeBg: 'rgba(167, 139, 250, 0.16)',
    badgeStroke: 'rgba(167, 139, 250, 0.54)',
    glow: 'rgba(167, 139, 250, 0.65)',
    textClass: 'text-violet-400',
    badgeClass: 'border-violet-400/35 bg-violet-400/10 text-violet-300',
  },
  blue: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    badgeStroke: 'rgba(96, 165, 250, 0.52)',
    glow: 'rgba(96, 165, 250, 0.65)',
    textClass: 'text-blue-400',
    badgeClass: 'border-blue-400/35 bg-blue-400/10 text-blue-300',
  },
  emerald: {
    primary: '#34d399',
    secondary: '#14b8a6',
    badgeBg: 'rgba(52, 211, 153, 0.14)',
    badgeStroke: 'rgba(52, 211, 153, 0.5)',
    glow: 'rgba(52, 211, 153, 0.6)',
    textClass: 'text-emerald-400',
    badgeClass: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300',
  },
  amber: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    badgeBg: 'rgba(251, 191, 36, 0.14)',
    badgeStroke: 'rgba(251, 191, 36, 0.5)',
    glow: 'rgba(251, 191, 36, 0.6)',
    textClass: 'text-amber-400',
    badgeClass: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
  },
  fuchsia: {
    primary: '#e879f9',
    secondary: '#c084fc',
    badgeBg: 'rgba(232, 121, 249, 0.15)',
    badgeStroke: 'rgba(232, 121, 249, 0.52)',
    glow: 'rgba(232, 121, 249, 0.62)',
    textClass: 'text-fuchsia-400',
    badgeClass: 'border-fuchsia-400/35 bg-fuchsia-400/10 text-fuchsia-300',
  },
};

export const TEAM_CARD_BADGE: Record<TeamGroupId, string> = {
  executive: 'EXECUTIVE',
  mentors: 'MENTORS',
  tech: 'TECH TEAM',
  operations: 'OPERATIONS',
  marketing: 'MARKETING',
  media: 'MEDIA TEAM',
};
