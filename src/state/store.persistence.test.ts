import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../domain/seed';

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('B08 workspace persistence envelope', () => {
  it('rehydrates domain, Undo, view, anchor date, and furniture from one persisted record', async () => {
    const seed = createInitialState();
    const domain = {
      ...seed,
      settings: { ...seed.settings, highContrast: true },
    };
    const undo = { label: 'Prior change', snapshot: createInitialState() };
    const loadPersisted = vi.fn(async () => ({
      domain,
      undo,
      workspaceUi: { view: 'month' as const, anchorDate: '2026-10-12', openPanel: 'fridge' as const },
      savedAt: 10,
    }));
    const savePersisted = vi.fn(async () => undefined);
    vi.doMock('../persistence/db', () => ({ loadPersisted, savePersisted }));

    const { useWorkspaceStore } = await import('./store');
    await useWorkspaceStore.getState().init();
    const state = useWorkspaceStore.getState();

    expect(state.domain.settings.highContrast).toBe(true);
    expect(state.undo?.label).toBe('Prior change');
    expect(state.ui.view).toBe('month');
    expect(state.ui.anchorDate).toBe('2026-10-12');
    expect(state.ui.openPanel).toBe('fridge');
    expect(state.ui.ready).toBe(true);
  });

  it('persists changed view, anchor date, and furniture alongside canonical domain and Undo', async () => {
    const domain = createInitialState();
    const loadPersisted = vi.fn(async () => ({ domain, undo: null, savedAt: 10 }));
    const savePersisted = vi.fn(async () => undefined);
    vi.doMock('../persistence/db', () => ({ loadPersisted, savePersisted }));

    const { useWorkspaceStore } = await import('./store');
    await useWorkspaceStore.getState().init();
    useWorkspaceStore.getState().setView('day');
    useWorkspaceStore.getState().setAnchorDate('2026-09-21');
    useWorkspaceStore.getState().openFurniture('settings');
    await vi.advanceTimersByTimeAsync(300);

    expect(savePersisted).toHaveBeenCalledTimes(1);
    expect(savePersisted).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: expect.any(Object),
        undo: null,
        workspaceUi: { view: 'day', anchorDate: '2026-09-21', openPanel: 'settings' },
        savedAt: expect.any(Number),
      }),
    );
  });
});
