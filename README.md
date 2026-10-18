# AIML Club website

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres · built-in content studio · Hyperspeed background.

## Quick start

```bash
npm install
cp .env.example .env.local
# Set the environment variables below.
# Run db/schema.sql once in the Neon SQL editor.
npm run dev
```

The public website is a continuously scrolling landing page with anchor navigation. Detail routes remain available for search engines and direct links. The built-in content studio is at `/studio`.

## Environment variables

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URLs, sitemap, Open Graph |
| `DATABASE_URL` | **server only** | Neon Postgres connection |
| `COUNTER_SALT` | **server only** | Salt for daily visitor hashes |
| `CMS_ADMIN_EMAIL` | **server only** | CMS administrator login |
| `CMS_ADMIN_PASSWORD` | **server only** | Long, unique CMS password |
| `CMS_SESSION_SECRET` | **server only** | At least 32 random bytes for signing sessions |

Generate a session secret with `openssl rand -hex 32`. Never prefix database or CMS credentials with `NEXT_PUBLIC_`, and never commit `.env.local`.

## Built-in content studio

1. Configure `DATABASE_URL`, `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `CMS_SESSION_SECRET`.
2. Run `db/schema.sql` against the Neon database. It creates the CMS document table as well as the tables used by the join form and visitor counter.
3. Visit `/studio` and sign in with the configured administrator credentials.
4. Edit site settings or create and manage team members, events, projects, and announcements. The public pages read this data directly from Neon.

CMS image fields accept public HTTP(S) image URLs (the CMS does not upload image files). Long-form About and announcement copy is plain text with blank lines separating paragraphs. Event and announcement date/time fields are entered in UTC.

Sanity has been removed. Existing documents and uploaded images in a Sanity project are not migrated automatically; recreate the content in `/studio` and copy over any image URLs before disconnecting the old project.

## Architecture

- **Public shell:** `app/(site)/layout.tsx` mounts the fixed animated background, navigation, and footer.
- **One-page experience:** the homepage includes About, events, projects, team, announcements, and join sections. Navigation uses smooth in-page anchors; detail routes continue to work.
- **CMS:** `/studio` provides a protected admin login and content forms. Session cookies are HTTP-only, same-site, signed, and expire after eight hours. Content persists in the `cms_documents` JSONB table.
- **Data access:** `lib/queries.ts` loads published public content from Neon. `app/studio/actions.ts` validates and writes admin changes, then revalidates public routes.
- **Hyperspeed:** `components/Hyperspeed/*` is the background animation; `components/site/SiteBackground.tsx` provides reduced-motion and no-WebGL fallbacks.
- **Join form:** `components/site/JoinForm.tsx` stores submissions in `join_requests`. It validates server-side and limits each hashed visitor to three submissions per day.
- **Visitor counter:** `app/api/visits/route.ts` stores a daily salted hash rather than a raw IP address.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy

Deploy on Vercel or another Node.js host. Add the environment variables above and apply `db/schema.sql` to Neon before opening the site. Set a strong, unique CMS password and a random session secret in the deployment environment.
