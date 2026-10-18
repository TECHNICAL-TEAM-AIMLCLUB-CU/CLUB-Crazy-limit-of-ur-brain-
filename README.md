# AIML Club website

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Sanity CMS · Neon Postgres · Hyperspeed (three.js) background.

> **Status: generated, not yet run.** The environment this was written in had no network, so `npm install`,
> lint, type-check and `next build` have **not** been run. Only a TypeScript *syntax* check was run (clean).
> Dependency versions in `package.json` are best estimates; if `npm install` complains about peer versions
> (especially `next-sanity` / `sanity` / `styled-components`), adjust to the versions npm suggests.

## Quick start
```bash
npm install
cp .env.example .env.local     # fill in the values (see below)
# Neon: run db/schema.sql once in the Neon SQL editor
npm run dev                    # http://localhost:3000   (Studio at /studio)
npm run lint && npm run typecheck && npm run build
```
Without Sanity env vars the site still runs and shows empty states (a console warning is logged).

## Environment variables
| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` | public | Sanity identifiers (not secrets) |
| `DATABASE_URL` | **server only** | Neon connection string |
| `COUNTER_SALT` | **server only** | Salt for daily visitor hashes (`openssl rand -hex 32`) |

Never commit `.env*` (already git-ignored except `.env.example`). Set the same variables in Vercel.

## Sanity setup
1. Create a project at sanity.io (or `npx sanity init` and copy the project ID), put it in `.env.local`.
2. Add your site URL (and `http://localhost:3000`) under Sanity **API → CORS origins**, with credentials allowed, so Studio at `/studio` can load.
3. Open `/studio`. Fill **Site settings** (singleton) first, then add team members, events, projects, announcements.
4. The public site reads with `perspective: 'published'`: **drafts are never shown**; publish to make content live. Pages revalidate every 60 s.

CMS-managed: club name/tagline, hero headline & text, mission, vision, "what we do", About story, join text,
contact email, social links, academic-year text, team (portrait, role, department, bio, socials, order),
events (date/end, location, image, registration link), projects (status, tags, contributors, repo/demo links,
featured, order), announcements (slug, publication date, summary, rich body).
Placeholder copy in `lib/defaults.ts` shows only while a field is empty. Nothing about the club (stats, sponsors, emails, socials) is invented.

## Architecture
- **Shell:** `app/(site)/layout.tsx` (server) fetches settings, mounts one `SiteBackground`, `Navbar`, `Footer`. The Studio lives outside this group so it gets no site chrome.
- **Hyperspeed:** `components/Hyperspeed/*` is the unmodified React Bits source. `components/site/SiteBackground.tsx` loads it with `next/dynamic` (`ssr:false`), renders one fixed `pointer-events:none` layer, with a static gradient fallback (reduced motion, no WebGL, init error) and lighter settings on phones / ≤4-core devices. Your settings are used on desktop (racing, speed 0.5, boost 7, lime poles). `interactive` is off because the layer can't receive pointer events.
- **Hero parallax:** `components/site/Hero.tsx`. One rAF-throttled scroll listener + pointer listener write `translate3d` to layers with different `data-depth` (no React state per scroll). Full on fine-pointer desktops, ~20% on touch, off for reduced motion; stops when the hero is off-screen (IntersectionObserver).
- **Team grid:** `components/team/ExpandingTeamGrid.tsx` (see blocker below). Desktop: expanding panels (hover/focus/click, Esc closes). Touch: tap a tile to open details. Portraits are cropped 3:4 via the Sanity image URL builder.
- **Visitor counter:** `app/api/visits/route.ts` + `components/site/VisitCounter.tsx` (footer).
  *Rule:* a visit is counted once per browser session (HttpOnly session cookie) **and** once per salted daily hash of IP+user-agent; bots, prefetches and cross-origin posts never count; `GET` and component renders never increment; route changes don't count. The dedupe insert + increment are one atomic SQL statement. Only a hash is stored, never a raw IP. Labelled "Total Visits" (not unique people). Down DB → shows "—", page unaffected. Starts at 0.
  *Note:* the cookie is `Secure`; Chrome/Firefox accept it on `localhost`, Safari may not (the daily-hash dedupe still applies).
- **Join form:** `components/site/JoinForm.tsx` → `app/api/join/route.ts`. Server-side validation, honeypot, same-origin check, max 3 submissions/day per hashed visitor, stored in Neon `join_requests` (read them in the Neon console). No email is sent; add a delivery step (e.g. Resend) if you want notifications.
- **SEO:** per-page metadata + canonicals, generated OG image, `sitemap.xml` (includes announcements), `robots.txt` (blocks `/studio`, `/api/`).

## Known blockers / limitations
1. **React Bits Pro Expanding Grid is NOT installed.** It needs your license key and the Pro registry install, which couldn't be done here, and the registry package name couldn't be verified (`@reactbits-starter/expanding-grid-tw` was only from your notes). The Team page uses an in-repo fallback with the same data flow. To swap: install per the React Bits Pro docs (keep `REACTBITS_LICENSE_KEY` in local env only, never commit/print it), then replace `<ExpandingTeamGrid>` in `app/(site)/team/page.tsx`; the page already prepares `{name, role, department, bio, portraitUrl, socials}` per member.
2. **Nothing has been built or run** (see status above). Expect to fix small type/version issues on first `npm run typecheck` / `build`.
3. Logo is a simple inline SVG mark; there's no CMS logo field yet.
4. No automated tests are included. Manual counter checks: first load +1; same-session reload +0; private window +1 (per day per IP+UA); `curl -X POST` +0; wrong `DATABASE_URL` → "—" and the page still renders; `grep -r DATABASE_URL .next/static` finds nothing.
5. Visitor/join protection is privacy-friendly rather than airtight; add Vercel WAF/Turnstile if abuse appears.

## Deploy (Vercel)
Import the repo, add the env vars above, deploy. Run `db/schema.sql` on the Neon database first.
