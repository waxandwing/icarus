import { describe, expect, it } from 'vitest';
import type { PlacementView } from './selectors';
import { createInitialState } from '../domain/seed';
import { getNextUp, getFridgeItems, nestLessonsInUnits } from './selectors';

function view(partial: Partial<PlacementView> & Pick<PlacementView, 'placementId' | 'objectType' | 'objectId'>): PlacementView {
  return {
    title: partial.title ?? partial.objectId,
    colorToken: 'blue',
    important: false,
    crossedOut: false,
    fixed: false,
    isRangeStart: true,
    isRangeEnd: true,
    startDate: '2026-09-08',
    order: 0,
    ...partial,
  };
}

describe('nestLessonsInUnits', () => {
  it('puts lessons under their parent unit and keeps unassigned lessons loose', () => {
    const unitA = view({ placementId: 'pu1', objectType: 'unit', objectId: 'u1', title: 'Cells' });
    const unitB = view({ placementId: 'pu2', objectType: 'unit', objectId: 'u2', title: 'Genetics' });
    const inA = view({
      placementId: 'pl1',
      objectType: 'lesson',
      objectId: 'l1',
      unitId: 'u1',
      title: 'Organelles',
    });
    const inB = view({
      placementId: 'pl2',
      objectType: 'lesson',
      objectId: 'l2',
      unitId: 'u2',
      title: 'Punnett',
    });
    const loose = view({
      placementId: 'pl3',
      objectType: 'lesson',
      objectId: 'l3',
      title: 'Unfiled',
    });

    const nested = nestLessonsInUnits([unitA, unitB], [inA, inB, loose]);
    expect(nested.groups[0].lessons.map((l) => l.objectId)).toEqual(['l1']);
    expect(nested.groups[1].lessons.map((l) => l.objectId)).toEqual(['l2']);
    expect(nested.loose.map((l) => l.objectId)).toEqual(['l3']);
  });

  it('treats a lesson whose unit is not in the visible set as loose', () => {
    const unitA = view({ placementId: 'pu1', objectType: 'unit', objectId: 'u1' });
    const orphan = view({
      placementId: 'pl1',
      objectType: 'lesson',
      objectId: 'l1',
      unitId: 'missing',
    });
    expect(nestLessonsInUnits([unitA], [orphan]).loose).toHaveLength(1);
    expect(nestLessonsInUnits([unitA], [orphan]).groups[0].lessons).toHaveLength(0);
  });
});

describe('getNextUp', () => {
  it('points at the next placed lesson after the day, not a dashboard card', () => {
    const domain = createInitialState();
    const next = getNextUp(domain, '2026-09-11');
    expect(next?.kind).toBe('upcoming');
    expect(next?.title).toBe('Cell structure quiz');
    expect(next?.date).toBe('2026-09-15');
  });
});

describe('getFridgeItems', () => {
  it('includes magnets parked on the door, not only notes', () => {
    const domain = createInitialState();
    const titles = getFridgeItems(domain).map((item) => item.title);
    expect(titles).toContain('Lab coats for osmosis');
    expect(getFridgeItems(domain).some((item) => item.kind === 'magnet')).toBe(true);
  });
});
