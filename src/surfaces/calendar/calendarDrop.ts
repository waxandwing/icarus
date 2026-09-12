/** Shared HTML5 drop payload handling for calendar day columns. */

import type { PaletteToken } from '../../domain/types';
import { readUnplacedDrag } from '../drag/unplacedPayload';

export function applyCalendarDrop(
  e: React.DragEvent,
  date: string,
  actions: {
    movePlacement: (placementId: string, date: string) => void;
    placeNoteOnCalendar: (id: string, date: string) => void;
    placeUnitOnDate: (unitId: string, date: string) => void;
    placeLessonOnDate?: (lessonId: string, date: string) => void;
    createUnitFromMagnet: (colorToken: PaletteToken, date: string, title?: string) => void;
    placeMagnetOnCalendar?: (magnetId: string, date: string) => void;
  },
) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const placementId = e.dataTransfer.getData('text/arc-placement-id');
  if (placementId) {
    actions.movePlacement(placementId, date);
    return;
  }
  const payload = readUnplacedDrag(e);
  if (!payload) return;
  if (payload.type === 'unit' && payload.id) {
    actions.placeUnitOnDate(payload.id, date);
    return;
  }
  if (payload.type === 'unit-blank' && payload.colorToken) {
    actions.createUnitFromMagnet(payload.colorToken as PaletteToken, date, payload.title);
    return;
  }
  if (payload.type === 'magnet' && payload.id) {
    actions.placeMagnetOnCalendar?.(payload.id, date);
    return;
  }
  if (payload.type === 'lesson' && payload.id) {
    actions.placeLessonOnDate?.(payload.id, date);
    return;
  }
  if (payload.type === 'note' && payload.id) {
    actions.placeNoteOnCalendar(payload.id, date);
  }
}
