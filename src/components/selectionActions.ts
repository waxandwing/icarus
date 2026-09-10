import type { CalendarViewMode, SelectionRef } from '../state/store';

export type ContextActionId =
  | 'add'
  | 'edit'
  | 'circle'
  | 'cross-out'
  | 'move'
  | 'copy-next-day'
  | 'shift-section'
  | 'to-fridge'
  | 'to-drawer'
  | 'unplace';

export interface ContextActionFacts {
  selection: SelectionRef;
  view: CalendarViewMode;
  hasPlacement: boolean;
  placementFixed: boolean;
  hasSection: boolean;
}

/**
 * Arc keeps the calendar quiet until an object or date is selected. This
 * function is the single source of truth for which commands become available
 * for that selection in the current projection. It intentionally returns only
 * actions that are implemented end to end today.
 */
export function getAvailableActions(facts: ContextActionFacts): ContextActionId[] {
  const { selection, view, hasPlacement, placementFixed, hasSection } = facts;
  const type = selection.objectType;

  if (type === 'date') return ['add'];

  const actions: ContextActionId[] = ['edit'];

  if (type === 'unit' || type === 'lesson' || type === 'note') actions.push('circle');
  if (type === 'lesson' || type === 'note') actions.push('cross-out');

  const unitLockedInWeek = type === 'unit' && view === 'week';
  if (hasPlacement && !placementFixed && !unitLockedInWeek) actions.push('move');

  if (type === 'lesson' && hasPlacement) actions.push('copy-next-day');
  if (type === 'lesson' && hasPlacement && hasSection) actions.push('shift-section');

  if (type === 'note') actions.push('to-fridge', 'to-drawer');
  if (type === 'magnet') actions.push('to-fridge', 'to-drawer');

  if (hasPlacement && !unitLockedInWeek) actions.push('unplace');

  return actions;
}
