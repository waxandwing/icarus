import { describe, expect, it } from 'vitest';
import { createInitialState } from '../domain/seed';
import { migratePersisted, type PersistedWorkspace } from './db';

describe('workspace persistence migrations', () => {
  it('upgrades a v1 workspace to v2 without losing objects or placements', () => {
    const domain = structuredClone(createInitialState());
    domain.schemaVersion = 1;
    const noteIds = Object.keys(domain.notes);
    const placementIds = Object.keys(domain.placements);
    const raw: PersistedWorkspace = { domain, undo: null, savedAt: 123 };

    const migrated = migratePersisted(raw);

    expect(migrated.domain.schemaVersion).toBe(2);
    expect(Object.keys(migrated.domain.notes)).toEqual(noteIds);
    expect(Object.keys(migrated.domain.placements)).toEqual(placementIds);
    expect(migrated.savedAt).toBe(123);
  });
});
