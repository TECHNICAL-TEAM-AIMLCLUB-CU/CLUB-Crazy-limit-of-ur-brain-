# Signal Room — User and Content Flows

## Reader: browse announcements

1. The reader opens `/announcements` from the site navigation or homepage.
2. The server loads published announcements from the existing CMS query. Future-dated items do not appear.
3. If there are no published items, the page displays the shared empty state and no placeholder announcement.
4. The page shows the featured carousel when at least one published announcement exists:
   - If one or more published documents are explicitly featured, show those documents newest first.
   - Otherwise show the newest published document as the single fallback slide.
5. The reader may use carousel previous/next and pause/resume controls. Autoplay pauses while the carousel is hovered or focused and is disabled when reduced motion is requested. Manual navigation restarts its interval.
6. The reader searches title, summary, or body and/or chooses All or an available controlled category. Both controls compose and the results/status update.
7. If no results match, show a clear no-results state and a reset action.

## Reader: expand and open a canonical detail

1. The reader activates an announcement card by pointer or keyboard.
2. The card expands into an accessible detail surface with title, date, optional category, optional summary, and the full available body.
3. The expansion animates smoothly from its source card when supported and uses a restrained fallback when not. It does not depend on motion to communicate content.
4. The reader closes with the visible close control or Escape. Focus returns to the card that opened the detail, and browse state remains usable.
5. The reader can follow a direct-link affordance to `/announcements/[slug]`. Direct visits to that URL render the same CMS story server-side with page metadata and a return link.

## Reader: keyboard and reduced motion

- Tab/Shift+Tab reach search, filters, cards, carousel controls, detail actions, and navigation in logical order.
- Enter/Space activate buttons and cards according to their semantic element; links retain normal link behavior.
- Focus remains visible and is managed while the expansion is open.
- Escape closes the expansion and returns focus to its trigger.
- With `prefers-reduced-motion: reduce`, do not autoplay, tilt, or perform large/continuous transitions; controls and content remain fully available.
- Search result changes are announced politely without moving focus.

## Administrator: create or edit an announcement

1. An authenticated administrator opens the Announcements collection in `/studio`.
2. The form retains the existing title, slug, publication date, summary, and body inputs.
3. The administrator may select one controlled category or leave it unset, and may switch the featured checkbox on or off.
4. Saving validates required fields, slug, publication date, category membership, and checkbox state on the server.
5. A new announcement creates one document. An edit updates the existing document ID, preserves its slug unless changed through the existing field, and preserves unrelated stored JSON properties.
6. Public routes and sitemap are revalidated using the existing CMS flow. No data migration or bulk update runs.
7. If an old announcement has no category or featured flag, it remains editable and public. Its category is not fabricated; if no published record is featured, the newest published record fills the carousel fallback.

## Data and failure behavior

- CMS/database errors must follow existing explicit error behavior; do not disguise failures as an empty successful result.
- Invalid/missing optional category values do not break rendering and do not generate filters.
- Existing detail routes, homepage announcement cards, sitemap entries, and published-content visibility remain compatible.
- The current development process has no `DATABASE_URL`; database-backed rendering and live CMS operations require a configured Neon environment and must be reported as blocked if unavailable.
