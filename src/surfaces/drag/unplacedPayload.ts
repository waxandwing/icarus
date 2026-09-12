/** Shared desk/fridge drag payloads. Pointer drops hit-test; HTML5 also writes text/plain for Chromium. */

import type { PaletteToken } from '../../domain/types';

export type UnplacedPayload = {
  type: 'unit' | 'unit-blank' | 'note' | 'magnet' | 'lesson';
  id?: string;
  colorToken?: string;
  title?: string;
};

export function writeUnplacedDrag(e: React.DragEvent, payload: UnplacedPayload) {
  const json = JSON.stringify(payload);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/arc-unplaced', json);
  e.dataTransfer.setData('text/plain', json);
}

export function readUnplacedDrag(e: React.DragEvent): UnplacedPayload | null {
  const raw = e.dataTransfer.getData('text/arc-unplaced') || e.dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as UnplacedPayload;
    if (!payload || typeof payload.type !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export type PlannerDropTarget =
  | { kind: 'unit'; unitId: string; date?: string }
  | { kind: 'blank-magnet'; colorToken: PaletteToken }
  | { kind: 'calendar'; date: string }
  | { kind: 'fridge' }
  | { kind: 'desk' };

export function plannerDropTarget(
  clientX: number,
  clientY: number,
  ignore?: HTMLElement,
): PlannerDropTarget {
  const prev = ignore?.style.pointerEvents;
  if (ignore) ignore.style.pointerEvents = 'none';
  const hits = document.elementsFromPoint(clientX, clientY);
  if (ignore && prev != null) ignore.style.pointerEvents = prev;
  for (const hit of hits) {
    if (ignore && (hit === ignore || ignore.contains(hit))) continue;
    const unitHost = hit.closest<HTMLElement>('[data-arc-unit-id]');
    if (unitHost?.dataset.arcUnitId) {
      const cell = hit.closest<HTMLElement>('[data-date]');
      return { kind: 'unit', unitId: unitHost.dataset.arcUnitId, date: cell?.dataset.date };
    }
    const blank = hit.closest<HTMLElement>('[data-arc-magnet="blank"][data-token]');
    if (blank?.dataset.token) {
      return { kind: 'blank-magnet', colorToken: blank.dataset.token as PaletteToken };
    }
    const cell = hit.closest<HTMLElement>('#arc-calendar-shell [data-date]');
    if (cell?.dataset.date) return { kind: 'calendar', date: cell.dataset.date };
    if (hit.closest('#arc-fridge-panel, #arc-fridge-tab')) return { kind: 'fridge' };
    if (hit.closest('[data-arc-magnet-well]')) return { kind: 'desk' };
  }
  return { kind: 'desk' };
}
