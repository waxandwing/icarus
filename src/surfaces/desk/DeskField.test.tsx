import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../../domain/seed';
import { useWorkspaceStore } from '../../state/store';
import { DeskField } from './DeskField';

describe('desk unit magnets', () => {
  afterEach(() => {
    cleanup();
    useWorkspaceStore.setState({ domain: createInitialState() });
  });

  it('names a magnet and drops it on a day as a spanning unit', async () => {
    useWorkspaceStore.setState({ domain: createInitialState() });
    const user = userEvent.setup();
    const shell = document.createElement('div');
    shell.id = 'arc-calendar-shell';
    const cell = document.createElement('div');
    cell.dataset.date = '2026-09-16';
    shell.appendChild(cell);
    document.body.appendChild(shell);
    document.elementsFromPoint = () => [cell];

    render(<DeskField />);
    const magnet = document.querySelector('[data-arc-magnet="blank"][data-token="blue"]') as HTMLElement;
    const input = screen.getByRole('textbox', { name: 'Name Blue unit magnet' });
    await user.type(input, 'Genetics');

    fireEvent.pointerDown(magnet, { button: 0, pointerId: 1, clientX: 12, clientY: 12 });
    fireEvent.pointerMove(magnet, { pointerId: 1, clientX: 48, clientY: 90 });
    fireEvent.pointerUp(magnet, { pointerId: 1, clientX: 48, clientY: 90 });

    const domain = useWorkspaceStore.getState().domain;
    const unit = Object.values(domain.units).find((item) => item.title === 'Genetics');
    expect(unit?.kind).toBe('unit');
    expect(unit?.colorToken).toBe('blue');
    const placement = Object.values(domain.placements).find((p) => p.objectId === unit?.id);
    expect(placement?.objectType).toBe('unit');
    expect(placement?.date).toBe('2026-09-16');
    expect(placement?.endDate).toBe('2026-09-25');
    shell.remove();
  });
});
