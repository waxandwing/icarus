import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { produce } from 'immer';
import * as cmd from '../../domain/commands';
import { createInitialState } from '../../domain/seed';
import { useWorkspaceStore } from '../../state/store';
import { FridgePanel } from './FridgePanel';
import { FridgeTab } from './FridgeTab';

function resetStore(domain = createInitialState(), openPanel: 'fridge' | null = 'fridge') {
  useWorkspaceStore.setState({
    domain,
    ui: { ...useWorkspaceStore.getState().ui, openPanel, selection: null },
  });
}

afterEach(() => {
  cleanup();
  resetStore(createInitialState(), null);
});

describe('Fridge door', () => {
  it('shows door magnets and matches the tab badge to visible door items', () => {
    const domain = produce(createInitialState(), (draft) => {
      draft.magnets = {};
      draft.notes = {};
      cmd.createNote(draft, { title: 'Permission slips', location: 'fridge' });
      cmd.createMagnet(draft, { magnetKind: 'reminder', title: 'Field trip forms' });
    });
    resetStore(domain, 'fridge');

    render(
      <>
        <FridgeTab />
        <FridgePanel />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Field trip forms' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Permission slips' })).toBeTruthy();
    const tab = screen.getByRole('button', { name: /Fridge/ });
    expect(tab.textContent).toContain('2');
    expect(tab.textContent).not.toContain('3');
  });
});
