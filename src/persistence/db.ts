import { type IDBPDatabase, openDB } from 'idb';
import { CURRENT_SCHEMA_VERSION, markSampleYearCrosses } from '../domain/seed';
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
 * Versioned migration layer. Bump CURRENT_SCHEMA_VERSION in domain/seed.ts and
 * add a branch here whenever the persisted shape changes, so existing local
 * workspaces upgrade in place instead of silently losing data.
 */
function migrate(raw: PersistedWorkspace): PersistedWorkspace {
  const domain = { ...raw.domain };
  if (domain.isSampleWorkspace === undefined) domain.isSampleWorkspace = false;
  if (!domain.schemaVersion || domain.schemaVersion < CURRENT_SCHEMA_VERSION) {
    domain.schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  const hadYearMarks = Boolean(raw.domain.calendar?.crossedDates);
  domain.calendar = {
    ...domain.calendar,
    crossedDates: domain.calendar?.crossedDates ?? {},
    teacherOutDates: domain.calendar?.teacherOutDates ?? {},
  };
  if (!hadYearMarks && domain.isSampleWorkspace) {
    markSampleYearCrosses(domain.calendar);
  } else if (domain.isSampleWorkspace && Object.keys(domain.calendar.teacherOutDates).length === 0) {
    const outs = { ...domain.calendar.teacherOutDates, '2026-09-04': 'sick' as const, '2026-09-08': 'sub' as const };
    const crossed = { ...domain.calendar.crossedDates };
    delete crossed['2026-09-04'];
    delete crossed['2026-09-08'];
    domain.calendar = { ...domain.calendar, teacherOutDates: outs, crossedDates: crossed };
  }
  const units = { ...domain.units };
  for (const [id, unit] of Object.entries(units)) {
    if (!('location' in unit) || !(unit as { location?: string }).location) {
      const parked = Object.values(domain.placements ?? {}).some(
        (p) => p.objectType === 'unit' && p.objectId === id && p.storage === 'drawer',
      );
      units[id] = { ...unit, location: parked ? 'drawer' : 'calendar' };
    }
  }
  domain.units = units;
  return { ...raw, domain };
}

export async function loadPersisted(): Promise<PersistedWorkspace | null> {
  try {
    const db = await getDb();
    const raw = (await db.get(STORE, KEY)) as PersistedWorkspace | undefined;
    if (!raw) return null;
    return migrate(raw);
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
