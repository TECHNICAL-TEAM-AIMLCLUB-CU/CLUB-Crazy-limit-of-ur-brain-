import { NextRequest, NextResponse } from 'next/server';
import { getSql, isSameOrigin, visitorHash } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_DAY = 3;

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real users never fill this. Pretend success so bots learn nothing.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const interest = clean(body.interest, 100);
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.length < 10) errors.message = 'Please write at least a short message (10+ characters).';
  if (Object.keys(errors).length) return NextResponse.json({ error: 'Validation failed.', errors }, { status: 422 });

  try {
    const hash = visitorHash(req);
    // Atomic insert-if-under-limit: at most MAX_PER_DAY submissions per hashed visitor per day.
    const rows = await getSql()`
      INSERT INTO join_requests (name, email, interest, message, ip_hash)
      SELECT ${name}, ${email}, ${interest || null}, ${message}, ${hash}
      WHERE (SELECT count(*) FROM join_requests WHERE ip_hash = ${hash} AND created_at > now() - interval '1 day') < ${MAX_PER_DAY}
      RETURNING id
    `;
    if (!rows.length) {
      return NextResponse.json({ error: 'Too many submissions today. Please try again tomorrow.' }, { status: 429 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('join POST failed:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 503 });
  }
}
