import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdminAuthenticated, isAdminConfigured } from '@/lib/admin-auth';
import {
  CMS_COLLECTIONS,
  getCmsDocuments,
  isCmsCollection,
  type CmsCollection,
} from '@/lib/cms-admin';
import { getSettings } from '@/lib/queries';
import { deleteDocumentAction, loginAction, logoutAction, saveDocumentAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Content studio' };

const COLLECTION_LABELS: Record<CmsCollection, string> = {
  settings: 'Site settings',
  team: 'Team',
  events: 'Events',
  projects: 'Projects',
  announcements: 'Announcements',
};

const EMPTY_DOCUMENTS: Record<Exclude<CmsCollection, 'settings'>, Record<string, unknown>> = {
  team: { name: '', role: '', department: '', bio: '', order: '', portrait: {}, socials: [] },
  events: { title: '', date: '', endDate: '', location: '', description: '', registrationUrl: '', image: {} },
  projects: { title: '', summary: '', status: 'ongoing', tags: [], contributors: [], repoUrl: '', demoUrl: '', featured: false, order: '', image: {} },
  announcements: { title: '', slug: '', publishedAt: new Date().toISOString(), summary: '', body: '' },
};

const inputClass =
  'mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-brand-cyan';
const labelClass = 'block text-sm font-medium text-fg';

function readText(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function readImage(data: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = data[key];
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function displayDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
}

function jsonList(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return JSON.stringify(Array.isArray(value) ? value : [], null, 2);
}

function TextField({
  name,
  label,
  value,
  required = false,
  type = 'text',
  helper,
}: {
  name: string;
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  helper?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input name={name} type={type} defaultValue={value} required={required} className={inputClass} />
      {helper && <span className="mt-1 block text-xs font-normal text-muted">{helper}</span>}
    </label>
  );
}

function TextArea({
  name,
  label,
  value,
  rows = 4,
  required = false,
  helper,
}: {
  name: string;
  label: string;
  value: string;
  rows?: number;
  required?: boolean;
  helper?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <textarea name={name} defaultValue={value} rows={rows} required={required} className={inputClass} />
      {helper && <span className="mt-1 block text-xs font-normal text-muted">{helper}</span>}
    </label>
  );
}

function JsonListField({ name, label, value, helper }: { name: string; label: string; value: string; helper: string }) {
  return (
    <TextArea
      name={name}
      label={label}
      value={value}
      rows={6}
      helper={`${helper} Use valid JSON, for example: ${name === 'socials' ? '[{"platform":"Instagram","url":"https://example.com"}]' : '[{"title":"Workshops","description":"Hands-on learning"}]'}`}
    />
  );
}

function DocumentFields({ collection, data }: { collection: CmsCollection; data: Record<string, unknown> }) {
  if (collection === 'settings') {
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="clubName" label="Club name" value={readText(data, 'clubName')} />
          <TextField name="tagline" label="Tagline" value={readText(data, 'tagline')} />
          <TextField name="heroHeadline" label="Hero headline" value={readText(data, 'heroHeadline')} />
          <TextField name="academicYear" label="Academic year" value={readText(data, 'academicYear')} />
        </div>
        <TextArea name="heroSubtext" label="Hero text" value={readText(data, 'heroSubtext')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea name="mission" label="Mission" value={readText(data, 'mission')} />
          <TextArea name="vision" label="Vision" value={readText(data, 'vision')} />
        </div>
        <JsonListField name="activities" label="Activities" value={jsonList(data, 'activities')} helper="Each item needs a title and may include a description." />
        <TextArea name="aboutBody" label="About story" value={readText(data, 'aboutBody')} rows={8} helper="Separate paragraphs with a blank line." />
        <TextArea name="joinText" label="Join page text" value={readText(data, 'joinText')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="contactEmail" label="Contact email" value={readText(data, 'contactEmail')} type="email" />
          <JsonListField name="socials" label="Social links" value={jsonList(data, 'socials')} helper="Each item needs a platform and URL." />
        </div>
      </>
    );
  }

  if (collection === 'team') {
    const portrait = readImage(data, 'portrait');
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Name" value={readText(data, 'name')} required />
          <TextField name="role" label="Role" value={readText(data, 'role')} required />
          <TextField name="department" label="Department" value={readText(data, 'department')} />
          <TextField name="order" label="Display order" value={readText(data, 'order')} type="number" />
        </div>
        <TextArea name="bio" label="Bio" value={readText(data, 'bio')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="portraitUrl" label="Portrait image URL" value={readText(portrait, 'url')} type="url" />
          <TextField name="portraitAlt" label="Portrait alt text" value={readText(portrait, 'alt')} />
        </div>
        <JsonListField name="socials" label="Social links" value={jsonList(data, 'socials')} helper="Each item needs a platform and URL." />
      </>
    );
  }

  if (collection === 'events') {
    const image = readImage(data, 'image');
    return (
      <>
        <TextField name="title" label="Event title" value={readText(data, 'title')} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="date" label="Start date (UTC)" value={displayDate(data.date)} type="datetime-local" required />
          <TextField name="endDate" label="End date (UTC, optional)" value={displayDate(data.endDate)} type="datetime-local" />
          <TextField name="location" label="Location" value={readText(data, 'location')} />
          <TextField name="registrationUrl" label="Registration URL" value={readText(data, 'registrationUrl')} type="url" />
        </div>
        <TextArea name="description" label="Description" value={readText(data, 'description')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="imageUrl" label="Image URL" value={readText(image, 'url')} type="url" />
          <TextField name="imageAlt" label="Image alt text" value={readText(image, 'alt')} />
        </div>
      </>
    );
  }

  if (collection === 'projects') {
    const image = readImage(data, 'image');
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="title" label="Project title" value={readText(data, 'title')} required />
          <label className={labelClass}>
            Status
            <select name="status" defaultValue={readText(data, 'status') || 'ongoing'} className={inputClass}>
              <option value="ongoing">Ongoing</option>
              <option value="available">Available</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <TextArea name="summary" label="Summary" value={readText(data, 'summary')} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea name="tags" label="Tags" value={Array.isArray(data.tags) ? data.tags.join(', ') : ''} rows={2} helper="Separate values with commas or new lines." />
          <TextArea name="contributors" label="Contributors" value={Array.isArray(data.contributors) ? data.contributors.join(', ') : ''} rows={2} helper="Separate values with commas or new lines." />
          <TextField name="repoUrl" label="Repository URL" value={readText(data, 'repoUrl')} type="url" />
          <TextField name="demoUrl" label="Live demo URL" value={readText(data, 'demoUrl')} type="url" />
          <TextField name="order" label="Display order" value={readText(data, 'order')} type="number" />
          <TextField name="imageUrl" label="Image URL" value={readText(image, 'url')} type="url" />
          <TextField name="imageAlt" label="Image alt text" value={readText(image, 'alt')} />
        </div>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" name="featured" defaultChecked={data.featured === true} className="accent-brand-cyan" />
          Feature this project
        </label>
      </>
    );
  }

  return (
    <>
      <TextField name="title" label="Announcement title" value={readText(data, 'title')} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="slug" label="URL slug" value={readText(data, 'slug')} required helper="Lowercase letters, numbers, and hyphens only." />
      <TextField name="publishedAt" label="Publish date (UTC)" value={displayDate(data.publishedAt)} type="datetime-local" required />
      </div>
      <TextArea name="summary" label="Summary" value={readText(data, 'summary')} />
      <TextArea name="body" label="Announcement body" value={readText(data, 'body')} rows={10} helper="Separate paragraphs with a blank line." />
    </>
  );
}

function ErrorNotice({ error }: { error?: string }) {
  const messages: Record<string, string> = {
    login: 'Email or password is incorrect.',
    required: 'Fill in all required fields before saving.',
    'invalid-arrays': 'Activities and social links must be valid JSON arrays with the required fields.',
    'invalid-fields': 'Check dates, image URLs, and external links; only valid HTTP(S) URLs are accepted.',
    'invalid-email': 'Enter a valid contact email address.',
    'invalid-collection': 'That content collection or document is not valid.',
    'duplicate-slug': 'That announcement URL slug is already in use. Choose another one.',
  };
  const message = error ? messages[error] : undefined;
  return message ? <p role="alert" className="mb-5 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{message}</p> : null;
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; document?: string; error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const collection = isCmsCollection(params.collection) ? params.collection : 'settings';

  return (
    <main className="min-h-svh bg-bg px-5 py-10 text-fg sm:px-8">
      <div className="mx-auto max-w-6xl">
        {!isAdminConfigured() ? (
          <section className="max-w-2xl rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h1 className="font-display text-3xl font-semibold">Set up the content studio</h1>
            <p className="mt-4 text-muted">Configure these server-only environment variables before signing in:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 font-mono text-sm text-brand-cyan">
              <li>CMS_ADMIN_EMAIL</li>
              <li>CMS_ADMIN_PASSWORD (use a long, unique password)</li>
              <li>CMS_SESSION_SECRET (at least 32 random bytes)</li>
            </ul>
            <p className="mt-4 text-sm text-muted">Also create the CMS tables by running <code>db/schema.sql</code> against your Neon database.</p>
          </section>
        ) : !(await isAdminAuthenticated()) ? (
          <section className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h1 className="font-display text-3xl font-semibold">Content studio</h1>
            <p className="mt-2 text-sm text-muted">Sign in to manage the club website.</p>
            <ErrorNotice error={params.error} />
            <form action={loginAction} className="mt-6 space-y-4">
              <label className={labelClass}>
                Email
                <input name="email" type="email" autoComplete="username" required className={inputClass} />
              </label>
              <label className={labelClass}>
                Password
                <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
              </label>
              <button className="w-full rounded-full bg-brand-cyan px-5 py-3 text-sm font-semibold text-bg hover:brightness-110">
                Sign in
              </button>
            </form>
          </section>
        ) : (
          <AdminStudio collection={collection} documentId={params.document} error={params.error} saved={params.saved === '1'} />
        )}
      </div>
    </main>
  );
}

async function AdminStudio({
  collection,
  documentId,
  error,
  saved,
}: {
  collection: CmsCollection;
  documentId?: string;
  error?: string;
  saved: boolean;
}) {
  const docs =
    collection === 'settings'
      ? [{ id: 'main', data: (await getSettings()) as Record<string, unknown> }]
      : await getCmsDocuments(collection);
  const requestedId = collection === 'settings' ? 'main' : documentId === 'new' ? '' : documentId;
  const selected = docs.find((doc) => doc.id === requestedId) ?? (documentId ? undefined : docs[0]);
  if (documentId && documentId !== 'new' && !selected) notFound();
  const selectedId = collection === 'settings' ? 'main' : documentId === 'new' ? '' : selected?.id || '';
  const data =
    collection === 'settings'
      ? docs[0].data
      : selected?.data ?? EMPTY_DOCUMENTS[collection];
  const createHref = `/studio?collection=${collection}&document=new`;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-cyan">AIML Club</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Content studio</h1>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-line-strong px-4 py-2 text-sm text-muted hover:text-fg">Sign out</button>
        </form>
      </header>

      <nav aria-label="Content collections" className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
        {CMS_COLLECTIONS.map((item) => (
          <Link
            key={item}
            href={`/studio?collection=${item}`}
            aria-current={collection === item ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm ${collection === item ? 'bg-brand-cyan font-semibold text-bg' : 'bg-surface text-muted hover:text-fg'}`}
          >
            {COLLECTION_LABELS[item]}
          </Link>
        ))}
      </nav>

      <div className="mt-7 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="h-fit rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold">{COLLECTION_LABELS[collection]}</h2>
            {collection !== 'settings' && (
              <Link href={createHref} className="rounded-full bg-brand-cyan px-3 py-1.5 text-xs font-semibold text-bg">
                New
              </Link>
            )}
          </div>
          {collection === 'settings' ? (
            <p className="mt-3 text-sm text-muted">One document controls the public site.</p>
          ) : docs.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <Link
                    href={`/studio?collection=${collection}&document=${encodeURIComponent(doc.id)}`}
                    aria-current={selectedId === doc.id ? 'page' : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm ${selectedId === doc.id ? 'bg-surface-2 text-brand-cyan' : 'text-muted hover:text-fg'}`}
                  >
                    {readText(doc.data, 'title') || readText(doc.data, 'name') || doc.id}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No content yet. Use New to add the first item.</p>
          )}
        </aside>

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
          <ErrorNotice error={error} />
          {saved && <p role="status" className="mb-5 rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-3 text-sm text-brand-cyan">Changes saved.</p>}
          <h2 className="font-display text-2xl font-semibold">
            {collection === 'settings'
              ? 'Site settings'
              : selected
                ? `Edit ${readText(data, 'title') || readText(data, 'name') || 'content'}`
                : `New ${COLLECTION_LABELS[collection].replace(/s$/, '').toLowerCase()}`}
          </h2>
          <form action={saveDocumentAction} className="mt-6 space-y-5">
            <input type="hidden" name="collection" value={collection} />
            <input type="hidden" name="id" value={selectedId} />
            <DocumentFields collection={collection} data={data} />
            <div className="flex flex-wrap gap-3 border-t border-line pt-5">
              <button className="rounded-full bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110">
                Save changes
              </button>
            </div>
          </form>
          {collection !== 'settings' && selected && (
            <form action={deleteDocumentAction} className="mt-3">
              <input type="hidden" name="collection" value={collection} />
              <input type="hidden" name="id" value={selected.id} />
              <button className="rounded-full border border-red-500/50 px-5 py-2.5 text-sm text-red-300 hover:bg-red-950/40">
                Delete
              </button>
            </form>
          )}
          <p className="mt-5 text-xs text-muted">Image fields accept public HTTP(S) image URLs. Content changes appear on the public site after saving.</p>
        </section>
      </div>
    </>
  );
}
