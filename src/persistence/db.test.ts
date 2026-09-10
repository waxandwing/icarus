import { describe, expect, it } from 'vitest';
import { createInitialState } from '../domain/seed';
import { migratePersisted, type PersistedWorkspace } from './db';

describe('workspace persistence migrations', () => {
  it('upgrades a v1 workspace through v3 without losing objects or placements', () => {
    const domain = structuredClone(createInitialState());
    domain.schemaVersion = 1;
    const noteIds = Object.keys(domain.notes);
    const placementIds = Object.keys(domain.placements);
    const raw: PersistedWorkspace = { domain, undo: null, savedAt: 123 };

    const migrated = migratePersisted(raw);

    expect(migrated.domain.schemaVersion).toBe(3);
    expect(Object.keys(migrated.domain.notes)).toEqual(noteIds);
    expect(Object.keys(migrated.domain.placements)).toEqual(placementIds);
    expect(migrated.savedAt).toBe(123);
  });

  it('adds an empty structured-field array to a v2 lesson without reinterpreting its notes', () => {
    const domain = structuredClone(createInitialState());
    const lesson = Object.values(domain.lessons)[0];
    expect(lesson).toBeTruthy();
    lesson.body = 'Keep this exact teacher note.';
    delete (lesson as Partial<typeof lesson>).fields;
    domain.schemaVersion = 2;

    const migrated = migratePersisted({ domain, undo: null, savedAt: 321 });
    const migratedLesson = migrated.domain.lessons[lesson.id];

    expect(migrated.domain.schemaVersion).toBe(3);
    expect(migratedLesson.body).toBe('Keep this exact teacher note.');
    expect(migratedLesson.fields).toEqual([]);
    expect(migratedLesson.id).toBe(lesson.id);
  });

  it('migrates the Undo snapshot with the live workspace', () => {
    const domain = structuredClone(createInitialState());
    const snapshot = structuredClone(domain);
    domain.schemaVersion = 2;
    snapshot.schemaVersion = 2;
    for (const lesson of Object.values(domain.lessons)) delete (lesson as Partial<typeof lesson>).fields;
    for (const lesson of Object.values(snapshot.lessons)) delete (lesson as Partial<typeof lesson>).fields;
    const raw: PersistedWorkspace = {
      domain,
      undo: { label: 'Move lesson', snapshot },
      savedAt: 456,
    };

    const migrated = migratePersisted(raw);

    expect(migrated.domain.schemaVersion).toBe(3);
    expect(migrated.undo?.snapshot.schemaVersion).toBe(3);
    expect(Object.values(migrated.undo!.snapshot.lessons).every((lesson) => Array.isArray(lesson.fields))).toBe(true);
    expect(migrated.undo?.label).toBe('Move lesson');
  });
});
