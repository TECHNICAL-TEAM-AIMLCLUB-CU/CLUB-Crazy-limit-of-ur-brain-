import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function loadTypeScriptModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
  return import(moduleUrl);
}

const [feed, categories, metadata, utils] = await Promise.all([
  loadTypeScriptModule('../lib/announcement-feed.ts'),
  loadTypeScriptModule('../lib/announcement-categories.ts'),
  loadTypeScriptModule('../lib/announcement-metadata.ts'),
  loadTypeScriptModule('../lib/utils.ts'),
]);

const announcements = [
  {
    _id: 'legacy',
    title: 'Club update',
    slug: 'club-update',
    publishedAt: '2026-01-03T00:00:00.000Z',
    summary: 'A new club update',
  },
  {
    _id: 'event',
    title: 'Workshop registration',
    slug: 'workshop-registration',
    publishedAt: '2026-01-02T00:00:00.000Z',
    category: 'workshops',
    body: 'Register for the robotics workshop.',
  },
  {
    _id: 'featured',
    title: 'Featured opportunity',
    slug: 'featured-opportunity',
    publishedAt: '2026-01-01T00:00:00.000Z',
    category: 'opportunities',
    featured: true,
  },
];

test('required filters remain available without inventing legacy categories', () => {
  const allCategories = categories.ANNOUNCEMENT_CATEGORIES.map(({ value }) => value);
  const available = feed.getAvailableAnnouncementCategories(
    announcements,
    allCategories,
    categories.REQUIRED_ANNOUNCEMENT_FILTERS,
  );

  assert.deepEqual(available, [
    'events',
    'workshops',
    'opportunities',
    'notices',
  ]);
  assert.equal(announcements[0].category, undefined);
  assert.equal(categories.announcementCategoryLabel(undefined), 'Club Update');
  assert.equal(categories.announcementCategoryLabel('unrecognized'), 'Club Update');
});

test('search and category filters compose across title, summary, and body', () => {
  const all = feed.filterAnnouncements(announcements, null, '');
  const matching = feed.filterAnnouncements(announcements, 'workshops', 'REGISTRATION');
  const bodyMatch = feed.filterAnnouncements(announcements, null, 'robotics workshop');
  const empty = feed.filterAnnouncements(announcements, 'events', 'robotics');

  assert.equal(all.length, 3);
  assert.deepEqual(matching.map(({ _id }) => _id), ['event']);
  assert.deepEqual(bodyMatch.map(({ _id }) => _id), ['event']);
  assert.deepEqual(empty, []);
});

test('featured items take precedence; otherwise the newest item is the fallback', () => {
  assert.deepEqual(
    feed.getFeaturedAnnouncements(announcements).map(({ _id }) => _id),
    ['featured'],
  );
  assert.deepEqual(
    feed.getFeaturedAnnouncements(announcements.slice(0, 2)).map(({ _id }) => _id),
    ['legacy'],
  );
  assert.deepEqual(feed.getFeaturedAnnouncements([]), []);
});

test('publication status, CTA pair, and UTC date inputs are validated', () => {
  assert.equal(metadata.isAnnouncementPublicationStatus('draft'), true);
  assert.equal(metadata.isAnnouncementPublicationStatus('scheduled'), false);
  assert.equal(metadata.hasCompleteAnnouncementCta('', undefined), true);
  assert.equal(metadata.hasCompleteAnnouncementCta('Apply', 'https://example.com/apply'), true);
  assert.equal(metadata.hasCompleteAnnouncementCta('Apply', undefined), false);
  assert.equal(metadata.hasCompleteAnnouncementCta('', 'https://example.com/apply'), false);
  assert.equal(metadata.parseUtcDateTimeLocal('2024-02-29T23:59'), '2024-02-29T23:59:00.000Z');
  assert.equal(metadata.parseUtcDateTimeLocal('2025-02-29T23:59'), null);
  assert.equal(metadata.parseUtcDateTimeLocal('2024-01-01T24:00'), null);
  assert.equal(metadata.parseUtcDateTimeLocal(''), '');
});

test('event dates reject impossible calendar/time values and accept explicit offsets', () => {
  assert.equal(metadata.isValidAnnouncementDate('2026-02-31T12:00:00.000Z'), false);
  assert.equal(metadata.isValidAnnouncementDate('2026-05-01T24:00Z'), false);
  assert.equal(metadata.isValidAnnouncementDate('2026-05-01T12:30:00+05:30'), true);
  assert.equal(metadata.isValidAnnouncementDate('2026-05-01'), false);
});

test('upcoming timeline uses only explicit valid future event dates', () => {
  const now = Date.parse('2026-01-01T00:00:00.000Z');
  const items = [
    { _id: 'publication-only', publishedAt: '2026-02-01T00:00:00.000Z' },
    { _id: 'past-event', eventDate: '2025-12-31T00:00:00.000Z' },
    { _id: 'invalid-event', eventDate: '2026-02-31T12:00:00.000Z' },
    { _id: 'later-event', eventDate: '2026-04-01T00:00:00.000Z' },
    { _id: 'sooner-event', eventDate: '2026-03-01T00:00:00.000Z' },
  ];

  assert.deepEqual(
    metadata.getUpcomingAnnouncements(items, now).map(({ _id }) => _id),
    ['sooner-event', 'later-event'],
  );
});

test('CMS URLs only allow safe HTTP(S) destinations for URL fields', () => {
  assert.equal(utils.safeHttpUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(utils.safeHttpUrl('mailto:club@example.com'), null);
  assert.equal(utils.safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(utils.safeHttpUrl('/relative/path'), null);
  assert.equal(utils.imageUrl({ url: 'javascript:alert(1)' }), null);
});
