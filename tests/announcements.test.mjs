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

const [feed, categories, metadata, utils, announcementBar] = await Promise.all([
  loadTypeScriptModule('../lib/announcement-feed.ts'),
  loadTypeScriptModule('../lib/announcement-categories.ts'),
  loadTypeScriptModule('../lib/announcement-metadata.ts'),
  loadTypeScriptModule('../lib/utils.ts'),
  loadTypeScriptModule('../lib/announcement-bar.ts'),
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

function makeBarAnnouncement(overrides = {}) {
  return {
    _id: 'bar-item',
    title: 'Announcement',
    slug: 'announcement',
    publishedAt: '2026-11-20T10:00:00.000Z',
    publicationStatus: 'published',
    announcementType: 'notice',
    priority: 0,
    ...overrides,
  };
}

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
  assert.equal(metadata.isValidAnnouncementPriority(0), true);
  assert.equal(metadata.isValidAnnouncementPriority(1000), true);
  assert.equal(metadata.isValidAnnouncementPriority(-1), false);
  assert.equal(metadata.isValidAnnouncementPriority(1001), false);
  assert.equal(metadata.isValidAnnouncementPriority(1.5), false);
  assert.equal(metadata.isValidAnnouncementPriority('5'), false);
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

test('announcement bar selects important, deadline, event, then notice in order', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const items = [
    makeBarAnnouncement({ _id: 'notice', priority: 1000 }),
    makeBarAnnouncement({
      _id: 'event',
      slug: 'event',
      category: 'events',
      announcementBarEventEligible: true,
      eventDate: '2026-11-21T10:00:00.000Z',
      priority: 0,
    }),
    makeBarAnnouncement({
      _id: 'deadline',
      slug: 'deadline',
      announcementType: 'deadline',
      deadline: '2026-11-23T10:00:00.000Z',
      priority: 0,
    }),
    makeBarAnnouncement({ _id: 'important', slug: 'important', announcementType: 'important' }),
  ];

  assert.equal(announcementBar.selectAnnouncementBar(items, now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id, 'important');
  assert.equal(announcementBar.selectAnnouncementBar(items.slice(0, 3), now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id, 'deadline');
  assert.equal(announcementBar.selectAnnouncementBar(items.slice(0, 2), now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id, 'event');
  assert.equal(announcementBar.selectAnnouncementBar(items.slice(0, 1), now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id, 'notice');
  assert.equal(announcementBar.selectAnnouncementBar([], now, new Set(), metadata.isValidAnnouncementDate), null);
});

test('announcement bar honors status and publication windows', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const items = [
    makeBarAnnouncement({ _id: 'draft', publicationStatus: 'draft' }),
    makeBarAnnouncement({ _id: 'archived', publicationStatus: 'archived' }),
    makeBarAnnouncement({ _id: 'future', publishedAt: '2026-11-21T12:00:00.000Z' }),
    makeBarAnnouncement({ _id: 'ended', publicationEndsAt: '2026-11-20T11:59:00.000Z' }),
    makeBarAnnouncement({ _id: 'invalid-end', publicationEndsAt: '2026-02-31T12:00:00.000Z' }),
    makeBarAnnouncement({ _id: 'legacy', publicationStatus: undefined }),
    makeBarAnnouncement({ _id: 'active', publicationEndsAt: '2026-11-21T12:00:00.000Z' }),
  ];

  assert.equal(
    announcementBar.selectAnnouncementBar(items, now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id,
    'active',
  );
});

test('announcement bar priority ties resolve by publication time then stable slug', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const items = [
    makeBarAnnouncement({ _id: 'old', slug: 'a', publishedAt: '2026-11-19T10:00:00.000Z', priority: 5 }),
    makeBarAnnouncement({ _id: 'newer-b', slug: 'b', publishedAt: '2026-11-20T11:00:00.000Z', priority: 5 }),
    makeBarAnnouncement({ _id: 'newer-a', slug: 'a', publishedAt: '2026-11-20T11:00:00.000Z', priority: 5 }),
  ];

  assert.equal(
    announcementBar.selectAnnouncementBar(items, now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id,
    'newer-a',
  );
});

test('explicit priority outranks recency within the same announcement class', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const items = [
    makeBarAnnouncement({ _id: 'newer-low', publishedAt: '2026-11-20T11:00:00.000Z', priority: 1 }),
    makeBarAnnouncement({ _id: 'older-high', publishedAt: '2026-11-19T11:00:00.000Z', priority: 8 }),
  ];

  assert.equal(
    announcementBar.selectAnnouncementBar(items, now, new Set(), metadata.isValidAnnouncementDate)?.announcement._id,
    'older-high',
  );
});

test('only explicitly eligible future event announcements rank above notices', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const notice = makeBarAnnouncement({
    _id: 'notice',
    slug: 'notice',
    priority: 1,
  });
  const upcomingEvent = makeBarAnnouncement({
    _id: 'event',
    slug: 'event',
    category: 'events',
    eventDate: '2026-11-21T10:00:00.000Z',
    priority: 0,
  });

  assert.equal(
    announcementBar.selectAnnouncementBar(
      [notice, upcomingEvent],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    )?.announcement._id,
    'notice',
  );
  assert.equal(
    announcementBar.selectAnnouncementBar(
      [notice, { ...upcomingEvent, announcementBarEventEligible: true }],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    )?.announcement._id,
    'event',
  );
  assert.notEqual(
    announcementBar.getAnnouncementFingerprint(upcomingEvent),
    announcementBar.getAnnouncementFingerprint({
      ...upcomingEvent,
      announcementBarEventEligible: true,
    }),
  );
  assert.equal(
    announcementBar.selectAnnouncementBar(
      [notice, {
        ...upcomingEvent,
        announcementBarEventEligible: true,
        eventDate: '2026-11-19T10:00:00.000Z',
      }],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    )?.announcement._id,
    'notice',
  );
});

test('deadline bars require a future explicit deadline and use UTC day-level copy', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const makeDeadline = (deadline) => makeBarAnnouncement({
    announcementType: 'deadline',
    deadline,
  });

  assert.equal(
    announcementBar.selectAnnouncementBar(
      [makeDeadline('2026-11-20T18:00:00.000Z')],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    )?.type,
    'deadline',
  );
  assert.equal(metadata.getAnnouncementDeadlineStatus('2026-11-20T18:00:00.000Z', now), 'Closes today');
  assert.equal(metadata.getAnnouncementDeadlineStatus('2026-11-23T18:00:00.000Z', now), '3 days left');
  assert.equal(metadata.getAnnouncementDeadlineStatus('2026-11-19T18:00:00.000Z', now), 'Closed');
  const beforeUtcMidnight = Date.parse('2026-11-20T23:59:00.000Z');
  const afterUtcMidnight = Date.parse('2026-11-21T00:00:00.000Z');
  const midnightDeadline = '2026-11-21T00:01:00.000Z';
  assert.equal(metadata.getAnnouncementDeadlineStatus(midnightDeadline, beforeUtcMidnight), '1 day left');
  assert.equal(metadata.getAnnouncementDeadlineStatus(midnightDeadline, afterUtcMidnight), 'Closes today');
  assert.equal(utils.formatAnnouncementDeadline('2026-11-21T00:30:00+05:30'), 'Fri, 20 Nov 2026');
  assert.equal(
    announcementBar.selectAnnouncementBar(
      [makeDeadline('2026-11-19T18:00:00.000Z')],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    ),
    null,
  );
  assert.equal(
    announcementBar.selectAnnouncementBar(
      [makeDeadline(undefined)],
      now,
      new Set(),
      metadata.isValidAnnouncementDate,
    ),
    null,
  );
  const noAction = makeDeadline('2026-11-23T18:00:00.000Z');
  noAction.ctaLabel = 'Apply';
  noAction.ctaUrl = 'javascript:alert(1)';
  const selected = announcementBar.selectAnnouncementBar(
    [noAction],
    now,
    new Set(),
    metadata.isValidAnnouncementDate,
  );
  assert.equal(selected?.announcement.ctaUrl, 'javascript:alert(1)');
  assert.equal(utils.safeAnnouncementUrl(selected?.announcement.ctaUrl), null);
});

test('dismissals apply only to a matching dismissible announcement version', () => {
  const now = Date.parse('2026-11-20T12:00:00.000Z');
  const dismissible = makeBarAnnouncement({ dismissible: true });
  const fingerprint = announcementBar.getAnnouncementFingerprint(dismissible);
  const dismissed = new Set([fingerprint]);
  const updated = { ...dismissible, summary: 'Updated message' };
  const republished = { ...dismissible, updatedAt: '2026-11-20T11:00:00.000Z' };
  const important = { ...dismissible, announcementType: 'important' };
  const deadline = {
    ...dismissible,
    announcementType: 'deadline',
    deadline: '2026-11-23T10:00:00.000Z',
  };

  assert.equal(
    announcementBar.selectAnnouncementBar([dismissible], now, dismissed, metadata.isValidAnnouncementDate),
    null,
  );
  assert.equal(
    announcementBar.selectAnnouncementBar([updated], now, dismissed, metadata.isValidAnnouncementDate)?.announcement.summary,
    'Updated message',
  );
  assert.notEqual(announcementBar.getAnnouncementFingerprint(republished), fingerprint);
  assert.equal(
    announcementBar.selectAnnouncementBar([republished], now, dismissed, metadata.isValidAnnouncementDate)?.announcement._id,
    'bar-item',
  );
  assert.equal(
    announcementBar.selectAnnouncementBar([important], now, dismissed, metadata.isValidAnnouncementDate)?.type,
    'important',
  );
  assert.equal(
    announcementBar.isAnnouncementDismissible(important),
    false,
  );
  assert.equal(
    announcementBar.isAnnouncementDismissible(deadline),
    true,
  );
  assert.equal(
    announcementBar.isAnnouncementDismissible({ ...deadline, dismissible: false }),
    false,
  );
  assert.equal(
    announcementBar.isAnnouncementDismissible({ ...dismissible, announcementType: 'notice' }),
    true,
  );
});

test('site-relative announcement URLs stay local; unsafe destinations are omitted', () => {
  assert.equal(utils.safeAnnouncementUrl('/announcements/workshop?source=bar#details'), '/announcements/workshop?source=bar#details');
  assert.equal(utils.safeAnnouncementUrl('https://example.com/apply'), 'https://example.com/apply');
  assert.equal(utils.safeAnnouncementUrl('mailto:club@example.com'), 'mailto:club@example.com');
  assert.equal(utils.safeAnnouncementUrl(undefined), null);
  assert.equal(utils.safeAnnouncementUrl('//example.com/path'), null);
  assert.equal(utils.safeAnnouncementUrl('/\\\\example.com/path'), null);
  assert.equal(utils.safeAnnouncementUrl('javascript:alert(1)'), null);
  assert.equal(utils.formatAnnouncementDeadline('2026-11-23T10:00:00.000Z'), 'Mon, 23 Nov 2026');
});
