import { describe, expect, it, vi } from 'vitest';
import { applyCalendarDrop } from './calendarDrop';

function dropEvent(data: Record<string, string>): React.DragEvent {
  return {
    preventDefault() {},
    dataTransfer: {
      dropEffect: 'move',
      getData: (key: string) => data[key] ?? '',
    },
  } as unknown as React.DragEvent;
}

function actions() {
  return {
    movePlacement: vi.fn(),
    placeNoteOnCalendar: vi.fn(),
    placeUnitOnDate: vi.fn(),
    createUnitFromMagnet: vi.fn(),
    placeMagnetOnCalendar: vi.fn(),
  };
}

describe('applyCalendarDrop', () => {
  it('places a generic magnet on the dropped date', () => {
    const next = actions();
    applyCalendarDrop(
      dropEvent({
        'text/arc-unplaced': JSON.stringify({ type: 'magnet', id: 'magnet-1' }),
      }),
      '2026-09-14',
      next,
    );
    expect(next.placeMagnetOnCalendar).toHaveBeenCalledWith('magnet-1', '2026-09-14');
    expect(next.placeNoteOnCalendar).not.toHaveBeenCalled();
  });

  it('still places notes and units', () => {
    const notes = actions();
    applyCalendarDrop(
      dropEvent({
        'text/arc-unplaced': JSON.stringify({ type: 'note', id: 'note-1' }),
      }),
      '2026-09-15',
      notes,
    );
    expect(notes.placeNoteOnCalendar).toHaveBeenCalledWith('note-1', '2026-09-15');

    const units = actions();
    applyCalendarDrop(
      dropEvent({
        'text/arc-unplaced': JSON.stringify({ type: 'unit', id: 'unit-1' }),
      }),
      '2026-09-16',
      units,
    );
    expect(units.placeUnitOnDate).toHaveBeenCalledWith('unit-1', '2026-09-16');
  });
});
