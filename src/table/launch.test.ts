import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceStore } from '../state/store';
import { readTableDayFocus } from './dayPlan';
import { startMyDay } from './launch';

describe('startMyDay', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('records the instructional day and section so /table can read the planner lesson', async () => {
    useWorkspaceStore.setState((state) => ({
      ...state,
      ui: { ...state.ui, anchorDate: '2026-09-10', selection: null },
    }));
    vi.stubGlobal('open', vi.fn());
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/', assign });

    await startMyDay();

    const focus = readTableDayFocus();
    expect(focus?.date).toBe('2026-09-10');
    expect(focus?.sectionId).toBeTruthy();
    expect(window.open).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith('/table');
  });
});
