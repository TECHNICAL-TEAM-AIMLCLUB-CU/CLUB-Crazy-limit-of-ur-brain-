import 'server-only';
import { createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import type { NextRequest } from 'next/server';

export function getSql() {
  const url = process.env.DATABASE_URL; // server-only
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

/** Salted hash of (day + IP + user-agent). Rotates daily; the raw IP is never stored. */
export function visitorHash(req: NextRequest): string {
  const salt = process.env.COUNTER_SALT;
  if (!salt) throw new Error('COUNTER_SALT is not set');
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const ua = req.headers.get('user-agent') ?? '';
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${salt}|${day}|${ip}|${ua}`).digest('hex');
}

export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
}
