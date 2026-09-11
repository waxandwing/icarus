/** Shared HTML5 drop payload handling for calendar day columns. */

export function applyCalendarDrop(
  e: React.DragEvent,
  date: string,
  actions: {
    movePlacement: (placementId: string, date: string) => void;
    placeMagnetOnCalendar: (id: string, date: string) => void;
    placeNoteOnCalendar: (id: string, date: string) => void;
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
    const { type, id } = JSON.parse(unplaced) as { type: string; id: string };
    if (type === 'magnet') actions.placeMagnetOnCalendar(id, date);
    else if (type === 'note') actions.placeNoteOnCalendar(id, date);
  } catch {
    // ignore malformed drag payloads
  }
}
