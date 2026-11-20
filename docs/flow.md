# Signal Room — User and Content Flows

## Reader: browse announcements

1. The reader opens `/announcements` from the site navigation or homepage.
2. The server loads published announcements from the existing `getAnnouncements()` query. Draft and future-published items do not appear; legacy records without a status remain published.
3. If there are no published items, the page displays the shared empty state and no placeholder announcement.
4. The page shows the featured carousel when at least one published announcement exists:
   - If one or more published documents are explicitly featured, show those documents newest first.
   - Otherwise show the newest published document as the single fallback slide.
5. The reader may use carousel previous/next and pause/resume controls. Autoplay pauses while the carousel is hovered or focused and is disabled when reduced motion is requested. Manual navigation resets its interval; autoplay resumes once hover/focus pauses clear.
6. The reader searches title, summary, or body and/or chooses All or an available controlled category. Both controls compose and the results/status update.
7. If no results match, show a clear no-results state and a reset action.
8. The timeline includes only announcements with explicit, valid future `eventDate` values. Publication dates are not interpreted as event dates; optional deadlines and CTAs are displayed only when explicitly stored.

## Reader: sitewide announcement bar

1. The server selects one record from the same published CMS query before rendering the site shell. It respects `publishedAt`, optional `publicationEndsAt`, explicit deadline/event dates, status, type, and priority.
2. Selection order is IMPORTANT, active DEADLINE, explicitly eligible future event, then NOTICE; event promotion requires the CMS eligibility checkbox, the Events category, and an explicit future `eventDate`. Missing legacy eligibility is false. Within a class selection uses priority, publication time, and stable slug/ID ordering.
3. The bar uses an explicit safe CTA only. A missing or unsafe CTA produces text-only content. The message is not a link.
4. A deadline bar shows a UTC weekday/date and day-level remaining state. It refreshes at UTC midnight and removes its action after expiry; expired deadlines are not selected.
5. Visitors may dismiss an explicitly dismissible NOTICE or DEADLINE. The server verifies the record and cookie fingerprint; IMPORTANT cannot be dismissed. A later CMS edit changes the version fingerprint and permits redisplay.
6. If no eligible content exists, the bar is omitted and navigation remains at its original position. No automatic rotation or fabricated update count is shown.

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
2. The form retains title, slug, publication date, description, and body fields, and includes status, bar type, priority, publication end, explicit event-promotion eligibility, dismissible option, category, image, event date, deadline, and CTA metadata.
3. The administrator may select one controlled category or leave it unset, set draft/published/archived status, and choose whether to feature the announcement.
4. Selecting DEADLINE makes the explicit UTC deadline required. IMPORTANT disables dismissibility; DEADLINE can be dismissible only when its checkbox is enabled.
5. Saving validates required fields, slug, publication start/end, status, bar type, category membership, date/time values, event-promotion eligibility, priority range, image/CTA URLs, and CTA label/URL pairing on the server.
6. A new announcement creates one document. An edit updates the existing document ID, preserves its slug unless changed through the existing field, and preserves unrelated stored JSON properties.
7. Public routes, the site shell, and sitemap are revalidated using the existing CMS flow. No data migration or bulk update runs.
8. If an old announcement has no category or featured flag, it remains editable and public. Its category is not fabricated; if no published record is featured, the newest published record fills the carousel fallback.

## Data and failure behavior

- CMS/database errors must follow existing explicit error behavior; do not disguise failures as an empty successful result.
- Invalid/missing optional category values do not break rendering and do not generate filters.
- Legacy records without status or other optional fields remain usable; invalid optional dates and URLs are omitted safely.
- Existing detail routes, homepage announcement cards, sitemap entries, and published-content visibility remain compatible.
- The current development process has no `DATABASE_URL`; database-backed rendering and live CMS operations require a configured Neon environment and must be reported as blocked if unavailable.
