# Repository guidance

- Read `README.md` and the relevant specifications in `docs/` before changing site architecture or Signal Room behavior.
- Preserve the existing Next.js App Router, React, TypeScript, Tailwind, Neon JSONB CMS, `/studio` authentication, and Lightfall site background.
- Public announcements must use `getAnnouncements()` / `getAnnouncement()` and existing server-side CMS actions. Do not add a database, CMS, auth system, or client-side database writes.
- Keep optional announcement metadata backward-compatible; preserve document IDs, slugs, unrelated JSON properties, and existing routes. Validate CMS input server-side and sanitize rendered URLs.
- `publishedAt` is the publication time. Only explicit `eventDate` and `deadline` values may be presented as event/deadline metadata.
- Do not commit credentials, `.env` files, or unrelated user files.
- Validate code changes with `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` as applicable.
