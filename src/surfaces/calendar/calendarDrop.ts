/** Shared HTML5 drop payload handling for calendar day columns. */

import type { PaletteToken } from '../../domain/types';

export function applyCalendarDrop(
  e: React.DragEvent,
  date: string,
  actions: {
    movePlacement: (placementId: string, date: string) => void;
    placeNoteOnCalendar: (id: string, date: string) => void;
    placeUnitOnDate: (unitId: string, date: string) => void;
    createUnitFromMagnet: (colorToken: PaletteToken, date: string) => void;
    placeMagnetOnCalendar: (id: string, date: string) => void;
  },
) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const placementId = e.dataTransfer.getData('text/arc-placement-id');
  if (placementId) {
    actions.movePlacement(placementId, date);
    return;
  }
  const unplaced = e.dataTransfer.getData('text/arc-unplaced');
  if (!unplaced) return;
  try {
    const payload = JSON.parse(unplaced) as {
      type: string;
      id?: string;
      colorToken?: string;
    };
    if (payload.type === 'unit' && payload.id) {
      actions.placeUnitOnDate(payload.id, date);
      return;
    }
    if (payload.type === 'unit-blank' && payload.colorToken) {
      actions.createUnitFromMagnet(payload.colorToken as PaletteToken, date);
      return;
    }
    if (payload.type === 'note' && payload.id) {
      actions.placeNoteOnCalendar(payload.id, date);
      return;
    }
    if (payload.type === 'magnet' && payload.id) {
      actions.placeMagnetOnCalendar(payload.id, date);
    }
  } catch {
    // ignore malformed drag payloads
  }
}
