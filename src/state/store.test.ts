import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../domain/seed';
import { useWorkspaceStore } from './store';

function resetState() {
  useWorkspaceStore.setState((state) => ({
    ...state,
    domain: createInitialState(),
    undo: null,
    ui: {
      ...state.ui,
      anchorDate: '2026-09-10',
      selection: null,
      openPanels: { settings: false, fridge: false, taskbar: false, drawer: false },
    },
  }));
}

describe('workspace interaction laws', () => {
  beforeEach(resetState);

  it('allows Settings, Fridge, and Task Bar to remain open simultaneously', () => {
    const state = useWorkspaceStore.getState();
    state.openFurniture('settings');
    state.openFurniture('fridge');
    state.openFurniture('taskbar');

    expect(useWorkspaceStore.getState().ui.openPanels).toMatchObject({
      settings: true,
      fridge: true,
      taskbar: true,
    });
  });

  it('associates a Task with a date without converting or removing it from the Task Bar', () => {
    const task = Object.values(useWorkspaceStore.getState().domain.notes).find(
      (note) => note.location === 'taskbar',
    );
    expect(task).toBeTruthy();
    if (!task) return;

    const originalColumn = task.taskColumn;
    useWorkspaceStore.getState().editNote(task.id, { associatedDate: '2026-09-10' });
    const updated = useWorkspaceStore.getState().domain.notes[task.id];

    expect(updated.location).toBe('taskbar');
    expect(updated.taskColumn).toBe(originalColumn);
    expect(updated.associatedDate).toBe('2026-09-10');
    expect(useWorkspaceStore.getState().domain.taskbar.columns[originalColumn!]).toContain(task.id);
  });
});
