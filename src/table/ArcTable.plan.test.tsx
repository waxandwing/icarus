import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcTable } from './ArcTable';
import { writeTableDayFocus } from './dayPlan';

function stubMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }),
  });
}

describe('ArcTable lesson flow', () => {
  beforeEach(() => {
    stubMatchMedia();
    sessionStorage.clear();
    localStorage.clear();
    vi.stubGlobal('open', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.pushState({}, '', '/');
  });

  it('loads that day\'s planner lesson as ordered parts plus cleanup', () => {
    writeTableDayFocus({ date: '2026-09-10' });
    render(<ArcTable />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Warm Up');
    expect(screen.getByText('Name three organelles.')).toBeTruthy();
    expect(screen.getAllByText('AP Biology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Period 2').length).toBeGreaterThan(0);
    expect(screen.getByAltText('TABLE — An Arc Classroom Space')).toBeTruthy();
    expect(screen.getAllByText('Demo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Studio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Critique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cleanup').length).toBeGreaterThan(0);
  });

  it('keeps the student board behind the shape lock', () => {
    window.history.pushState({}, '', '/knyhagen/live');
    render(<ArcTable />);
    expect(screen.queryByRole('heading', { name: 'Warm Up' })).toBeNull();
    expect(screen.getByText(/Tap the Arc brand shapes/i)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Arc brand shapes' })).toBeTruthy();
  });
});
