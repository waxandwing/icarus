import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { EntryFlow } from './EntryFlow';

describe('beta password gate', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows a quiet error for a wrong password and does not unlock', async () => {
    const user = userEvent.setup();
    const onGo = () => {
      throw new Error('should not continue after a wrong password');
    };
    render(<EntryFlow screen="beta" onGo={onGo} />);
    await user.type(screen.getByLabelText('Beta password'), 'nope');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert').textContent).toBe('That password does not open Arc yet.');
    expect(localStorage.getItem('arc.entry.v1')).toBeNull();
  });

  it('unlocks and continues into onboarding after icarus', async () => {
    const user = userEvent.setup();
    const destinations: string[] = [];
    render(<EntryFlow screen="beta" onGo={(path) => destinations.push(path)} />);
    await user.type(screen.getByLabelText('Beta password'), 'Icarus');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(destinations).toEqual(['/enter']);
    expect(JSON.parse(localStorage.getItem('arc.entry.v1') ?? '{}').betaUnlocked).toBe(true);
  });
});
