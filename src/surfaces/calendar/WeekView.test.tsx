import { render, screen } from '@testing-library/react';
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

  it('renders classes as rows with a selectable but non-draggable Unit span', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);

    expect(screen.getByRole('row', { name: /AP Biology, Period 2/i })).toBeTruthy();
    const unit = screen.getByRole('button', { name: /Unit: Unit 1 · Cell Structure/i });
    expect(unit.getAttribute('draggable')).not.toBe('true');
  });

  it('keeps Lessons draggable in Week', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);
    const lesson = screen.getByRole('button', { name: 'Membrane transport lab' });
    expect(lesson.getAttribute('draggable')).toBe('true');
  });

  it('renders one planning lane for every visible weekday', () => {
    render(<WeekView onEdit={() => undefined} onCreate={() => undefined} />);
    expect(screen.getAllByRole('region', { name: /Planning notes for 2026-09-/i })).toHaveLength(5);
  });
});
