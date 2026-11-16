import ButtonLink from '@/components/ui/ButtonLink';
import { PageHeader, Section } from '@/components/ui/Section';
import { resolveClubTeam, TEAM_GROUPS } from '@/lib/team-data';
import type { TeamMember } from '@/lib/types';
import TeamDirectory from './TeamDirectory';

interface Props {
  cmsTeam: TeamMember[];
  compact?: boolean;
}

export default function TeamShowcase({ cmsTeam, compact = false }: Props) {
  const clubTeam = resolveClubTeam(cmsTeam);

  if (compact) {
    return (
      <Section
        eyebrow="The people"
        title="Meet the core team"
        id="team"
        href="/team"
        hrefLabel="Full team"
      >
        <TeamDirectory sections={clubTeam.sections} compact />
      </Section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="The people"
        title="Meet the core team"
        description="Switch between Executive Leadership, Mentors, Tech Team, Operations Team, Marketing Team, and Media Team to explore the people behind AIML Club."
      />

      {/* Surface-free team carousel directory */}
      <section aria-label="Club teams" className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <TeamDirectory sections={clubTeam.sections} />
      </section>

      {/* Borderless, collapsible missing-details & Studio guide */}
      {clubTeam.missingReport.length > 0 && (
        <section
          id="roster-status"
          aria-labelledby="roster-status-heading"
          className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8"
        >
          <details className="group border-y border-line/60 py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">
                  Roster transparency &amp; Studio sync
                </p>
                <h2
                  id="roster-status-heading"
                  className="mt-1 font-display text-lg font-semibold text-fg sm:text-xl"
                >
                  Pending member details ({clubTeam.totalVerified} verified across {clubTeam.totalGroups} teams)
                </h2>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted transition group-hover:text-fg">
                <span className="group-open:hidden">Show checklist +</span>
                <span className="hidden group-open:inline">Hide checklist −</span>
              </span>
            </summary>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              Only verified names, roles, and links are shown—no fake biographies or stock photos are used.
              Add or update members anytime in{' '}
              <code className="font-mono text-xs text-brand-cyan">/studio</code> using standard department
              names ({TEAM_GROUPS.map((g) => g.cmsDepartmentHint).join(', ')}) and each team&apos;s carousel
              updates automatically.
            </p>

            <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {clubTeam.missingReport.map((item) => (
                <div key={item.group + item.subject} className="border-l border-line-strong pl-4">
                  <dt className="font-display text-sm font-semibold text-fg">
                    <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brand-cyan">
                      {item.group}
                    </span>
                    {item.subject}
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-muted">
                    Needed: {item.needed.join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      )}

      {/* Open closing links into Join & Announcements */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-20 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-cyan">Grow with us</p>
        <h2 className="mt-2.5 font-display text-2xl font-semibold sm:text-3xl">
          Want to join one of our teams?
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/#join">Join the Club</ButtonLink>
          <ButtonLink href="/#announcements" variant="secondary">
            View Announcements
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
