import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetupTray } from './SetupTray';

describe('setup tray fallbacks', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('opens a PDF/CSV file picker from Upload PDF/CSV', async () => {
    const user = userEvent.setup();
    render(<SetupTray onDismiss={() => undefined} />);
    const input = screen.getByLabelText('Upload PDF or CSV calendar') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await user.click(screen.getByRole('button', { name: 'Upload PDF/CSV' }));
    expect(click).toHaveBeenCalled();
    const file = new File(['first,last\n2026-08-10,2027-06-04'], 'wphs-calendar.csv', { type: 'text/csv' });
    await user.upload(input, file);
    expect(screen.getByRole('status').textContent).toMatch(/wphs-calendar\.csv/);
    expect(screen.getByRole('button', { name: 'Use this file' })).toBeTruthy();
  });

  it('keeps Find my calendar and Not now working', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<SetupTray onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: 'Find my calendar' }));
    expect(screen.getByRole('status').textContent).toMatch(/search official sources/);
    await user.click(screen.getByRole('button', { name: 'Not now' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem('arc.entry.v1') ?? '{}').setupDismissed).toBe(true);
  });

  it('focuses the school year field when entering manually', async () => {
    const user = userEvent.setup();
    render(<SetupTray onDismiss={() => undefined} />);
    await user.click(screen.getByRole('button', { name: 'Enter manually' }));
    expect(document.activeElement).toBe(screen.getByLabelText('School year (suggested)'));
    expect(screen.getByRole('status').textContent).toMatch(/by hand/);
    expect(screen.getByRole('button', { name: 'Use these details' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Use these details' }));
    expect(screen.getByRole('status').textContent).toMatch(/Winter Park High/);
  });
});
