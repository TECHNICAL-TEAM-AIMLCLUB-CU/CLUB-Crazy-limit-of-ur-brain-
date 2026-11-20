# Signal Room — Component Architecture

This plan extends the existing Next.js App Router and CMS. It does not replace the public announcement route, content studio, shared site shell, or existing `Announcement` model contract for legacy fields.

## Data contract

Extend `Announcement` with optional fields:

- `category?: AnnouncementCategory`, where `AnnouncementCategory` is the union of the controlled identifiers in `docs/prd.md`.
- `featured?: boolean`.

Use one shared category definition for public labels and CMS select options. At the CMS boundary, treat missing optional fields as valid legacy data and validate any submitted category against that definition.

The current `cms_documents.data` JSONB column already stores arbitrary document properties. No SQL migration or bulk data update is required. Existing IDs, slugs, timestamps, and unrelated document properties must be preserved. Continue to use the current published-content queries and sanitize any display value at its use site.

## Components and responsibilities

### Existing public route: `app/(site)/announcements/page.tsx`

- Remains a Server Component and loads all published items through `getSignalRoomAnnouncements`.
- Supplies real CMS records to the interactive Signal Room client surface.
- Keeps page metadata and the existing site layout.
- Shows the current shared `EmptyState` when there are no published announcements.

### `components/announcements/SignalRoom.tsx`

- Client-side coordinator for category selection, search text, filtered results, and selected announcement.
- Receives published announcements as props; it does not fetch, invent, or mutate CMS content.
- Composes the featured carousel, filters/search, result status, cards, and expansion view.
- Keeps a single source of truth for active filter/search/detail state and resets or preserves state predictably when the detail closes.

### `components/announcements/FeaturedAnnouncementCarousel.tsx`

- Receives the featured list selected by the page/coordinator.
- Renders a single focused announcement at a time with previous/next controls, an explicit pause/resume control, and a position indicator.
- Handles interval lifecycle, pause on pointer hover/focus, restart after manual navigation, and reduced-motion behavior.
- Does not rotate when there is only one item.
- Avoids timers when hidden/unmounted and cleans them up when dependencies change.

### `components/announcements/AnnouncementFilters.tsx`

- Renders a labeled search input and controlled category filter.
- Categories are derived from valid categories represented in the current published dataset; All remains available.
- Includes a clear/reset affordance when a filter or query is active.

### `components/cards/AnnouncementCard.tsx`

- Preserves its use on the homepage and its CMS-backed title/date/summary behavior.
- Supports the Signal Room card presentation and selection affordance without breaking the existing detail Link.
- Uses semantic interactive elements, a visible focus treatment, and reduced-motion-safe hover effects.
- Applies a restrained pointer-driven tilt only when fine pointer input and motion preference allow it; reset transform on leave and do not make tilt necessary to use the card.

### `components/announcements/AnnouncementExpansion.tsx`

- Presents the selected announcement in an accessible dialog/expanded surface, including full available body content.
- Uses shared-element transition treatment where the platform supports it and a simple CSS transition otherwise.
- Supports Escape and close controls, focus management/restoration, scroll handling, and a direct canonical link to `/announcements/[slug]`.
- On small viewports, behaves as a full-screen or near-full-screen detail surface rather than a cramped floating modal.

### Existing detail route: `app/(site)/announcements/[slug]/page.tsx`

- Remains directly addressable and server-rendered with metadata from the CMS.
- Displays the optional category only when valid and present.
- Keeps its return-to-announcements navigation.
- Provides a compatible target for direct links and expansion fallbacks.

### Existing CMS: `app/studio/page.tsx`, `app/studio/actions.ts`

- Adds an optional category `<select>` whose options come from the shared category definition.
- Adds an optional featured checkbox with an explicit false state when unchecked.
- Retains existing title, slug, publication date, summary, and body fields.
- Server action independently validates category values and boolean form state; client controls are not trusted as validation.
- Updates the selected document in place. Do not change the document ID or slug index behavior.
- Preserve unrecognized stored announcement properties when saving known fields. Do not bulk-rewrite documents.

### Existing data layer: `lib/queries.ts`, `lib/types.ts`

- Adds optional TypeScript fields and a shared category type/definition.
- Continues to exclude future publications from public lists and detail queries.
- Uses the existing JSONB table and query helpers; no relational migration is planned.
- Keeps the homepage and sitemap consumers compatible.

## State and accessibility contracts

- Active category, search query, carousel index, and selected detail belong to the Signal Room client coordinator or the smallest owner that can satisfy their interactions.
- Use buttons for state changes and links for navigation. Every carousel control, close action, filter, and search field has an accessible name/label.
- Announce result counts with a polite live region. Keep focus visible and restore focus to the card/control that opened the expansion.
- All functionality is keyboard-operable. Respect reduced motion for carousel autoplay, tilt, and transitions.
- Do not add a package unless the existing stack cannot provide the required, tested behavior.
