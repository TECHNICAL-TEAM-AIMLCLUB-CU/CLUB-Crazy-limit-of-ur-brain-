# Signal Room — Component Architecture

This plan extends the existing Next.js App Router and CMS. It does not replace the public announcement route, content studio, shared site shell, or existing `Announcement` model contract for legacy fields.

## Data contract

Extend `Announcement` with optional fields:

- `category?: AnnouncementCategory`, where `AnnouncementCategory` is the union of the controlled identifiers in `docs/prd.md`.
- `featured?: boolean`.
- `publicationStatus?: 'draft' | 'published' | 'archived'`; missing status on legacy records is treated as published.
- `announcementType?: 'notice' | 'important' | 'deadline'`, `priority?: number`, `publicationEndsAt?: string`, and `dismissible?: boolean`.
- `announcementBarEventEligible?: boolean`; only an explicitly eligible record in the Events category with a valid future `eventDate` is promoted above ordinary notices. Missing legacy values are treated as false.
- `image?: SiteImage`, `eventDate?: string`, `deadline?: string`, `ctaLabel?: string`, and `ctaUrl?: string`.

Use one shared category definition for public labels and CMS select options. At the CMS boundary, treat missing optional fields as valid legacy data and validate submitted categories, status, date/time values, image URLs, and CTA URL/label pairs.

The current `cms_documents.data` JSONB column already stores arbitrary document properties. No SQL migration or bulk data update is required. Existing IDs, slugs, timestamps, and unrelated document properties must be preserved. Continue to use the current published-content queries and sanitize any display value at its use site.

## Components and responsibilities

### Existing public route: `app/(site)/announcements/page.tsx`

- Remains a Server Component and loads all published items through the existing `getAnnouncements` query.
- Supplies real CMS records to the interactive Signal Room client surface.
- Adds upcoming timeline entries only for valid future `eventDate` values; never infer event dates from `publishedAt`.
- Keeps page metadata and the existing site layout.
- Shows the current shared `EmptyState` when there are no published announcements.

### `components/announcements/SignalRoom.tsx`

- Client-side coordinator for category selection, search text, filtered results, and selected announcement.
- Receives published announcements as props; it does not fetch, invent, or mutate CMS content.
- Derives featured items, required category filters, search results, and displayed statistics from those records.
- Displays an explicit `Club Update` label for uncategorized records without assigning a synthetic category.
- Composes the featured carousel, filters/search, result status, cards, and expansion view.
- Keeps a single source of truth for active filter/search/detail state and resets or preserves state predictably when the detail closes.

### `components/announcements/FeaturedAnnouncementCarousel.tsx`

- Receives the featured list selected by the page/coordinator.
- Renders a single focused announcement at a time with previous/next controls, an explicit pause/resume control, and a position indicator.
- Handles interval lifecycle, pause on pointer hover/focus, restart after manual navigation, and reduced-motion behavior.
- Does not rotate when there is only one item.
- Avoids timers when hidden/unmounted and cleans them up when dependencies change.
- Renders optional image/CTA metadata only after URL sanitization.

### `components/announcements/AnnouncementFilters.tsx`

- Renders a labeled search input and controlled category filter.
- All, Events, Workshops, Opportunities, and Notices remain available; legacy category filters are added when represented by published content.
- Includes a clear/reset affordance when a filter or query is active.

### `components/cards/AnnouncementCard.tsx`

- Preserves its use on the homepage and its CMS-backed title/date/summary behavior.
- Supports the Signal Room card presentation and selection affordance without breaking the existing detail Link.
- Uses semantic interactive elements, a visible focus treatment, and reduced-motion-safe hover effects.
- Applies a restrained pointer-driven tilt only when fine pointer input and motion preference allow it; reset transform on leave and do not make tilt necessary to use the card.
- Displays publication date separately from explicitly stored event date and deadline.

### `components/announcements/AnnouncementExpansion.tsx`

- Presents the selected announcement in an accessible dialog/expanded surface, including full available body content.
- Uses shared-element transition treatment where the platform supports it and a simple CSS transition otherwise.
- Supports Escape and close controls, focus management/restoration, scroll handling, and a direct canonical link to `/announcements/[slug]`.
- Shows optional image, event/deadline values, and a safe CTA only when those fields exist.
- On small viewports, behaves as a full-screen or near-full-screen detail surface rather than a cramped floating modal.

### Existing detail route: `app/(site)/announcements/[slug]/page.tsx`

- Remains directly addressable and server-rendered with metadata from the CMS.
- Displays the optional category only when valid and present.
- Keeps its return-to-announcements navigation.
- Provides a compatible target for direct links and expansion fallbacks.

### Existing CMS: `app/studio/page.tsx`, `app/studio/actions.ts`

- Adds an optional category `<select>` whose options come from the shared category definition.
- Adds an optional featured checkbox with an explicit false state when unchecked.
- Adds publication status, image URL/alt text, event date, deadline, CTA label, and CTA URL controls.
- Adds an explicit upcoming-event bar eligibility checkbox; the server requires the Events category and an explicit event date when enabled.
- Retains existing title, slug, publication date, description, and body fields.
- Server action independently validates category/status/type values, strict UTC date/time fields, priority, safe same-site/HTTP(S)/mailto CTA URLs, and paired CTA label/URL; client controls are not trusted as validation.
- Updates the selected document in place. Do not change the document ID or slug index behavior.
- Preserve unrecognized stored announcement properties when saving known fields. Do not bulk-rewrite documents.

### Existing data layer: `lib/queries.ts`, `lib/types.ts`

- Adds optional TypeScript fields and a shared category type/definition.
- Continues to exclude drafts and future publications from public lists and detail queries while treating a missing legacy status as published.
- Normalizes invalid optional metadata and sanitizes URLs before returning records to components.
- Uses the existing JSONB table and query helpers; no relational migration is planned.
- Keeps the homepage and sitemap consumers compatible.

### `components/announcements/UpcomingTimeline.tsx`

- Renders only the future dated announcements selected by the server route from explicit `eventDate` fields.
- Shows a deadline or CTA only when the corresponding explicit CMS value is present and valid.
- Is omitted when there are no upcoming dated announcements.

### `app/(site)/layout.tsx` and `components/site/AnnouncementBar.tsx`

- The site layout loads the same published announcements and selects one eligible bar server-side; it reads only opaque dismissal fingerprint cookies.
- The bar is rendered once above the existing fixed `Navbar`, and the navigation/content offsets are zero when no bar is selected.
- NOTICE/IMPORTANT/DEADLINE styling and optional safe action links are presentation only; the message never acts as a link.
- The client component is limited to deadline/publication-end timers and the accessible dismiss form. It contains no database access or selection logic.

### `lib/announcement-bar.ts` and `app/(site)/announcement-bar-actions.ts`

- The pure selector excludes drafts, archives, future starts, expired/invalid publication ends, and expired/missing deadline values.
- Priority is class first (important > deadline > explicitly eligible future event > notice), then priority descending, publication timestamp descending, and stable slug/ID order.
- Dismissal is verified against the current published record on the server and is stored in a per-record HTTP-only cookie. The version fingerprint includes `updated_at` and public bar fields so later edits become eligible again.
- IMPORTANT dismissal is rejected server-side; DEADLINE dismissal is honored only when explicitly enabled in Studio.

## State and accessibility contracts

- Active category, search query, carousel index, and selected detail belong to the Signal Room client coordinator or the smallest owner that can satisfy their interactions.
- Use buttons for state changes and links for navigation. Every carousel control, close action, filter, and search field has an accessible name/label.
- Announce result counts with a polite live region. Keep focus visible and restore focus to the card/control that opened the expansion.
- All functionality is keyboard-operable. Respect reduced motion for carousel autoplay, tilt, and transitions.
- Do not add a package unless the existing stack cannot provide the required, tested behavior.
