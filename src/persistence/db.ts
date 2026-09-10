import { type IDBPDatabase, openDB } from 'idb';
import { createInitialState, CURRENT_SCHEMA_VERSION } from '../domain/seed';
import type { WorkspaceDomainState } from '../domain/types';
import { loadRemoteWorkspace, saveRemoteWorkspace } from '../auth/supabase';

const DB_NAME = 'arc-workspace';
const DB_VERSION = 1;
const STORE = 'snapshots';
const LEGACY_KEY = 'current';
const ACCOUNT_KEY_PREFIX = 'account:';
const LEGACY_DECLINED_PREFIX = 'legacy-declined:';

export interface PersistedWorkspace {
  domain: WorkspaceDomainState;
  undo: { label: string; snapshot: WorkspaceDomainState } | null;
  savedAt: number;
}

interface CloudEnvelope {
  formatVersion: 1;
  workspace: PersistedWorkspace;
}

let dbPromise: Promise<IDBPDatabase> | null = null;
let activeAccountId: string | null = null;
let remoteBaselineKnown = false;
let remoteCache: PersistedWorkspace | null | undefined;

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

function accountKey(userId: string) {
  return `${ACCOUNT_KEY_PREFIX}${userId}`;
}

function legacyDeclinedKey(userId: string) {
  return `${LEGACY_DECLINED_PREFIX}${userId}`;
}

function freshWorkspace(): PersistedWorkspace {
  return { domain: createInitialState(), undo: null, savedAt: Date.now() };
}

function isPersistedWorkspace(value: unknown): value is PersistedWorkspace {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PersistedWorkspace>;
  return (
    typeof candidate.savedAt === 'number' &&
    !!candidate.domain &&
    typeof candidate.domain === 'object' &&
    (candidate.undo === null || typeof candidate.undo === 'object')
  );
}

function unwrapCloudPayload(value: unknown): PersistedWorkspace | null {
  if (isPersistedWorkspace(value)) return migrate(value);
  if (!value || typeof value !== 'object') return null;
  const envelope = value as Partial<CloudEnvelope>;
  if (envelope.formatVersion !== 1 || !isPersistedWorkspace(envelope.workspace)) return null;
  return migrate(envelope.workspace);
}

function wrapCloudPayload(workspace: PersistedWorkspace): CloudEnvelope {
  return { formatVersion: 1, workspace };
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
  return { ...raw, domain };
}

export function setPersistenceAccount(userId: string | null): void {
  activeAccountId = userId;
  remoteBaselineKnown = false;
  remoteCache = undefined;
}

async function readLocalForAccount(userId: string): Promise<PersistedWorkspace | null> {
  const db = await getDb();
  const raw = (await db.get(STORE, accountKey(userId))) as PersistedWorkspace | undefined;
  return raw ? migrate(raw) : null;
}

async function writeLocalForAccount(userId: string, workspace: PersistedWorkspace): Promise<void> {
  const db = await getDb();
  await db.put(STORE, workspace, accountKey(userId));
}

async function probeRemote(userId: string): Promise<PersistedWorkspace | null> {
  if (remoteCache !== undefined) return remoteCache;
  const raw = await loadRemoteWorkspace(userId);
  remoteCache = unwrapCloudPayload(raw);
  remoteBaselineKnown = true;
  return remoteCache;
}

export async function shouldOfferLegacyMigration(userId: string): Promise<boolean> {
  const db = await getDb();
  const declined = await db.get(STORE, legacyDeclinedKey(userId));
  if (declined === true) return false;
  const local = await readLocalForAccount(userId);
  if (local) return false;
  const remote = await probeRemote(userId);
  if (remote) return false;
  const legacy = (await db.get(STORE, LEGACY_KEY)) as PersistedWorkspace | undefined;
  return !!legacy && isPersistedWorkspace(legacy);
}

export async function claimLegacyWorkspace(userId: string): Promise<void> {
  if (activeAccountId !== userId) throw new Error('Arc account changed during local-work import.');
  const db = await getDb();
  const legacy = (await db.get(STORE, LEGACY_KEY)) as PersistedWorkspace | undefined;
  if (!legacy || !isPersistedWorkspace(legacy)) return;
  const migrated = migrate(legacy);
  await writeLocalForAccount(userId, migrated);
  if (!remoteBaselineKnown) await probeRemote(userId);
  if (remoteCache) {
    throw new Error('Arc found existing cloud work for this account and did not overwrite it.');
  }
  await saveRemoteWorkspace(userId, wrapCloudPayload(migrated));
  remoteCache = migrated;
  await db.delete(STORE, LEGACY_KEY);
  await db.delete(STORE, legacyDeclinedKey(userId));
}

export async function declineLegacyWorkspace(userId: string): Promise<void> {
  const db = await getDb();
  await db.put(STORE, true, legacyDeclinedKey(userId));
}

export async function loadPersisted(): Promise<PersistedWorkspace> {
  const userId = activeAccountId;
  if (!userId) {
    console.error('Arc: persistence load attempted without an authenticated account.');
    return freshWorkspace();
  }

  const local = await readLocalForAccount(userId);
  let remote: PersistedWorkspace | null = null;
  try {
    remote = await probeRemote(userId);
  } catch (err) {
    if (local) {
      console.error('Arc: cloud workspace is temporarily unavailable; using this account’s local copy.', err);
      return local;
    }
    throw new Error('Arc cannot verify this account’s saved workspace right now. Your cloud data was not overwritten.');
  }

  if (local && remote) {
    if (local.savedAt > remote.savedAt) {
      await saveRemoteWorkspace(userId, wrapCloudPayload(local));
      remoteCache = local;
      return local;
    }
    if (remote.savedAt > local.savedAt) await writeLocalForAccount(userId, remote);
    return remote;
  }

  if (remote) {
    await writeLocalForAccount(userId, remote);
    return remote;
  }

  if (local) {
    await saveRemoteWorkspace(userId, wrapCloudPayload(local));
    remoteCache = local;
    return local;
  }

  return freshWorkspace();
}

export async function savePersisted(data: PersistedWorkspace): Promise<void> {
  const userId = activeAccountId;
  if (!userId) {
    console.error('Arc: refused to persist workspace without an authenticated account.');
    return;
  }

  try {
    await writeLocalForAccount(userId, data);
  } catch (err) {
    console.error('Arc: failed to persist this account’s local workspace.', err);
    return;
  }

  if (!remoteBaselineKnown) return;
  try {
    await saveRemoteWorkspace(userId, wrapCloudPayload(data));
    remoteCache = data;
  } catch (err) {
    remoteBaselineKnown = false;
    remoteCache = undefined;
    console.error('Arc: local save succeeded but cloud sync failed. Cloud overwrite is paused until the account is rehydrated.', err);
  }
}

export async function clearPersisted(): Promise<void> {
  const userId = activeAccountId;
  if (!userId) return;
  try {
    const db = await getDb();
    await db.delete(STORE, accountKey(userId));
  } catch (err) {
    console.error('Arc: failed to clear this account’s local workspace.', err);
  }
}
