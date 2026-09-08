import { compareISO } from '../calendar/dates';
import type {
  DeliveryState,
  ISODate,
  PaletteToken,
  PlaceableType,
  WorkspaceDomainState,
} from '../domain/types';

export interface PlacementView {
  placementId: string;
  objectType: PlaceableType;
  objectId: string;
  sectionId?: string;
  title: string;
  colorToken: PaletteToken;
  important: boolean;
  crossedOut: boolean;
  fixed: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  startDate: ISODate;
  endDate?: ISODate;
  deliveryState?: DeliveryState;
  order: number;
}

const FALLBACK_COLOR: PaletteToken = 'charcoal';

function resolveObject(domain: WorkspaceDomainState, type: PlaceableType, id: string) {
  if (type === 'unit') return domain.units[id];
  if (type === 'lesson') return domain.lessons[id];
  if (type === 'note') return domain.notes[id];
  return domain.magnets[id];
}

function resolveTitle(domain: WorkspaceDomainState, type: PlaceableType, id: string): string {
  const obj = resolveObject(domain, type, id);
  return obj?.title ?? 'Untitled';
}

function resolveColor(domain: WorkspaceDomainState, type: PlaceableType, id: string): PaletteToken {
  if (type === 'unit') return domain.units[id]?.colorToken ?? FALLBACK_COLOR;
  if (type === 'lesson') return domain.courses[domain.lessons[id]?.courseId ?? '']?.colorToken ?? FALLBACK_COLOR;
  if (type === 'note') return 'lavender';
  return 'kraft';
}

/** Every placement whose span touches this date, resolved into display-ready view models. */
export function getPlacementsForDate(domain: WorkspaceDomainState, date: ISODate): PlacementView[] {
  const views: PlacementView[] = [];
  for (const placement of Object.values(domain.placements)) {
    const start = placement.date;
    const end = placement.endDate ?? placement.date;
    if (compareISO(date, start) < 0 || compareISO(date, end) > 0) continue;

    const obj = resolveObject(domain, placement.objectType, placement.objectId);
    if (!obj) continue;

    const important = 'important' in obj ? obj.important : false;
    const crossedOut = 'crossedOut' in obj ? obj.crossedOut : false;

    views.push({
      placementId: placement.id,
      objectType: placement.objectType,
      objectId: placement.objectId,
      sectionId: placement.sectionId,
      title: resolveTitle(domain, placement.objectType, placement.objectId),
      colorToken: resolveColor(domain, placement.objectType, placement.objectId),
      important,
      crossedOut,
      fixed: placement.fixed,
      isRangeStart: date === start,
      isRangeEnd: date === end,
      startDate: start,
      endDate: placement.endDate,
      deliveryState: placement.sectionId
        ? domain.delivery[placement.sectionId]?.[placement.objectId]?.state
        : undefined,
      order: placement.order,
    });
  }
  return views.sort((a, b) => {
    if (a.objectType !== b.objectType) return a.objectType === 'unit' ? -1 : 1;
    return a.order - b.order;
  });
}

export function getPlacementsForRange(
  domain: WorkspaceDomainState,
  dates: ISODate[],
): Record<ISODate, PlacementView[]> {
  const map: Record<ISODate, PlacementView[]> = {};
  for (const date of dates) map[date] = getPlacementsForDate(domain, date);
  return map;
}

/** Units whose range covers `date` without starting on it — Day's "continuity first" context. */
export function getContinuingUnits(domain: WorkspaceDomainState, date: ISODate) {
  return getPlacementsForDate(domain, date).filter((p) => p.objectType === 'unit' && !p.isRangeStart);
}

export function getFridgeItems(domain: WorkspaceDomainState) {
  const notes = Object.values(domain.notes).filter((n) => n.location === 'fridge');
  const magnets = Object.values(domain.magnets).filter((m) => m.location === 'fridge');
  return [...notes, ...magnets].sort((a, b) => (a.fridgeSlot ?? 0) - (b.fridgeSlot ?? 0));
}

export function getDrawerItems(domain: WorkspaceDomainState) {
  const notes = Object.values(domain.notes).filter((n) => n.location === 'drawer');
  const magnets = Object.values(domain.magnets).filter((m) => m.location === 'drawer');
  return [...notes, ...magnets].sort((a, b) => b.createdAt - a.createdAt);
}

export function getTaskBarNotes(domain: WorkspaceDomainState, column: 'must' | 'should' | 'could') {
  return domain.taskbar.columns[column]
    .map((id) => domain.notes[id])
    .filter((n): n is NonNullable<typeof n> => Boolean(n));
}

export function getSectionsForCourse(domain: WorkspaceDomainState, courseId: string) {
  return Object.values(domain.sections).filter((s) => s.courseId === courseId);
}
