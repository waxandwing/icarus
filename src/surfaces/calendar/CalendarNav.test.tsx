import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../../domain/seed';
import { useWorkspaceStore } from '../../state/store';
import { CalendarNav } from './CalendarNav';

function reset(view: 'day' | 'week' | 'month', anchorDate: string) {
  useWorkspaceStore.setState((state) => ({
    ...state,
    domain: createInitialState(),
    ui: {
      ...state.ui,
      view,
      anchorDate,
      selection: null,
      openPanels: { settings: false, fridge: false, taskbar: false, drawer: false },
    },
  }));
}

describe('calendar temporal navigation', () => {
  beforeEach(() => reset('week', '2026-09-10'));

  it('derives the Week range from the actual visible weekdays', () => {
    render(<CalendarNav />);
    expect(screen.getByText('Sep 7 – Sep 11')).toBeTruthy();
  });

  it('moves Month from a long-month final day into the immediate next month', () => {
    reset('month', '2027-01-31');
    render(<CalendarNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));

    expect(useWorkspaceStore.getState().ui.anchorDate).toBe('2027-02-01');
  });
});
