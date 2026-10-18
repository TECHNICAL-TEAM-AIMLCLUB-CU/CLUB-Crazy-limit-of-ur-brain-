import { NextRequest, NextResponse } from 'next/server';
import { getSql, isSameOrigin, visitorHash } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'aiml_visit';
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|preview/i;

async function readTotal(): Promise<number> {
  const rows = await getSql()`SELECT value FROM site_stats WHERE key = 'total_visits'`;
  return rows.length ? Number(rows[0].value) : 0;
}

// GET: read-only, never increments.
export async function GET() {
  try {
    return NextResponse.json(
      { total: await readTotal() },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } },
    );
  } catch (error) {
    console.error('visits GET failed:', error);
    return NextResponse.json({ total: null }, { status: 503 });
  }
}

// POST: one visit per browser session AND per hashed visitor per day.
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') ?? '';
    const purpose = `${req.headers.get('sec-purpose') ?? ''}${req.headers.get('purpose') ?? ''}`;
    if (!isSameOrigin(req) || !ua || BOT.test(ua) || /prefetch|prerender/i.test(purpose) || req.cookies.has(COOKIE)) {
      return NextResponse.json({ total: await readTotal(), counted: false });
    }

    const hash = visitorHash(req);
    const sql = getSql();
    // One statement = atomic: dedupe insert and increment succeed together; concurrent requests can't lose updates.
    const rows = await sql`
      WITH ins AS (
        INSERT INTO visit_dedupe (h, day) VALUES (${hash}, current_date)
        ON CONFLICT DO NOTHING
        RETURNING 1
      ),
      bump AS (
        INSERT INTO site_stats (key, value)
        SELECT 'total_visits', 1 FROM ins
        ON CONFLICT (key) DO UPDATE SET value = site_stats.value + 1
        RETURNING value
      )
      SELECT
        COALESCE((SELECT value FROM bump), (SELECT value FROM site_stats WHERE key = 'total_visits'), 0) AS total,
        EXISTS (SELECT 1 FROM ins) AS counted
    `;
    const total = Number(rows[0].total);
    const counted = Boolean(rows[0].counted);

    if (counted && Math.random() < 0.02) {
      await sql`DELETE FROM visit_dedupe WHERE day < current_date - 1`;
    }

    const res = NextResponse.json({ total, counted });
    res.cookies.set(COOKIE, '1', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' }); // session cookie
    return res;
  } catch (error) {
    console.error('visits POST failed:', error);
    return NextResponse.json({ total: null, counted: false }, { status: 503 });
  }
}
