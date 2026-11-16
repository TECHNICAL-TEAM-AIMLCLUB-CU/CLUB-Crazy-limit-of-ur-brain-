import type { SocialLink, TeamMember } from './types';
import { imageUrl, initials, safeUrl } from './utils';

export type TeamGroupId =
  | 'executive'
  | 'mentors'
  | 'tech'
  | 'operations'
  | 'marketing'
  | 'media';

export type TeamAccent = 'cyan' | 'violet' | 'blue' | 'emerald' | 'amber' | 'fuchsia';

export type ExecutiveSlot = 'president' | 'vice-president' | 'secretary';

export interface TeamGroupMeta {
  id: TeamGroupId;
  index: string;
  label: string;
  shortLabel: string;
  eyebrow: string;
  description: string;
  accent: TeamAccent;
  cmsDepartmentHint: string;
}

export interface ResolvedSocial {
  platform: string;
  href: string;
}

export interface ResolvedTeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  group: TeamGroupId;
  groupLabel: string;
  accent: TeamAccent;
  executiveSlot?: ExecutiveSlot;
  isLead: boolean;
  isPlaceholder: boolean;
  bio?: string;
  placeholderNote?: string;
  portraitUrl: string | null;
  portraitAlt: string;
  socials: ResolvedSocial[];
  missingFields: string[];
  order: number;
  source: 'cms' | 'verified' | 'merged' | 'placeholder';
}

export interface DepartmentSectionData {
  meta: TeamGroupMeta;
  members: ResolvedTeamMember[];
  verifiedCount: number;
  placeholderCount: number;
}

export interface MissingRosterItem {
  group: string;
  subject: string;
  needed: string[];
  cmsNote?: string;
}

export interface ResolvedClubTeam {
  allMembers: ResolvedTeamMember[];
  interactiveMembers: ResolvedTeamMember[];
  sections: DepartmentSectionData[];
  totalVerified: number;
  totalGroups: number;
  pendingSlotsCount: number;
  missingReport: MissingRosterItem[];
}

export const TEAM_GROUPS: readonly TeamGroupMeta[] = [
  {
    id: 'executive',
    index: '01',
    label: 'Executive Leadership',
    shortLabel: 'Executive Leadership',
    eyebrow: 'President · Vice President · Secretary',
    description:
      'Core office bearers steering club vision, governance, and cross-department alignment.',
    accent: 'cyan',
    cmsDepartmentHint: 'Executive',
  },
  {
    id: 'mentors',
    index: '02',
    label: 'Faculty Mentors',
    shortLabel: 'Mentors',
    eyebrow: 'Faculty Advisory & Guidance',
    description:
      'Faculty advisors guiding academic depth, research direction, and institutional collaboration.',
    accent: 'violet',
    cmsDepartmentHint: 'Mentors',
  },
  {
    id: 'tech',
    index: '03',
    label: 'Tech Team',
    shortLabel: 'Tech Team',
    eyebrow: 'Engineering & AI Builds',
    description:
      'Student developers and ML builders powering club platforms, projects, and technical workshops.',
    accent: 'blue',
    cmsDepartmentHint: 'Tech Team',
  },
  {
    id: 'operations',
    index: '04',
    label: 'Operations Team',
    shortLabel: 'Operations Team',
    eyebrow: 'Logistics & Events',
    description:
      'Organizers coordinating venues, schedules, registrations, and on-ground event execution.',
    accent: 'emerald',
    cmsDepartmentHint: 'Operations Team',
  },
  {
    id: 'marketing',
    index: '05',
    label: 'Marketing Team',
    shortLabel: 'Marketing Team',
    eyebrow: 'Outreach & Growth',
    description:
      'Strategists leading campus awareness, community outreach, collaborations, and campaigns.',
    accent: 'amber',
    cmsDepartmentHint: 'Marketing Team',
  },
  {
    id: 'media',
    index: '06',
    label: 'Media Team',
    shortLabel: 'Media Team',
    eyebrow: 'Design & Storytelling',
    description:
      'Creators shaping visual identity, photography, reels, event coverage, and social media.',
    accent: 'fuchsia',
    cmsDepartmentHint: 'Media Team',
  },
] as const;

const GROUP_MAP: Record<TeamGroupId, TeamGroupMeta> = TEAM_GROUPS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<TeamGroupId, TeamGroupMeta>,
);

/**
 * Known non-image wrapper hosts or Google Image Search stock thumbnail caches
 * that were pasted during initial CMS testing instead of authentic club portraits.
 */
const BLOCKED_IMAGE_PATTERNS: readonly RegExp[] = [
  /(^|\.)google\.[a-z.]+\/imgres/i,
  /(^|\.)google\.[a-z.]+\/search/i,
  /(^|\.)bing\.com\/images\/search/i,
  /^https?:\/\/encrypted-tbn\d*\.gstatic\.com\//i,
  /depositphotos\.com/i,
  /shutterstock\.com/i,
  /istockphoto\.com/i,
  /gettyimages\.com/i,
];

/** Placeholder bios entered while testing the CMS that should not display as real bios. */
const PLACEHOLDER_BIOS = new Set([
  'an excellent mentor',
  'test',
  'testing',
  'tbd',
  'todo',
  'na',
  'n/a',
  'bio',
  'sample bio',
]);

interface BaselineSeed {
  id: string;
  name: string;
  aliases?: string[];
  role: string;
  group: TeamGroupId;
  executiveSlot?: ExecutiveSlot;
  isLead?: boolean;
  isPlaceholder?: boolean;
  placeholderNote?: string;
  socials?: ResolvedSocial[];
  needsFullName?: boolean;
  order: number;
  cmsNote?: string;
}

/**
 * Verified authentic AIML Club (Chandigarh University) roster compiled strictly from
 * official club repositories, the live CMS, and the official assignment document.
 * No names, bios, photos, or social links are invented; missing details are explicitly tracked.
 */
const VERIFIED_BASELINE: readonly BaselineSeed[] = [
  // 01 — Executive Leadership (President, Vice President, Secretary)
  {
    id: 'exec-president-harsh',
    name: 'Harsh Vardhan Singh',
    aliases: ['harsh', 'harsh vardhan'],
    role: 'President',
    group: 'executive',
    executiveSlot: 'president',
    isLead: true,
    order: 1,
    cmsNote: 'Update CMS entry "harsh" with full name, authentic portrait URL, bio, and socials.',
  },
  {
    id: 'exec-vp-iqra',
    name: 'Iqra Khan',
    aliases: ['iqra'],
    role: 'Vice President',
    group: 'executive',
    executiveSlot: 'vice-president',
    isLead: true,
    order: 2,
    cmsNote: 'Update CMS entry "iqra" with full name, authentic portrait URL, bio, and socials.',
  },
  {
    id: 'exec-secretary-pending',
    name: 'Secretary Position',
    role: 'Secretary',
    group: 'executive',
    executiveSlot: 'secretary',
    isLead: true,
    isPlaceholder: true,
    placeholderNote:
      'Awaiting verified Secretary name, official portrait, bio, and social links. Add a member with role "Secretary" in Content Studio to populate this slot automatically.',
    order: 3,
    cmsNote: 'Add a Team document in /studio with role "Secretary" and department "Executive".',
  },

  // 02 — Faculty Mentors
  {
    id: 'mentor-sudhanshu',
    name: 'Mr. Sudhanshu Singh',
    aliases: ['sudhanshu sir', 'sudhanshu', 'mr sudhanshu singh', 'sudhanshu singh'],
    role: 'Faculty Mentor',
    group: 'mentors',
    isLead: false,
    order: 10,
    cmsNote: 'Replace stock thumbnail in CMS with an official faculty portrait and academic bio.',
  },
  {
    id: 'mentor-ziana',
    name: 'Ms. Ziana',
    aliases: ['ziana maam', 'ziana mam', "ziana ma'am", 'ziana', 'ms ziana'],
    role: 'Faculty Mentor',
    group: 'mentors',
    isLead: false,
    needsFullName: true,
    order: 11,
    cmsNote:
      'Confirm full name & designation, fix portrait alt text (currently "sir"), and upload official portrait.',
  },

  // 03 — Tech Team (SPOC + all verified members)
  {
    id: 'tech-lead-tejas',
    name: 'Tejas Kumar',
    aliases: ['tejas'],
    role: 'Technical Team SPOC',
    group: 'tech',
    isLead: true,
    order: 20,
  },
  {
    id: 'tech-aditya-singh',
    name: 'Aditya Singh',
    role: 'Tech Team Member',
    group: 'tech',
    order: 21,
  },
  {
    id: 'tech-arbiya-naaz',
    name: 'Arbiya Naaz',
    role: 'Tech Team Member',
    group: 'tech',
    order: 22,
  },
  {
    id: 'tech-drishya-bajpai',
    name: 'Drishya Bajpai',
    role: 'Tech Team Member',
    group: 'tech',
    order: 23,
  },
  {
    id: 'tech-harshit-kumar-yadav',
    name: 'Harshit Kumar Yadav',
    role: 'Tech Team Member',
    group: 'tech',
    order: 24,
  },
  {
    id: 'tech-krishna-nand-shukla',
    name: 'Krishna Nand Shukla',
    role: 'Tech Team Member',
    group: 'tech',
    order: 25,
  },
  {
    id: 'tech-lakshya-johri',
    name: 'Lakshya Johri',
    role: 'Tech Team Member',
    group: 'tech',
    order: 26,
  },
  {
    id: 'tech-lakshya-lamba',
    name: 'Lakshya Lamba',
    role: 'Tech Team Member',
    group: 'tech',
    order: 27,
  },
  {
    id: 'tech-piyush-sharma',
    name: 'Piyush Sharma',
    role: 'Tech Team Member',
    group: 'tech',
    order: 28,
  },
  {
    id: 'tech-ravneet-singh',
    name: 'Ravneet Singh',
    role: 'Tech Team Member',
    group: 'tech',
    order: 29,
  },
  {
    id: 'tech-shashank-dixit',
    name: 'Shashank Dixit',
    role: 'Tech Team Member',
    group: 'tech',
    order: 30,
  },
  {
    id: 'tech-vanshika-rawat',
    name: 'Vanshika Rawat',
    role: 'Tech Team Member',
    group: 'tech',
    order: 31,
  },

  // 04 — Operations Team
  {
    id: 'ops-lead-priyal',
    name: 'Priyal',
    aliases: ['priyal'],
    role: 'Operations Lead',
    group: 'operations',
    isLead: true,
    needsFullName: true,
    order: 40,
    cmsNote: 'Confirm full surname, set department to "Operations Team", and add official portrait.',
  },
  {
    id: 'ops-spoc-divyansh',
    name: 'Divyansh Shukla',
    aliases: ['divyansh'],
    role: 'Events & Operations SPOC',
    group: 'operations',
    isLead: true,
    order: 41,
  },
  {
    id: 'ops-members-pending',
    name: 'Operations Roster',
    role: 'Department Members Pending',
    group: 'operations',
    isPlaceholder: true,
    placeholderNote:
      'Complete list of Operations Team members, sub-roles, and photographs is pending confirmation. Adding members under "Operations Team" in Content Studio automatically replaces this placeholder.',
    order: 49,
    cmsNote: 'Add all Operations Team members with department "Operations Team" in /studio.',
  },

  // 05 — Marketing Team
  {
    id: 'marketing-spoc-aadrika',
    name: 'Aadrika Pandey',
    aliases: ['adrika', 'aadrika', 'adrika pandey'],
    role: 'Marketing Team SPOC',
    group: 'marketing',
    isLead: true,
    order: 50,
    cmsNote:
      'Fix CMS entry "adrika": update department from "media" to "Marketing Team", correct role, and replace broken google.com/imgres URL.',
  },
  {
    id: 'marketing-members-pending',
    name: 'Marketing Roster',
    role: 'Department Members Pending',
    group: 'marketing',
    isPlaceholder: true,
    placeholderNote:
      'Complete list of Marketing Team members, sub-roles, and photographs is pending confirmation. Adding members under "Marketing Team" in Content Studio automatically replaces this placeholder.',
    order: 59,
    cmsNote: 'Add all Marketing Team members with department "Marketing Team" in /studio.',
  },

  // 06 — Media Team
  {
    id: 'media-spoc-gauransh',
    name: 'Gauransh Rai Mohnani',
    aliases: ['gauransh', 'gauransh rai'],
    role: 'Media Team SPOC',
    group: 'media',
    isLead: true,
    socials: [{ platform: 'Instagram', href: 'https://www.instagram.com/_x_gauransh_98__/' }],
    order: 60,
    cmsNote:
      'Fix CMS entry "gauransh": update role from "ops lead" to "Media Team SPOC" and replace broken google.com/imgres portrait URL.',
  },
  {
    id: 'media-members-pending',
    name: 'Media Roster',
    role: 'Department Members Pending',
    group: 'media',
    isPlaceholder: true,
    placeholderNote:
      'Complete list of Media Team members, sub-roles, and photographs is pending confirmation. Adding members under "Media Team" in Content Studio automatically replaces this placeholder.',
    order: 69,
    cmsNote: 'Add all Media Team members with department "Media Team" in /studio.',
  },
];

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(mr|ms|mrs|dr|prof|sir|maam|mam|ma'am)\.?\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Validates a portrait URL and filters out search-result wrapper pages & stock caches. */
export function validPortraitUrl(portrait: TeamMember['portrait']): string | null {
  const clean = imageUrl(portrait);
  if (!clean) return null;
  if (BLOCKED_IMAGE_PATTERNS.some((pattern) => pattern.test(clean))) return null;
  return clean;
}

function cleanBio(raw?: string): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (PLACEHOLDER_BIOS.has(trimmed.toLowerCase())) return undefined;
  return trimmed;
}

function cleanPortraitAlt(alt: string | undefined, memberName: string): string {
  const trimmed = alt?.trim();
  if (!trimmed || trimmed.length <= 4 || /^(sir|maam|mam|photo|image|pic|portrait)$/i.test(trimmed)) {
    return `Portrait of ${memberName}`;
  }
  return trimmed;
}

function socialDedupKey(href: string): string {
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const path = u.pathname.toLowerCase().replace(/\/+$/, '');
    return u.protocol === 'mailto:' ? href.toLowerCase() : `${host}${path}`;
  } catch {
    return href.toLowerCase().replace(/\/+$/, '');
  }
}

function sanitizeSocials(raw?: SocialLink[]): ResolvedSocial[] {
  if (!raw?.length) return [];
  const seen = new Set<string>();
  const result: ResolvedSocial[] = [];
  for (const item of raw) {
    const href = safeUrl(item.url);
    const platform = item.platform?.trim();
    if (!href || !platform || href === '#') continue;
    const key = socialDedupKey(href);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ platform, href });
  }
  return result;
}

function mergeSocials(primary: ResolvedSocial[], secondary: ResolvedSocial[]): ResolvedSocial[] {
  const seen = new Set<string>();
  const merged: ResolvedSocial[] = [];
  for (const item of [...primary, ...secondary]) {
    const key = socialDedupKey(item.href);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

function detectExecutiveSlot(role: string): ExecutiveSlot | undefined {
  const r = role.toLowerCase();
  if (/\bvice[\s-]*president\b|\bvp\b/.test(r)) return 'vice-president';
  if (/\b(general\s+|joint\s+)?secretary\b/.test(r)) return 'secretary';
  if (/\bpresident\b/.test(r)) return 'president';
  return undefined;
}

function detectIsLead(role: string, execSlot?: ExecutiveSlot): boolean {
  if (execSlot) return true;
  return /\b(lead|spoc|head|coordinator|director|chief|captain)\b/i.test(role);
}

/** Maps flexible CMS department and role values to one of the 6 canonical club groups. */
export function inferTeamGroup(department?: string, role?: string): TeamGroupId {
  const exec = role ? detectExecutiveSlot(role) : undefined;
  if (exec) return 'executive';

  const dept = (department ?? '').toLowerCase().trim();
  const r = (role ?? '').toLowerCase().trim();

  // Check role first for faculty/mentor titles.
  if (/\b(mentor|faculty|advisor|adviser|professor|patron|counselor|counsellor)\b/.test(`${dept} ${r}`)) {
    return 'mentors';
  }

  // Prefer explicit department classification when present.
  if (/\b(exec|executive|core office|office bearer|board|leadership)\b/.test(dept)) return 'executive';
  if (/\b(tech|technical|engineering|dev|web|ai|ml|software|code|coding|research)\b/.test(dept)) return 'tech';
  if (/\b(op|ops|operation|operations|event|events|logistics|management|hospitality)\b/.test(dept)) {
    return 'operations';
  }
  if (/\b(market|marketing|outreach|pr|public relations|sponsor|sponsorship|growth|promotion)\b/.test(dept)) {
    return 'marketing';
  }
  if (/\b(media|design|creative|content|photo|photography|video|editorial|social|graphics)\b/.test(dept)) {
    return 'media';
  }

  // Fallback to role keywords when department was left empty.
  if (/\b(market|marketing|outreach|pr|sponsor)\b/.test(r)) return 'marketing';
  if (/\b(media|design|creative|content|photo|video|editor|social)\b/.test(r)) return 'media';
  if (/\b(op|ops|operation|operations|event|events|logistics|management)\b/.test(r)) return 'operations';
  if (/\b(tech|technical|developer|engineer|frontend|backend|fullstack|ml|ai|web)\b/.test(r)) return 'tech';

  return 'tech';
}

function formatRoleCase(role: string): string {
  const trimmed = role.trim();
  if (!trimmed) return 'Member';
  // Only normalize when role was entered entirely in lowercase.
  if (trimmed !== trimmed.toLowerCase()) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (/^(ai|ml|aiml|spoc|vp|pr|ui|ux)$/i.test(word)) return word.toUpperCase();
      if (word === 'ops') return 'Operations';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatDisplayName(cmsName: string, fallbackName: string): { name: string; resolvedFullName: boolean } {
  const trimmed = cmsName.trim();
  if (!trimmed) return { name: fallbackName, resolvedFullName: false };

  const cmsTokens = normalizeKey(trimmed).split(' ').filter(Boolean);
  const baseTokens = normalizeKey(fallbackName).split(' ').filter(Boolean);

  // If CMS provides a fuller proper name than our verified baseline (e.g. adds a surname), adopt it.
  if (cmsTokens.length > baseTokens.length) {
    const cased =
      trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()
        ? trimmed
            .toLowerCase()
            .replace(/\b\w/g, (ch) => ch.toUpperCase())
        : trimmed;
    return { name: cased, resolvedFullName: true };
  }

  return { name: fallbackName, resolvedFullName: false };
}

function computeMissingFields(opts: {
  isPlaceholder?: boolean;
  executiveSlot?: ExecutiveSlot;
  needsFullName?: boolean;
  portraitUrl: string | null;
  bio?: string;
  socials: ResolvedSocial[];
}): string[] {
  if (opts.isPlaceholder) {
    if (opts.executiveSlot === 'secretary') {
      return ['Verified full name', 'Official portrait', 'Short bio', 'Social / profile links'];
    }
    return ['Department member names & roles', 'Official portraits', 'Short bios', 'Social links'];
  }
  const missing: string[] = [];
  if (opts.needsFullName) missing.push('Full name / title');
  if (!opts.portraitUrl) missing.push('Official portrait');
  if (!opts.bio) missing.push('Short bio');
  if (opts.socials.length === 0) missing.push('Social links');
  return missing;
}

function computeInitials(name: string, group: TeamGroupId, isPlaceholder: boolean): string {
  if (isPlaceholder) {
    if (group === 'executive') return 'SC';
    return group.slice(0, 2).toUpperCase();
  }
  const cleaned = name.replace(/^(Mr|Ms|Mrs|Dr|Prof)\.?\s+/i, '').trim();
  return initials(cleaned || name) || 'AM';
}

/**
 * Merges live Neon CMS team records with the verified AIML Club structure so:
 * 1. All 8 mandatory roles & departments (President, VP, Secretary, Mentors, Tech,
 *    Operations, Marketing, Media) are always completely represented.
 * 2. Live CMS edits, photos, bios, socials, and newly added members appear immediately.
 * 3. Broken image search URLs or test placeholder strings never break the UI.
 */
export function resolveClubTeam(cmsTeam: TeamMember[] = []): ResolvedClubTeam {
  const matchedCmsBySeed = new Map<string, TeamMember>();
  const extraCmsMembers: TeamMember[] = [];

  // Build quick lookup from normalized name/alias -> baseline seed.
  const aliasLookup = new Map<string, BaselineSeed>();
  for (const seed of VERIFIED_BASELINE) {
    if (seed.isPlaceholder) continue;
    aliasLookup.set(normalizeKey(seed.name), seed);
    for (const alias of seed.aliases ?? []) {
      aliasLookup.set(normalizeKey(alias), seed);
    }
  }

  let cmsSecretary: TeamMember | null = null;

  for (const doc of cmsTeam) {
    const key = normalizeKey(doc.name ?? '');
    const matchedSeed = key ? aliasLookup.get(key) : undefined;
    if (matchedSeed && !matchedCmsBySeed.has(matchedSeed.id)) {
      matchedCmsBySeed.set(matchedSeed.id, doc);
      continue;
    }

    const execSlot = detectExecutiveSlot(doc.role ?? '');
    if (execSlot === 'secretary' && !cmsSecretary) {
      cmsSecretary = doc;
      continue;
    }

    extraCmsMembers.push(doc);
  }

  // Convert any brand-new CMS members into canonical ResolvedTeamMember entries.
  const resolvedExtras: ResolvedTeamMember[] = extraCmsMembers.map((doc, idx) => {
    const group = inferTeamGroup(doc.department, doc.role);
    const meta = GROUP_MAP[group];
    const execSlot = detectExecutiveSlot(doc.role);
    const rawName = doc.name.trim();
    const displayName =
      rawName === rawName.toLowerCase()
        ? rawName.replace(/\b\w/g, (ch) => ch.toUpperCase())
        : rawName;
    const portraitUrl = validPortraitUrl(doc.portrait);
    const bio = cleanBio(doc.bio);
    const socials = sanitizeSocials(doc.socials);
    const isLead = detectIsLead(doc.role, execSlot);
    const defaultOrder = isLead ? 25 : 42 + idx;

    return {
      id: doc._id,
      name: displayName,
      initials: computeInitials(displayName, group, false),
      role: formatRoleCase(doc.role),
      group,
      groupLabel: meta.label,
      accent: meta.accent,
      executiveSlot: execSlot,
      isLead,
      isPlaceholder: false,
      bio,
      portraitUrl,
      portraitAlt: cleanPortraitAlt(doc.portrait?.alt, displayName),
      socials,
      missingFields: computeMissingFields({ portraitUrl, bio, socials }),
      order: typeof doc.order === 'number' && Number.isFinite(doc.order) ? doc.order : defaultOrder,
      source: 'cms',
    };
  });

  // Track which departments gained non-lead CMS members so roster placeholders retire automatically.
  const groupsWithExtraMembers = new Set<TeamGroupId>();
  for (const extra of resolvedExtras) {
    if (!extra.isLead) groupsWithExtraMembers.add(extra.group);
  }

  const resolvedBaseline: ResolvedTeamMember[] = [];

  for (const seed of VERIFIED_BASELINE) {
    const meta = GROUP_MAP[seed.group];

    // Replace the Secretary placeholder automatically as soon as CMS contains a Secretary.
    if (seed.id === 'exec-secretary-pending' && cmsSecretary) {
      const displayName =
        cmsSecretary.name.trim() === cmsSecretary.name.trim().toLowerCase()
          ? cmsSecretary.name.trim().replace(/\b\w/g, (ch) => ch.toUpperCase())
          : cmsSecretary.name.trim();
      const portraitUrl = validPortraitUrl(cmsSecretary.portrait);
      const bio = cleanBio(cmsSecretary.bio);
      const socials = sanitizeSocials(cmsSecretary.socials);
      resolvedBaseline.push({
        id: cmsSecretary._id,
        name: displayName,
        initials: computeInitials(displayName, 'executive', false),
        role: formatRoleCase(cmsSecretary.role || 'Secretary'),
        group: 'executive',
        groupLabel: meta.label,
        accent: meta.accent,
        executiveSlot: 'secretary',
        isLead: true,
        isPlaceholder: false,
        bio,
        portraitUrl,
        portraitAlt: cleanPortraitAlt(cmsSecretary.portrait?.alt, displayName),
        socials,
        missingFields: computeMissingFields({ portraitUrl, bio, socials }),
        order: seed.order,
        source: 'cms',
      });
      continue;
    }

    // Retire department member placeholder automatically once real members are added in CMS.
    if (seed.isPlaceholder && seed.group !== 'executive' && groupsWithExtraMembers.has(seed.group)) {
      continue;
    }

    const cmsDoc = matchedCmsBySeed.get(seed.id);
    const { name, resolvedFullName } = cmsDoc
      ? formatDisplayName(cmsDoc.name, seed.name)
      : { name: seed.name, resolvedFullName: false };
    const portraitUrl = cmsDoc ? validPortraitUrl(cmsDoc.portrait) : null;
    const bio = cmsDoc ? cleanBio(cmsDoc.bio) : undefined;
    const socials = mergeSocials(
      cmsDoc ? sanitizeSocials(cmsDoc.socials) : [],
      seed.socials ?? [],
    );
    const needsFullName = Boolean(seed.needsFullName && !resolvedFullName);

    // Keep accurate verified role unless CMS supplies a more specific, consistent role.
    let role = seed.role;
    if (cmsDoc?.role) {
      const cmsGroup = inferTeamGroup(cmsDoc.department, cmsDoc.role);
      const formatted = formatRoleCase(cmsDoc.role);
      if (
        cmsGroup === seed.group &&
        formatted.toLowerCase() !== seed.role.toLowerCase() &&
        formatted.length > seed.role.length
      ) {
        role = formatted;
      }
    }

    resolvedBaseline.push({
      id: cmsDoc?._id ?? seed.id,
      name,
      initials: computeInitials(name, seed.group, Boolean(seed.isPlaceholder)),
      role,
      group: seed.group,
      groupLabel: meta.label,
      accent: meta.accent,
      executiveSlot: seed.executiveSlot,
      isLead: Boolean(seed.isLead),
      isPlaceholder: Boolean(seed.isPlaceholder),
      bio,
      placeholderNote: seed.placeholderNote,
      portraitUrl,
      portraitAlt: seed.isPlaceholder
        ? `${seed.role} placeholder`
        : cleanPortraitAlt(cmsDoc?.portrait?.alt, name),
      socials,
      missingFields: computeMissingFields({
        isPlaceholder: seed.isPlaceholder,
        executiveSlot: seed.executiveSlot,
        needsFullName,
        portraitUrl,
        bio,
        socials,
      }),
      order:
        typeof cmsDoc?.order === 'number' && Number.isFinite(cmsDoc.order)
          ? cmsDoc.order
          : seed.order,
      source: seed.isPlaceholder ? 'placeholder' : cmsDoc ? 'merged' : 'verified',
    });
  }

  const combined = [...resolvedBaseline, ...resolvedExtras];

  const sections: DepartmentSectionData[] = TEAM_GROUPS.map((meta) => {
    const members = combined
      .filter((member) => member.group === meta.id)
      .sort((a, b) => {
        // Placeholders always render last in their group.
        if (a.isPlaceholder !== b.isPlaceholder) return a.isPlaceholder ? 1 : -1;
        // Executive order is strictly President -> Vice President -> Secretary -> others.
        if (meta.id === 'executive') {
          const rank = (slot?: ExecutiveSlot) =>
            slot === 'president' ? 0 : slot === 'vice-president' ? 1 : slot === 'secretary' ? 2 : 3;
          const diff = rank(a.executiveSlot) - rank(b.executiveSlot);
          if (diff !== 0) return diff;
        }
        // Department leads/SPOCs precede general department members.
        if (a.isLead !== b.isLead) return a.isLead ? -1 : 1;
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });

    const verifiedCount = members.filter((m) => !m.isPlaceholder).length;
    const placeholderCount = members.length - verifiedCount;
    return { meta, members, verifiedCount, placeholderCount };
  });

  const allMembers = sections.flatMap((section) => section.members);
  const totalVerified = allMembers.filter((m) => !m.isPlaceholder).length;
  const pendingSlotsCount = allMembers.filter((m) => m.isPlaceholder).length;

  // Build concise, actionable missing-data summary for club maintainers & assignment reporting.
  const missingReport: MissingRosterItem[] = [];
  for (const section of sections) {
    for (const member of section.members) {
      if (member.isPlaceholder) {
        const seed = VERIFIED_BASELINE.find((s) => s.id === member.id);
        missingReport.push({
          group: section.meta.label,
          subject: member.executiveSlot === 'secretary' ? 'Club Secretary' : `${section.meta.label} Members`,
          needed: member.missingFields,
          cmsNote: seed?.cmsNote,
        });
      } else if (member.missingFields.includes('Full name / title')) {
        const seed = VERIFIED_BASELINE.find((s) => s.name === member.name);
        missingReport.push({
          group: section.meta.label,
          subject: `${member.name} (${member.role})`,
          needed: member.missingFields,
          cmsNote: seed?.cmsNote,
        });
      }
    }

    const needingPhotos = section.members.filter(
      (m) => !m.isPlaceholder && !m.missingFields.includes('Full name / title') && m.missingFields.length > 0,
    );
    if (needingPhotos.length > 0) {
      const names =
        needingPhotos.length <= 3
          ? needingPhotos.map((m) => m.name).join(', ')
          : `${needingPhotos[0].name} + ${needingPhotos.length - 1} verified members`;
      const uniqueNeeded = [...new Set(needingPhotos.flatMap((m) => m.missingFields))];
      missingReport.push({
        group: section.meta.label,
        subject: names,
        needed: uniqueNeeded,
      });
    }
  }

  return {
    allMembers,
    interactiveMembers: allMembers,
    sections,
    totalVerified,
    totalGroups: sections.length,
    pendingSlotsCount,
    missingReport,
  };
}
