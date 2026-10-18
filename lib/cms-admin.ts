import 'server-only';
import { randomUUID } from 'node:crypto';
import { getSql } from './db';

export const CMS_COLLECTIONS = ['settings', 'team', 'events', 'projects', 'announcements'] as const;
export type CmsCollection = (typeof CMS_COLLECTIONS)[number];

export interface CmsDocument {
  id: string;
  data: Record<string, unknown>;
}

export function isCmsCollection(value: unknown): value is CmsCollection {
  return typeof value === 'string' && CMS_COLLECTIONS.includes(value as CmsCollection);
}

export async function getCmsDocuments(collection: CmsCollection): Promise<CmsDocument[]> {
  const rows = await getSql()`
    SELECT id, data
    FROM cms_documents
    WHERE collection = ${collection}
    ORDER BY updated_at DESC, id
  `;
  return rows.map((row) => ({
    id: String(row.id),
    data: row.data as Record<string, unknown>,
  }));
}

export async function saveCmsDocument(
  collection: CmsCollection,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const documentId = collection === 'settings' ? 'main' : id || randomUUID();
  await getSql()`
    INSERT INTO cms_documents (collection, id, data)
    VALUES (${collection}, ${documentId}, ${JSON.stringify(data)}::jsonb)
    ON CONFLICT (collection, id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}

export async function deleteCmsDocument(collection: CmsCollection, id: string): Promise<void> {
  if (collection === 'settings') throw new Error('The site settings document cannot be deleted');
  await getSql()`DELETE FROM cms_documents WHERE collection = ${collection} AND id = ${id}`;
}
