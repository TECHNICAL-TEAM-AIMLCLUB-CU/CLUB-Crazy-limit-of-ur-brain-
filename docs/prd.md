# Signal Room — Product Requirements

## Purpose

Signal Room is the AIML Club website's editorial home for published announcements. It makes club updates easy to discover and read without replacing the existing announcement CMS, homepage section, or public announcement URLs.

## Product and technical context

- The site uses Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, and Neon Postgres.
- Announcement documents are stored in the `cms_documents` table as JSONB. The existing public routes are `/announcements` and `/announcements/[slug]`; the homepage also renders recent announcements.
- The protected `/studio` content studio creates and edits announcement documents.
- Public content must continue to come from the CMS. Do not seed or hardcode announcement copy, dates, links, or images.
- The existing announcement record fields are `title`, `slug`, `publishedAt`, `summary`, and `body`. `category` and `featured` are optional additions.
- The database schema has no announcement-specific relational columns or constraints for these fields. Adding JSON properties does not require a DDL migration. Do not rewrite or bulk-update existing rows.
- `DATABASE_URL` was not configured in the inspected development process, so live Neon records could not be inspected. The no-migration decision is based on `db/schema.sql` and the CMS read/write implementation; verify against the deployed database before any future relational schema change.

## Goals

1. Make `/announcements` a polished, responsive, searchable editorial experience.
2. Help readers quickly identify featured and relevant published announcements.
3. Offer a satisfying, accessible card-to-detail expansion while retaining canonical, shareable announcement URLs.
4. Let CMS administrators assign optional controlled categories and feature announcements.
5. Preserve existing announcement records and all current routes and homepage behavior.

## Functional requirements

### Published content and compatibility

- Only announcements whose `publishedAt` is not in the future are shown publicly.
- Read announcements from the existing CMS query layer; never add a hardcoded content fallback.
- Existing documents without `category` or `featured` remain valid and visible. Do not require a backfill.
- Keep each existing document ID and slug stable when an administrator edits it. Preserve fields not managed by the announcement form when saving an existing document.
- Optional values are validated and omitted or cleared deliberately; invalid category values must not become public filter options.
- If there are no published announcements, show the existing accessible empty-state pattern with no invented content.

### Categories

- Category is optional and is selected from a shared, finite list in both the CMS and public UI; it is not arbitrary free text.
- Initial category identifiers and labels:
  - `club-updates` — Club updates
  - `events` — Events
  - `workshops` — Workshops
  - `projects` — Projects
  - `opportunities` — Opportunities
  - `achievements` — Achievements
- An uncategorized legacy document is included in All results and can be found by search. It must not be assigned an invented category.
- Provide an All filter and only show category filters that have at least one published matching document. Category filtering and text search can be combined.

### Featured announcements

- The CMS provides an optional featured toggle.
- The featured carousel contains all published announcements explicitly marked featured, ordered newest first.
- If one or more published announcements are explicitly featured, do not substitute a non-featured record.
- If none is explicitly featured, show the newest published announcement as the sole carousel item.
- If there are no published announcements, omit the carousel.
- The carousel supports previous/next controls, a position indicator, an explicit pause/resume control, and automatic rotation. It pauses while the pointer is over it or keyboard focus is inside it; manual navigation restarts the interval. Use a restrained interval and do not auto-rotate with reduced motion enabled.
- Controls remain usable at narrow viewport sizes and have accessible names.

### Browse, search, and detail

- Provide a case-insensitive search over the published announcement title, summary, and body.
- Update the result list as search and category state changes. Announce the result count to assistive technology without making every keystroke excessively verbose.
- Show a clear no-results state and a way to clear the active search/filter.
- Cards expose the title, publication date, optional category, and optional summary. Missing optional fields do not produce empty labels or broken layout.
- Selecting a card opens the full announcement in a smooth shared-layout expansion that can be closed accessibly. The detail contains title, publication date, optional category, optional summary, and body when present.
- Keep `/announcements/[slug]` as the canonical, directly navigable and SEO-capable full-detail route. Provide a usable direct-link affordance from the expanded view and a clear way back to browsing.
- The homepage announcement section remains CMS-driven and links to the existing detail route; add or preserve a route link to Signal Room without replacing unrelated home sections.

### Visual and responsive quality

- Follow the premium editorial + modern AI direction: soft blue, mint, lavender, and cool-neutral gradients; clean typography; generous whitespace; subtle borders and shadows.
- Avoid harsh neon, gaming motifs, excessive glass effects, clutter, and distracting movement.
- Preserve the existing site shell, design tokens, navigation, background, and footer. Signal Room must look intentional within the existing dark-themed site rather than recoloring unrelated routes.
- Support phone, tablet, and desktop sizes without horizontal overflow or inaccessible controls.
- Honor `prefers-reduced-motion`; keep all content and controls usable when motion is reduced or unavailable.

## Non-goals

- Replacing Neon, the CMS, the database, or the existing detail route.
- Adding announcement image, registration, or event metadata that the current content model does not provide.
- Migrating, deleting, or re-keying existing announcement records.
- Introducing an animation dependency when CSS and existing platform APIs are sufficient.

## Acceptance criteria

- All published content and detail metadata are read from the CMS.
- Legacy records with no new fields render and can be searched and opened.
- CMS saves validate the controlled category and featured boolean while preserving record identity and unrelated stored fields.
- Explicitly featured content takes precedence; newest-published fallback is used only when no published item is explicitly featured.
- Search and category filters compose correctly; empty and zero-result states are clear.
- Card expansion opens and closes with keyboard and pointer, and the canonical detail URL still works directly.
- Carousel controls, pause behavior, rotation, and reduced-motion behavior are verified.
- Desktop, tablet, and mobile layouts, keyboard operation, and accessible names/status are reviewed.
- Lint, typecheck, and production build pass; existing pages and CMS behavior are regression-checked.

## Requirement status protocol

During implementation, track each acceptance criterion as PASS, FAIL, NEEDS IMPROVEMENT, or BLOCKED. Mark PASS only with observed implementation or test evidence. Record any environment-dependent check, including live Neon verification, as BLOCKED rather than assuming success.

## Implementation checklist

| Requirement | Status | Evidence or blocker |
|---|---|---|
| Four product specifications created and cross-reviewed against the repository | PASS | `docs/prd.md`, `docs/components.md`, `docs/design.md`, and `docs/flow.md` document the current routes, CMS, schema, design, and interactions. |
| No announcement DDL migration or bulk rewrite | PASS | `db/schema.sql` stores announcement fields in JSONB; implementation adds optional properties only. |
| Optional controlled CMS category and featured toggle, with unknown announcement properties preserved on edit | PASS | Studio fields, shared category validation, and existing-document merge are implemented and typechecked. Live persistence was not executable. |
| Legacy records without category/featured remain usable; invalid categories do not create filters | PASS | Public query normalizes optional values; filters include only controlled categories present in published data. |
| Featured records take precedence; newest published record is the fallback only when none is featured | PASS | Signal Room receives all published announcements ordered by publication timestamp and applies the explicit-feature/fallback selection. |
| Search, category combination, result count, and zero-results reset | PASS | Implemented in the Signal Room client surface and included in a successful production build; runtime interaction remains unverified. |
| Carousel rotation, manual controls, pause/resume, hover/focus pause, and reduced-motion behavior | BLOCKED | Implemented, but the page could not render in the browser without `DATABASE_URL`; interaction testing remains outstanding. |
| Shared-layout expansion, keyboard close/focus restoration, and canonical detail links | BLOCKED | Implemented and compiled; keyboard/browser verification is blocked by the same missing database configuration. |
| Desktop/tablet/mobile layout, visual polish, and browser-console review | BLOCKED | A local page request failed in the existing site layout before Signal Room rendered because `DATABASE_URL` is unset. |
| Homepage, announcement detail, studio, and sitemap compatibility | PASS | Existing routes and CMS flows remain wired; production build completed successfully. |
| Typecheck, lint, production build | PASS | Typecheck and production build pass. ESLint reports 0 errors and one pre-existing warning in `eslint.config.mjs`. |
| Live Neon records, CMS save behavior, and preservation of existing database data | BLOCKED | No `DATABASE_URL` or local env file is available, so no live database read/write was attempted. |
