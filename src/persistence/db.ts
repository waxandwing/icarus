import { type IDBPDatabase, openDB } from 'idb';
import { CURRENT_SCHEMA_VERSION } from '../domain/seed';
import type { WorkspaceDomainState } from '../domain/types';

const DB_NAME = 'arc-workspace';
const DB_VERSION = 1;
const STORE = 'snapshots';
const KEY = 'current';

export interface PersistedWorkspace {
  domain: WorkspaceDomainState;
  undo: { label: string; snapshot: WorkspaceDomainState } | null;
  savedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Versioned migration layer. Every persisted-shape change gets an explicit
 * schema branch so existing teacher work upgrades in place instead of being
 * reset or silently reinterpreted.
 */
export function migratePersisted(raw: PersistedWorkspace): PersistedWorkspace {
  const domain: WorkspaceDomainState = {
    ...raw.domain,
    calendar: { ...raw.domain.calendar, days: { ...raw.domain.calendar.days } },
    notes: { ...raw.domain.notes },
  };

  if (domain.isSampleWorkspace === undefined) domain.isSampleWorkspace = false;

  const startingVersion = domain.schemaVersion || 1;
  if (startingVersion < 2) {
    // v2 introduces optional Task date association and the expanded school-day
    // vocabulary (testing / special schedule). Existing v1 records are already
    // semantically valid, so migration preserves every object and placement and
    // advances only the explicit schema contract.
    domain.schemaVersion = 2;
  }

  if (domain.schemaVersion < CURRENT_SCHEMA_VERSION) {
    throw new Error(`Arc: missing migration from schema ${domain.schemaVersion} to ${CURRENT_SCHEMA_VERSION}.`);
  }

  return { ...raw, domain };
}

export async function loadPersisted(): Promise<PersistedWorkspace | null> {
  try {
    const db = await getDb();
    const raw = (await db.get(STORE, KEY)) as PersistedWorkspace | undefined;
    if (!raw) return null;
    return migratePersisted(raw);
  } catch (err) {
    console.error('Arc: failed to load persisted workspace, starting fresh.', err);
    return null;
  }
}

export async function savePersisted(data: PersistedWorkspace): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE, data, KEY);
  } catch (err) {
    console.error('Arc: failed to persist workspace.', err);
  }
}

export async function clearPersisted(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE, KEY);
  } catch (err) {
    console.error('Arc: failed to clear persisted workspace.', err);
  }
}
