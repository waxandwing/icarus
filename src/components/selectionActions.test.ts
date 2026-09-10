import { describe, expect, it } from 'vitest';
import { getAvailableActions } from './selectionActions';

function actions(
  objectType: 'unit' | 'lesson' | 'note' | 'magnet' | 'date',
  overrides: Partial<Parameters<typeof getAvailableActions>[0]> = {},
) {
  return getAvailableActions({
    selection: { objectType, objectId: 'example' },
    view: 'week',
    hasPlacement: true,
    placementFixed: false,
    hasSection: false,
    ...overrides,
  });
}

describe('contextual calendar action law', () => {
  it('keeps date selection non-mutating until the teacher chooses an action', () => {
    expect(actions('date', { hasPlacement: false })).toEqual(['add']);
  });

  it('keeps Units calm and immovable in ordinary Week', () => {
    expect(actions('unit')).toEqual(['edit', 'circle']);
  });

  it('allows Unit movement outside Week when a placement exists', () => {
    expect(actions('unit', { view: 'month' })).toEqual(['edit', 'circle', 'move', 'unplace']);
  });

  it('gives a scheduled section Lesson only implemented teaching-plan actions', () => {
    expect(actions('lesson', { hasSection: true })).toEqual([
      'edit',
      'circle',
      'cross-out',
      'move',
      'copy-next-day',
      'shift-section',
      'unplace',
    ]);
  });

  it('does not offer direct movement for a fixed placement', () => {
    expect(actions('lesson', { placementFixed: true })).not.toContain('move');
  });

  it('keeps Notes as Notes while exposing their storage destinations', () => {
    expect(actions('note')).toEqual([
      'edit',
      'circle',
      'cross-out',
      'move',
      'to-fridge',
      'to-drawer',
      'unplace',
    ]);
  });

  it('does not invent calendar actions for an unplaced Magnet', () => {
    expect(actions('magnet', { hasPlacement: false })).toEqual(['edit', 'to-fridge', 'to-drawer']);
  });
});
