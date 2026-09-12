import type { PaletteToken } from '../../domain/types';
import type { PlannerDropTarget } from './unplacedPayload';

export type PlannerObject = { type: 'unit' | 'lesson'; id: string };

export function applyPlannerObjectDrop(
  object: PlannerObject,
  target: PlannerDropTarget,
  actions: {
    placeUnitOnDate: (unitId: string, date: string) => void;
    placeLessonOnDate: (lessonId: string, date: string) => void;
    nestLessonInUnit: (lessonId: string, unitId: string) => void;
    nestLessonOnBlankMagnet: (lessonId: string, colorToken: PaletteToken) => void;
    stowUnitOnDesk: (unitId: string) => void;
    stowUnitInDrawer: (unitId: string) => void;
    stowLessonOnDesk: (lessonId: string) => void;
    stowLessonInDrawer: (lessonId: string) => void;
  },
) {
  if (object.type === 'unit') {
    if (target.kind === 'calendar') {
      actions.placeUnitOnDate(object.id, target.date);
      return;
    }
    if (target.kind === 'unit' && target.date) {
      actions.placeUnitOnDate(object.id, target.date);
      return;
    }
    if (target.kind === 'fridge') {
      actions.stowUnitInDrawer(object.id);
      return;
    }
    actions.stowUnitOnDesk(object.id);
    return;
  }

  if (target.kind === 'unit' && target.unitId !== object.id) {
    actions.nestLessonInUnit(object.id, target.unitId);
    return;
  }
  if (target.kind === 'blank-magnet') {
    actions.nestLessonOnBlankMagnet(object.id, target.colorToken);
    return;
  }
  if (target.kind === 'calendar') {
    actions.placeLessonOnDate(object.id, target.date);
    return;
  }
  if (target.kind === 'fridge') {
    actions.stowLessonInDrawer(object.id);
    return;
  }
  actions.stowLessonOnDesk(object.id);
}
