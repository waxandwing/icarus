import { describe, expect, it, vi } from 'vitest';
import type { WorkspaceDomainState } from '../../domain/types';
import { applyFridgeDrop } from './fridgeDrop';

function dropEvent(data: Record<string, string>): React.DragEvent {
  return {
    preventDefault() {},
    dataTransfer: {
      dropEffect: 'move',
      getData: (key: string) => data[key] ?? '',
    },
  } as unknown as React.DragEvent;
}

function ctx(overrides: Partial<Parameters<typeof applyFridgeDrop>[1]> = {}) {
  return {
    domain: { placements: {} } as WorkspaceDomainState,
    stowUnitInDrawer: vi.fn(),
    createUnitInDrawer: vi.fn(),
    moveNoteToFridge: vi.fn(),
    moveMagnetToFridge: vi.fn(),
    moveNoteToDrawer: vi.fn(),
    moveMagnetToDrawer: vi.fn(),
    ...overrides,
  };
}

describe('applyFridgeDrop', () => {
  it('parks magnets on the door by default', () => {
    const next = ctx();
    applyFridgeDrop(
      dropEvent({
        'text/arc-unplaced': JSON.stringify({ type: 'magnet', id: 'magnet-1' }),
      }),
      next,
    );
    expect(next.moveMagnetToFridge).toHaveBeenCalledWith('magnet-1');
    expect(next.moveMagnetToDrawer).not.toHaveBeenCalled();
  });

  it('stows door magnets in the drawer when dropped on the drawer', () => {
    const next = ctx({ target: 'drawer' });
    applyFridgeDrop(
      dropEvent({
        'text/arc-unplaced': JSON.stringify({ type: 'magnet', id: 'magnet-1' }),
      }),
      next,
    );
    expect(next.moveMagnetToDrawer).toHaveBeenCalledWith('magnet-1');
    expect(next.moveMagnetToFridge).not.toHaveBeenCalled();
  });
});
