import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../../domain/seed';
import { useWorkspaceStore } from '../../state/store';
import { WeekView } from './WeekView';

function resetWeek() {
  useWorkspaceStore.setState((state) => ({
    ...state,
    domain: createInitialState(),
    ui: {
      ...state.ui,
      anchorDate: '2026-09-10',
      view: 'week',
      selection: null,
      openPanels: { settings: false, fridge: false, taskbar: false, drawer: false },
    },
  }));
}

describe('Week planning projection', () => {
  beforeEach(resetWeek);

  it('renders classes as an accessible list with a selectable but non-draggable Unit span', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);

    expect(screen.getByRole('listitem', { name: /AP Art History, Period 2/i })).toBeTruthy();
    const unit = screen.getByRole('button', { name: /Unit: Prehistory/i });
    expect(unit.getAttribute('draggable')).not.toBe('true');
  });

  it('keeps Lessons draggable in Week', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);
    const lesson = screen.getByRole('button', { name: 'Cave conjecture' });
    expect(lesson.getAttribute('draggable')).toBe('true');
  });

  it('renders one planning lane for every visible weekday', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);
    expect(screen.getAllByRole('region', { name: /Planning notes for 2026-09-/i })).toHaveLength(5);
  });

  it('selects a date without changing the canonical planning data', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);
    const before = JSON.stringify(useWorkspaceStore.getState().domain);
    const thursday = screen.getByRole('button', { name: /9\/10\/2026/ });

    fireEvent.click(thursday);

    expect(useWorkspaceStore.getState().ui.selection).toEqual({ objectType: 'date', objectId: '2026-09-10' });
    expect(JSON.stringify(useWorkspaceStore.getState().domain)).toBe(before);
    expect(thursday.getAttribute('aria-pressed')).toBe('true');
  });
});
