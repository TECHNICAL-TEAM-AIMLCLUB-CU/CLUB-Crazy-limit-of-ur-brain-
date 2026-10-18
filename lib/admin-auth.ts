import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'aiml_cms_session';
const SESSION_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.CMS_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('CMS_SESSION_SECRET must contain at least 32 bytes');
  }
  return secret;
}

function equalSecret(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.CMS_ADMIN_EMAIL &&
      process.env.CMS_ADMIN_PASSWORD &&
      process.env.CMS_ADMIN_PASSWORD.length >= 12 &&
      process.env.CMS_SESSION_SECRET &&
      Buffer.byteLength(process.env.CMS_SESSION_SECRET) >= 32,
  );
}

export function checkAdminCredentials(email: string, password: string): boolean {
  const configuredEmail = process.env.CMS_ADMIN_EMAIL;
  const configuredPassword = process.env.CMS_ADMIN_PASSWORD;
  if (!configuredEmail || !configuredPassword || !isAdminConfigured()) return false;
  return equalSecret(email.trim().toLowerCase(), configuredEmail.trim().toLowerCase()) &&
    equalSecret(password, configuredPassword);
}

export function createAdminSession(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), expiresAt: Date.now() + SESSION_SECONDS * 1000 }),
  ).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function isValidAdminSession(token?: string): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;

  const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    return (
      typeof session.email === 'string' &&
      session.email === process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase() &&
      typeof session.expiresAt === 'number' &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) throw new Error('Administrator authentication required');
}

export const adminSessionSeconds = SESSION_SECONDS;
