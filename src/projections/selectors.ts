import { addSchoolDays, compareISO } from '../calendar/dates';
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
  /** Parent Unit id when this view is a Lesson. */
  unitId?: string;
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

export interface UnitLessonNest {
  unit: PlacementView;
  lessons: PlacementView[];
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
    if (placement.storage === 'drawer') continue;
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
      unitId: placement.objectType === 'lesson' ? domain.lessons[placement.objectId]?.unitId : undefined,
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
  const units = Object.values(domain.units).filter((u) => u.location === 'drawer');
  return [...units, ...notes, ...magnets].sort((a, b) => b.createdAt - a.createdAt);
}

export function getDeskUnits(domain: WorkspaceDomainState) {
  return Object.values(domain.units)
    .filter((unit) => unit.location !== 'drawer')
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getDeskNotes(domain: WorkspaceDomainState) {
  return Object.values(domain.notes)
    .filter((n) => n.location === 'desk')
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getLessonsForUnit(domain: WorkspaceDomainState, unitId: string) {
  return Object.values(domain.lessons)
    .filter((l) => l.unitId === unitId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getTaskBarNotes(domain: WorkspaceDomainState, column: 'must' | 'should' | 'could') {
  return domain.taskbar.columns[column]
    .map((id) => domain.notes[id])
    .filter((n): n is NonNullable<typeof n> => Boolean(n));
}

export function getSectionsForCourse(domain: WorkspaceDomainState, courseId: string) {
  return Object.values(domain.sections)
    .filter((s) => s.courseId === courseId && !s.archived)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getOrderedSections(domain: WorkspaceDomainState) {
  return Object.values(domain.sections)
    .filter((s) => !s.archived)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getCourseUnitsIntersecting(
  domain: WorkspaceDomainState,
  courseId: string,
  start: ISODate,
  end: ISODate,
): PlacementView[] {
  const views: PlacementView[] = [];
  for (const placement of Object.values(domain.placements)) {
    if (placement.objectType !== 'unit') continue;
    if (placement.storage === 'drawer') continue;
    const unit = domain.units[placement.objectId];
    if (!unit || unit.courseId !== courseId) continue;
    const pEnd = placement.endDate ?? placement.date;
    if (pEnd < start || placement.date > end) continue;
    const onStart = getPlacementsForDate(domain, placement.date).find((v) => v.placementId === placement.id);
    if (onStart) views.push(onStart);
  }
  return views.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getSectionLessonsForDate(
  domain: WorkspaceDomainState,
  sectionId: string,
  date: ISODate,
): PlacementView[] {
  const section = domain.sections[sectionId];
  if (!section) return [];
  return getPlacementsForDate(domain, date).filter((p) => {
    if (p.objectType !== 'lesson') return false;
    if (p.sectionId === sectionId) return true;
    const lesson = domain.lessons[p.objectId];
    return Boolean(lesson && !lesson.sectionId && lesson.courseId === section.courseId);
  });
}

export function getLoosePlacementsForDate(domain: WorkspaceDomainState, date: ISODate): PlacementView[] {
  return getPlacementsForDate(domain, date).filter(
    (p) => p.objectType === 'note' || p.objectType === 'magnet',
  );
}

export function deliveryForSection(
  domain: WorkspaceDomainState,
  sectionId: string,
  lessonId: string,
): DeliveryState | undefined {
  return domain.delivery[sectionId]?.[lessonId]?.state;
}

/** Units of a course, oldest first — Settings and create-dialog parent pickers. */
export function getUnitsForCourse(domain: WorkspaceDomainState, courseId: string) {
  return Object.values(domain.units)
    .filter((unit) => unit.courseId === courseId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Lessons sit inside their parent Unit. Lessons whose unit is not in `units`
 * (or that have no unitId) are returned as `loose`.
 */
export function nestLessonsInUnits(
  units: PlacementView[],
  lessons: PlacementView[],
): { groups: UnitLessonNest[]; loose: PlacementView[] } {
  const assigned = new Set<string>();
  const groups: UnitLessonNest[] = units.map((unit) => {
    const kids = lessons.filter((lesson) => lesson.unitId === unit.objectId);
    kids.forEach((kid) => assigned.add(kid.placementId));
    return { unit, lessons: kids };
  });
  return { groups, loose: lessons.filter((lesson) => !assigned.has(lesson.placementId)) };
}

export function countLessonsInUnit(domain: WorkspaceDomainState, unitId: string) {
  return Object.values(domain.lessons).filter((lesson) => lesson.unitId === unitId).length;
}

export interface NextUp {
  kind: 'resume' | 'upcoming';
  date: ISODate;
  title: string;
  sectionName?: string;
}

/** Live Classroom hold first; otherwise the next placed lesson after `fromDate`. */
export function getNextUp(domain: WorkspaceDomainState, fromDate: ISODate): NextUp | null {
  for (const section of getOrderedSections(domain)) {
    const records = domain.delivery[section.id] ?? {};
    for (const [lessonId, record] of Object.entries(records)) {
      if (record.state !== 'in-progress') continue;
      const lesson = domain.lessons[lessonId];
      if (!lesson) continue;
      return {
        kind: 'resume',
        date: fromDate,
        title: lesson.title,
        sectionName: section.name,
      };
    }
  }

  const cursorLimit = 40;
  let cursor = fromDate;
  for (let i = 0; i < cursorLimit; i += 1) {
    cursor = addSchoolDays(domain.calendar, cursor, 1);
    for (const section of getOrderedSections(domain)) {
      const lessons = getSectionLessonsForDate(domain, section.id, cursor);
      if (lessons[0]) {
        return {
          kind: 'upcoming',
          date: cursor,
          title: lessons[0].title,
          sectionName: section.name,
        };
      }
    }
  }
  return null;
}

/** Unique placements whose span overlaps `[start, end]`, using each placement’s start-day view. */
export function getPlacementsIntersectingRange(
  domain: WorkspaceDomainState,
  start: ISODate,
  end: ISODate,
): PlacementView[] {
  const views: PlacementView[] = [];
  for (const placement of Object.values(domain.placements)) {
    if (placement.storage === 'drawer') continue;
    const pEnd = placement.endDate ?? placement.date;
    if (pEnd < start || placement.date > end) continue;
    const onStart = getPlacementsForDate(domain, placement.date).find((view) => view.placementId === placement.id);
    if (onStart) views.push(onStart);
  }
  return views.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.order - b.order);
}
