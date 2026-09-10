import { type IDBPDatabase, openDB } from 'idb';
import { CURRENT_SCHEMA_VERSION } from '../domain/seed';
import type { Lesson, WorkspaceDomainState } from '../domain/types';

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
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

function migrateDomain(rawDomain: WorkspaceDomainState): WorkspaceDomainState {
  const domain: WorkspaceDomainState = {
    ...rawDomain,
    calendar: { ...rawDomain.calendar, days: { ...rawDomain.calendar.days } },
    lessons: { ...rawDomain.lessons },
    notes: { ...rawDomain.notes },
  };

  if (domain.isSampleWorkspace === undefined) domain.isSampleWorkspace = false;

  const startingVersion = domain.schemaVersion || 1;
  if (startingVersion < 2) {
    // v2 introduces optional Task date association and expanded school-day vocabulary.
    domain.schemaVersion = 2;
  }

  if (domain.schemaVersion < 3) {
    // v3 adds ordered structured Lesson fields. Existing freeform body text is
    // deliberately preserved as body rather than reinterpreted as a field.
    // Every old lesson gains an empty field array, retaining ids, placement,
    // section scope, visibility and all teacher-authored text exactly as-is.
    domain.lessons = Object.fromEntries(
      Object.entries(domain.lessons).map(([id, lesson]) => [
        id,
        { ...lesson, fields: Array.isArray((lesson as Lesson).fields) ? (lesson as Lesson).fields : [] },
      ]),
    );
    domain.schemaVersion = 3;
  }

  if (domain.schemaVersion < CURRENT_SCHEMA_VERSION) {
    throw new Error(`Arc: missing migration from schema ${domain.schemaVersion} to ${CURRENT_SCHEMA_VERSION}.`);
  }

  return domain;
}

/**
 * Versioned migration layer. Every persisted-shape change gets an explicit
 * schema branch so existing teacher work upgrades in place instead of being
 * reset or silently reinterpreted. Undo snapshots migrate with the live domain
 * so Undo can never restore an obsolete schema after reload.
 */
export function migratePersisted(raw: PersistedWorkspace): PersistedWorkspace {
  return {
    ...raw,
    domain: migrateDomain(raw.domain),
    undo: raw.undo
      ? {
          ...raw.undo,
          snapshot: migrateDomain(raw.undo.snapshot),
        }
      : null,
  };
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
