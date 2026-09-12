import type { Draft } from 'immer';
import { addCalendarDays, addSchoolDays, compareISO, fromISODate, isInstructionalDay } from '../calendar/dates';
import { DomainError } from './errors';
import { createId } from './ids';
import type {
  Course,
  DeliveryState,
  ISODate,
  Lesson,
  Magnet,
  MagnetKind,
  Note,
  NoteLocation,
  PaletteToken,
  PlaceableType,
  Placement,
  PlacementStorage,
  Section,
  SectionDayMark,
  TaskColumn,
  TeacherOutReason,
  Unit,
  Visibility,
  WorkspaceDomainState,
} from './types';
import { filledLessonBody } from './lessonStructure';

type D = Draft<WorkspaceDomainState>;

export function pushHistory(draft: D, type: string, summary: string) {
  draft.history.unshift({ id: createId('hist'), timestamp: Date.now(), type, summary });
  // Cap history length so persisted state does not grow without bound.
  if (draft.history.length > 300) draft.history.length = 300;
}

/* ------------------------------- Courses --------------------------------- */

export function createCourse(
  draft: D,
  payload: { name: string; colorToken: PaletteToken },
): Course {
  const course: Course = {
    id: createId('course'),
    name: payload.name,
    colorToken: payload.colorToken,
    createdAt: Date.now(),
    lessonStructure: [],
    lessonFrame: 'none',
  };
  draft.courses[course.id] = course;
  pushHistory(draft, 'createCourse', `Created course "${course.name}"`);
  return course as Course;
}

export function editCourse(draft: D, payload: { id: string; patch: Partial<Course> }) {
  const course = draft.courses[payload.id];
  if (!course) throw new DomainError('Course not found.');
  Object.assign(course, payload.patch);
  pushHistory(draft, 'editCourse', `Edited course "${course.name}"`);
}

/* ------------------------------- Sections --------------------------------- */

export function createSection(draft: D, payload: { courseId: string; name: string }): Section {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  const section: Section = {
    id: createId('section'),
    courseId: payload.courseId,
    name: payload.name,
    createdAt: Date.now(),
    lessonStructure: [],
    dayMarks: {},
  };
  draft.sections[section.id] = section;
  pushHistory(draft, 'createSection', `Created section "${section.name}"`);
  return section as Section;
}

export function editSection(draft: D, payload: { id: string; patch: Partial<Section> }) {
  const section = draft.sections[payload.id];
  if (!section) throw new DomainError('Section not found.');
  Object.assign(section, payload.patch);
  pushHistory(draft, 'editSection', `Edited section "${section.name}"`);
}

export function setSectionDayMark(
  draft: D,
  payload: { sectionId: string; date: ISODate; complete?: boolean; note?: string },
): SectionDayMark {
  const section = draft.sections[payload.sectionId];
  if (!section) throw new DomainError('Section not found.');
  if (!section.dayMarks) section.dayMarks = {};
  const prev = section.dayMarks[payload.date] ?? { complete: false, note: '' };
  const next: SectionDayMark = {
    complete: payload.complete ?? prev.complete,
    note: payload.note ?? prev.note,
  };
  if (!next.complete && !next.note.trim()) {
    delete section.dayMarks[payload.date];
    return { complete: false, note: '' };
  }
  section.dayMarks[payload.date] = next;
  pushHistory(draft, 'setSectionDayMark', `Marked ${section.name} on ${payload.date}`);
  return next;
}

/* --------------------------------- Units ----------------------------------- */

export function createUnit(
  draft: D,
  payload: {
    courseId: string;
    title: string;
    colorToken: PaletteToken;
    startDate: ISODate;
    endDate: ISODate;
    notes?: string;
  },
): Unit {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  // Units belong to Course + calendar, never to a single Section (Master Operating Document \u00a74).
  const unit: Unit = {
    id: createId('unit'),
    kind: 'unit',
    courseId: payload.courseId,
    title: payload.title,
    colorToken: payload.colorToken,
    notes: payload.notes,
    important: false,
    createdAt: Date.now(),
    location: 'calendar',
  };
  draft.units[unit.id] = unit;
  place(draft, {
    objectType: 'unit',
    objectId: unit.id,
    date: payload.startDate,
    endDate: payload.endDate,
    fixed: false,
  });
  pushHistory(draft, 'createUnit', `Created unit "${unit.title}"`);
  return unit as Unit;
}

function requireActiveCourse(draft: D) {
  const course = Object.values(draft.courses).find((c) => !c.archived);
  if (!course) throw new DomainError('Create a course in Settings first.');
  return course;
}

function nextUnitTitle(draft: D, explicit?: string) {
  const named = explicit?.trim();
  if (named) return named;
  return `Unit ${Object.keys(draft.units).length + 1}`;
}

/** A brand magnet dropped on a day becomes a Unit — never a task or a lesson. */
export function createUnitFromMagnet(
  draft: D,
  payload: { colorToken: PaletteToken; date: ISODate; title?: string },
): Unit {
  const course = requireActiveCourse(draft);
  return createUnit(draft, {
    courseId: course.id,
    title: nextUnitTitle(draft, payload.title),
    colorToken: payload.colorToken,
    startDate: payload.date,
    endDate: addCalendarDays(payload.date, 9),
  });
}

function calendarDayDelta(from: ISODate, to: ISODate): number {
  return Math.round((fromISODate(to).getTime() - fromISODate(from).getTime()) / 86400000);
}

export function isParkedPlacement(placement: { storage?: PlacementStorage } | undefined): boolean {
  return placement?.storage === 'drawer' || placement?.storage === 'desk';
}

function setNestedLessonStorage(draft: D, unitId: string, storage: PlacementStorage) {
  for (const p of Object.values(draft.placements)) {
    if (p.objectType !== 'lesson') continue;
    const lesson = draft.lessons[p.objectId];
    if (lesson?.unitId === unitId) p.storage = storage;
  }
}

function shiftNestedLessonDates(draft: D, unitId: string, fromStart: ISODate, toStart: ISODate) {
  const delta = calendarDayDelta(fromStart, toStart);
  if (delta === 0) return;
  for (const p of Object.values(draft.placements)) {
    if (p.objectType !== 'lesson') continue;
    const lesson = draft.lessons[p.objectId];
    if (lesson?.unitId !== unitId) continue;
    p.date = addCalendarDays(p.date, delta);
    if (p.endDate) p.endDate = addCalendarDays(p.endDate, delta);
  }
}

function findObjectPlacement(draft: D, objectType: PlaceableType, objectId: string) {
  return Object.values(draft.placements).find((p) => p.objectType === objectType && p.objectId === objectId);
}

function parkUnit(draft: D, payload: { unitId: string; location: 'desk' | 'drawer' }): void {
  const unit = draft.units[payload.unitId];
  if (!unit) throw new DomainError('Unit not found.');
  unit.location = payload.location;
  const existing = findObjectPlacement(draft, 'unit', unit.id);
  if (existing) existing.storage = payload.location;
  setNestedLessonStorage(draft, unit.id, payload.location);
  pushHistory(
    draft,
    payload.location === 'desk' ? 'stowUnit' : 'stowUnit',
    payload.location === 'desk'
      ? `Parked unit "${unit.title}" on the desk`
      : `Stored unit "${unit.title}" in the drawer`,
  );
}

/** Same unit, new dates. Does not clone, does not flatten into a lesson or task. */
export function placeUnitOnDate(draft: D, payload: { unitId: string; date: ISODate }): void {
  const unit = draft.units[payload.unitId];
  if (!unit) throw new DomainError('Unit not found.');
  const existing = Object.values(draft.placements).find(
    (p) => p.objectType === 'unit' && p.objectId === payload.unitId,
  );
  unit.location = 'calendar';
  if (existing) {
    existing.storage = 'calendar';
    setNestedLessonStorage(draft, payload.unitId, 'calendar');
    move(draft, { placementId: existing.id, date: payload.date });
    return;
  }
  place(draft, {
    objectType: 'unit',
    objectId: payload.unitId,
    date: payload.date,
    endDate: addCalendarDays(payload.date, 9),
    fixed: false,
  });
  const kids = Object.values(draft.lessons)
    .filter((lesson) => lesson.unitId === payload.unitId)
    .sort((a, b) => a.createdAt - b.createdAt);
  const remembered = kids
    .map((lesson) => findObjectPlacement(draft, 'lesson', lesson.id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (remembered.length > 0) {
    const oldStart = remembered.reduce((min, p) => (p.date < min ? p.date : min), remembered[0].date);
    setNestedLessonStorage(draft, payload.unitId, 'calendar');
    shiftNestedLessonDates(draft, payload.unitId, oldStart, payload.date);
  }
  let slot = remembered.length;
  for (const lesson of kids) {
    if (findObjectPlacement(draft, 'lesson', lesson.id)) continue;
    place(draft, {
      objectType: 'lesson',
      objectId: lesson.id,
      date: addCalendarDays(payload.date, slot),
      sectionId: lesson.sectionId,
      fixed: false,
      allowCollision: true,
    });
    slot += 1;
  }
  pushHistory(draft, 'placeUnit', `Placed unit "${unit.title}"`);
}

/**
 * A unit dragged to the Fridge goes in the drawer.
 * Same unit, remembered dates — not a task, idea, or deleted object.
 */
export function stowUnitInDrawer(draft: D, payload: { unitId: string }): void {
  parkUnit(draft, { unitId: payload.unitId, location: 'drawer' });
}

/** A unit dragged off the spread becomes a desk magnet and takes its nested lessons. */
export function stowUnitOnDesk(draft: D, payload: { unitId: string }): void {
  parkUnit(draft, { unitId: payload.unitId, location: 'desk' });
}

function mintUnplacedUnit(
  draft: D,
  payload: { colorToken: PaletteToken; title?: string; location: 'desk' | 'drawer' },
): Unit {
  const course = requireActiveCourse(draft);
  const unit: Unit = {
    id: createId('unit'),
    kind: 'unit',
    courseId: course.id,
    title: nextUnitTitle(draft, payload.title),
    colorToken: payload.colorToken,
    important: false,
    createdAt: Date.now(),
    location: payload.location,
  };
  draft.units[unit.id] = unit;
  return unit as Unit;
}

/** Blank brand magnet dropped on the Fridge becomes a unit waiting in the drawer. */
export function createUnitInDrawer(draft: D, payload: { colorToken: PaletteToken; title?: string }): Unit {
  const unit = mintUnplacedUnit(draft, { ...payload, location: 'drawer' });
  pushHistory(draft, 'stowUnit', `Stored unit "${unit.title}" in the drawer`);
  return unit;
}

/** Writing on a desk magnet mints a Unit that still lives on the desk until it is placed. */
export function createUnitOnDesk(draft: D, payload: { colorToken: PaletteToken; title?: string }): Unit {
  const unit = mintUnplacedUnit(draft, { ...payload, location: 'desk' });
  pushHistory(draft, 'createUnit', `Wrote unit "${unit.title}" on a magnet`);
  return unit;
}

const MAGNET_KIND_COLOR: Record<MagnetKind, PaletteToken> = {
  idea: 'mustard',
  voice: 'blue',
  resource: 'sage',
  reminder: 'terracotta',
};

/** A Fridge/desk Magnet object dropped on a day becomes a Unit span, not a decorative chip. */
export function placeMagnetAsUnit(
  draft: D,
  payload: { magnetId: string; date: ISODate },
): Unit {
  const magnet = draft.magnets[payload.magnetId];
  if (!magnet) throw new DomainError('Magnet not found.');
  const unit = createUnitFromMagnet(draft, {
    colorToken: MAGNET_KIND_COLOR[magnet.magnetKind],
    date: payload.date,
    title: magnet.title,
  });
  for (const [pid, placement] of Object.entries(draft.placements)) {
    if (placement.objectType === 'magnet' && placement.objectId === magnet.id) {
      delete draft.placements[pid];
    }
  }
  delete draft.magnets[magnet.id];
  return unit;
}

export function editUnit(draft: D, payload: { id: string; patch: Partial<Unit> }) {
  const unit = draft.units[payload.id];
  if (!unit) throw new DomainError('Unit not found.');
  Object.assign(unit, payload.patch);
  pushHistory(draft, 'editUnit', `Edited unit "${unit.title}"`);
}

function unitHasScheduledChildren(draft: D, unitId: string): boolean {
  return Object.values(draft.lessons).some(
    (lesson) =>
      lesson.unitId === unitId &&
      Object.values(draft.placements).some(
        (p) => p.objectType === 'lesson' && p.objectId === lesson.id && !isParkedPlacement(p),
      ),
  );
}

function unitHasAnyChildren(draft: D, unitId: string): boolean {
  return Object.values(draft.lessons).some((lesson) => lesson.unitId === unitId);
}

/* -------------------------------- Lessons ----------------------------------- */

export function createLesson(
  draft: D,
  payload: {
    courseId: string;
    unitId?: string;
    sectionId?: string;
    title: string;
    body?: string;
    date: ISODate;
    visibility?: Visibility;
    allowCollision?: boolean;
  },
): Lesson {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  const lesson: Lesson = {
    id: createId('lesson'),
    kind: 'lesson',
    courseId: payload.courseId,
    unitId: payload.unitId,
    sectionId: payload.sectionId,
    title: payload.title,
    body: filledLessonBody(
      { body: payload.body, courseId: payload.courseId, sectionId: payload.sectionId },
      draft,
    ),
    important: false,
    crossedOut: false,
    visibility: payload.visibility ?? 'teacher-private',
    createdAt: Date.now(),
  };
  draft.lessons[lesson.id] = lesson;
  place(draft, {
    objectType: 'lesson',
    objectId: lesson.id,
    date: payload.date,
    sectionId: payload.sectionId,
    fixed: false,
    allowCollision: payload.allowCollision,
  });
  pushHistory(draft, 'createLesson', `Created lesson "${lesson.title}"`);
  return lesson as Lesson;
}

export function editLesson(draft: D, payload: { id: string; patch: Partial<Lesson> }) {
  const lesson = draft.lessons[payload.id];
  if (!lesson) throw new DomainError('Lesson not found.');
  Object.assign(lesson, payload.patch);
  pushHistory(draft, 'editLesson', `Edited lesson "${lesson.title}"`);
}

function parkLesson(draft: D, payload: { lessonId: string; location: 'desk' | 'drawer' }): void {
  const lesson = draft.lessons[payload.lessonId];
  if (!lesson) throw new DomainError('Lesson not found.');
  lesson.unitId = undefined;
  const existing = findObjectPlacement(draft, 'lesson', lesson.id);
  if (existing) existing.storage = payload.location;
  else {
    const created = place(draft, {
      objectType: 'lesson',
      objectId: lesson.id,
      date: draft.calendar.startDate,
      sectionId: lesson.sectionId,
      fixed: false,
      allowCollision: true,
    });
    created.storage = payload.location;
  }
  pushHistory(
    draft,
    'stowLesson',
    payload.location === 'desk'
      ? `Parked lesson "${lesson.title}" on the desk`
      : `Stored lesson "${lesson.title}" in the drawer`,
  );
}

/** A standalone lesson dragged off the spread becomes a desk slip, not a note. */
export function stowLessonOnDesk(draft: D, payload: { lessonId: string }): void {
  parkLesson(draft, { lessonId: payload.lessonId, location: 'desk' });
}

export function stowLessonInDrawer(draft: D, payload: { lessonId: string }): void {
  parkLesson(draft, { lessonId: payload.lessonId, location: 'drawer' });
}

/** Drop a lesson on a unit magnet or unit bar — it becomes a stacked sub-lesson. */
export function nestLessonInUnit(draft: D, payload: { lessonId: string; unitId: string }): void {
  const lesson = draft.lessons[payload.lessonId];
  if (!lesson) throw new DomainError('Lesson not found.');
  const unit = draft.units[payload.unitId];
  if (!unit) throw new DomainError('Unit not found.');
  lesson.unitId = payload.unitId;
  const lessonPlacement = findObjectPlacement(draft, 'lesson', lesson.id);
  if (unit.location === 'desk' || unit.location === 'drawer') {
    if (lessonPlacement) lessonPlacement.storage = unit.location;
  } else if (lessonPlacement && isParkedPlacement(lessonPlacement)) {
    lessonPlacement.storage = 'calendar';
  }
  pushHistory(draft, 'nestLesson', `Nested "${lesson.title}" under "${unit.title}"`);
}

/** Drop a lesson on a blank brand magnet — mint a desk unit and stack the lesson under it. */
export function nestLessonOnBlankMagnet(
  draft: D,
  payload: { lessonId: string; colorToken: PaletteToken },
): Unit {
  const unit = createUnitOnDesk(draft, { colorToken: payload.colorToken });
  nestLessonInUnit(draft, { lessonId: payload.lessonId, unitId: unit.id });
  return unit;
}

export function placeLessonOnDate(draft: D, payload: { lessonId: string; date: ISODate }): void {
  const lesson = draft.lessons[payload.lessonId];
  if (!lesson) throw new DomainError('Lesson not found.');
  const existing = findObjectPlacement(draft, 'lesson', lesson.id);
  if (existing) {
    existing.storage = 'calendar';
    move(draft, { placementId: existing.id, date: payload.date, allowCollision: true });
    return;
  }
  place(draft, {
    objectType: 'lesson',
    objectId: lesson.id,
    date: payload.date,
    sectionId: lesson.sectionId,
    fixed: false,
    allowCollision: true,
  });
  pushHistory(draft, 'placeLesson', `Placed lesson "${lesson.title}"`);
}

export function copyLesson(draft: D, payload: { id: string; date: ISODate }): Lesson {
  const source = draft.lessons[payload.id];
  if (!source) throw new DomainError('Lesson not found.');
  return createLesson(draft, {
    courseId: source.courseId,
    unitId: source.unitId,
    sectionId: source.sectionId,
    title: source.title,
    body: source.body,
    date: payload.date,
    visibility: source.visibility,
  });
}

/* --------------------------------- Notes ------------------------------------ */

export function createNote(
  draft: D,
  payload: {
    title: string;
    body?: string;
    location: NoteLocation;
    taskColumn?: TaskColumn;
    date?: ISODate;
  },
): Note {
  if (payload.location === 'calendar' && !payload.date) {
    throw new DomainError('A calendar note needs a date.');
  }
  const note: Note = {
    id: createId('note'),
    kind: 'note',
    title: payload.title,
    body: payload.body,
    important: false,
    crossedOut: false,
    location: payload.location,
    taskColumn: payload.taskColumn,
    createdAt: Date.now(),
  };
  draft.notes[note.id] = note;
  if (payload.location === 'taskbar' && payload.taskColumn) {
    draft.taskbar.columns[payload.taskColumn].push(note.id);
  }
  if (payload.location === 'fridge') {
    note.fridgeSlot = nextFridgeSlot(draft);
  }
  if (payload.location === 'calendar' && payload.date) {
    place(draft, { objectType: 'note', objectId: note.id, date: payload.date, fixed: false });
  }
  if (payload.location === 'desk') {
    scatterDeskNote(note, draft);
  }
  pushHistory(draft, 'createNote', `Created note "${note.title}"`);
  return note as Note;
}

const DESK_SPOTS = [
  { x: 7, y: 24, r: -6 },
  { x: 78, y: 16, r: 5 },
  { x: 76, y: 58, r: -4 },
  { x: 9, y: 62, r: 7 },
  { x: 82, y: 38, r: -8 },
];

function scatterDeskNote(note: Note, draft: D) {
  if (note.deskX != null && note.deskY != null) return;
  const count = Object.values(draft.notes).filter((n) => n.location === 'desk' && n.id !== note.id).length;
  const spot = DESK_SPOTS[count % DESK_SPOTS.length];
  note.deskX = spot.x;
  note.deskY = spot.y;
  note.deskRotate = spot.r;
}

/** Reposition a desk post-it. Call once on pointerup — not while dragging. */
export function slideDeskNote(draft: D, payload: { noteId: string; deskX: number; deskY: number }): void {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  note.deskX = Math.min(92, Math.max(1, payload.deskX));
  note.deskY = Math.min(88, Math.max(2, payload.deskY));
  pushHistory(draft, 'slideDeskNote', `Slid note "${note.title}" on the desk`);
}

export function editNote(draft: D, payload: { id: string; patch: Partial<Note> }) {
  const note = draft.notes[payload.id];
  if (!note) throw new DomainError('Note not found.');
  Object.assign(note, payload.patch);
  pushHistory(draft, 'editNote', `Edited note "${note.title}"`);
}

/* -------------------------------- Magnets ------------------------------------ */

export function createMagnet(
  draft: D,
  payload: { magnetKind: MagnetKind; title: string; body?: string },
): Magnet {
  const magnet: Magnet = {
    id: createId('magnet'),
    kind: 'magnet',
    magnetKind: payload.magnetKind,
    title: payload.title,
    body: payload.body,
    location: 'fridge',
    fridgeSlot: nextFridgeSlot(draft),
    createdAt: Date.now(),
  };
  draft.magnets[magnet.id] = magnet;
  pushHistory(draft, 'createMagnet', `Pinned ${payload.magnetKind} "${magnet.title}" to the fridge`);
  return magnet as Magnet;
}

export function editMagnet(draft: D, payload: { id: string; patch: Partial<Magnet> }) {
  const magnet = draft.magnets[payload.id];
  if (!magnet) throw new DomainError('Magnet not found.');
  Object.assign(magnet, payload.patch);
  pushHistory(draft, 'editMagnet', `Edited "${magnet.title}"`);
}

function occupiedFridgeSlots(draft: D): Set<number> {
  const slots = new Set<number>();
  for (const n of Object.values(draft.notes)) if (n.location === 'fridge' && n.fridgeSlot != null) slots.add(n.fridgeSlot);
  for (const m of Object.values(draft.magnets)) if (m.location === 'fridge' && m.fridgeSlot != null) slots.add(m.fridgeSlot);
  return slots;
}

function nextFridgeSlot(draft: D): number {
  const occupied = occupiedFridgeSlots(draft);
  for (let i = 0; i < draft.fridge.capacity; i++) {
    if (!occupied.has(i)) return i;
  }
  return -1; // Fridge is full; caller routes to Drawer instead.
}

/* ------------------------------ Placements ------------------------------------ */

export function place(
  draft: D,
  payload: {
    objectType: PlaceableType;
    objectId: string;
    date: ISODate;
    endDate?: ISODate;
    sectionId?: string;
    fixed?: boolean;
    allowCollision?: boolean;
  },
): Placement {
  if (
    payload.objectType === 'lesson' &&
    payload.sectionId &&
    !payload.allowCollision &&
    hasCollision(draft, payload.sectionId, payload.date, undefined)
  ) {
    throw new DomainError(
      'This section already has a lesson placed on that day. Confirm the replacement to continue.',
    );
  }
  const order = Object.values(draft.placements).filter(
    (p) => p.date === payload.date && !isParkedPlacement(p),
  ).length;
  const placement: Placement = {
    id: createId('placement'),
    objectType: payload.objectType,
    objectId: payload.objectId,
    sectionId: payload.sectionId,
    date: payload.date,
    endDate: payload.endDate,
    order,
    fixed: payload.fixed ?? false,
  };
  draft.placements[placement.id] = placement;
  if (payload.objectType === 'magnet') {
    const magnet = draft.magnets[payload.objectId];
    if (magnet) magnet.location = 'calendar';
  }
  if (payload.objectType === 'note') {
    const note = draft.notes[payload.objectId];
    if (note) {
      if (note.taskColumn) {
        const col = draft.taskbar.columns[note.taskColumn];
        const idx = col.indexOf(note.id);
        if (idx >= 0) col.splice(idx, 1);
        note.taskColumn = undefined;
      }
      note.location = 'calendar';
      note.fridgeSlot = undefined;
    }
  }
  return placement as Placement;
}

function hasCollision(
  draft: D,
  sectionId: string,
  date: ISODate,
  excludePlacementId: string | undefined,
): boolean {
  return Object.values(draft.placements).some(
    (p) =>
      p.id !== excludePlacementId &&
      p.objectType === 'lesson' &&
      p.sectionId === sectionId &&
      p.date === date &&
      !isParkedPlacement(p),
  );
}

export function move(
  draft: D,
  payload: { placementId: string; date: ISODate; endDate?: ISODate; allowCollision?: boolean },
): void {
  const placement = draft.placements[payload.placementId];
  if (!placement) throw new DomainError('Placement not found.');
  if (placement.fixed) {
    throw new DomainError('This item is fixed and will not move unless you unfix it first.');
  }
  if (
    placement.objectType === 'lesson' &&
    placement.sectionId &&
    !payload.allowCollision &&
    hasCollision(draft, placement.sectionId, payload.date, placement.id)
  ) {
    throw new DomainError(
      'This section already has a lesson placed on that day. Confirm the replacement to continue.',
    );
  }
  const oldDate = placement.date;
  if (placement.objectType === 'unit' && placement.endDate && payload.endDate === undefined) {
    const span = Math.round(
      (fromISODate(placement.endDate).getTime() - fromISODate(placement.date).getTime()) / 86400000,
    );
    placement.date = payload.date;
    placement.endDate = addCalendarDays(payload.date, Math.max(0, span));
  } else {
    placement.date = payload.date;
    if (payload.endDate !== undefined) placement.endDate = payload.endDate;
  }
  if (placement.objectType === 'unit') {
    placement.storage = 'calendar';
    const unit = draft.units[placement.objectId];
    if (unit) unit.location = 'calendar';
    setNestedLessonStorage(draft, placement.objectId, 'calendar');
    shiftNestedLessonDates(draft, placement.objectId, oldDate, placement.date);
  }
  pushHistory(draft, 'move', `Moved an item to ${payload.date}`);
}

export function setPlacementFixed(draft: D, payload: { placementId: string; fixed: boolean }): void {
  const placement = draft.placements[payload.placementId];
  if (!placement) throw new DomainError('Placement not found.');
  placement.fixed = payload.fixed;
  pushHistory(draft, 'setPlacementFixed', payload.fixed ? 'Pinned a date as fixed' : 'Unpinned a fixed date');
}

export function unplace(draft: D, payload: { placementId: string }): void {
  const placement = draft.placements[payload.placementId];
  if (!placement) throw new DomainError('Placement not found.');
  if (placement.objectType === 'unit' && unitHasScheduledChildren(draft, placement.objectId)) {
    throw new DomainError(
      'This unit still has scheduled lessons. Move or unplace them before unplacing the unit.',
    );
  }
  delete draft.placements[payload.placementId];
  if (placement.objectType === 'magnet') {
    const magnet = draft.magnets[placement.objectId];
    if (magnet) {
      magnet.location = nextFridgeSlot(draft) >= 0 ? 'fridge' : 'drawer';
      magnet.fridgeSlot = magnet.location === 'fridge' ? nextFridgeSlot(draft) : undefined;
    }
  }
  if (placement.objectType === 'note') {
    const note = draft.notes[placement.objectId];
    if (note) {
      note.location = 'desk';
      note.fridgeSlot = undefined;
      scatterDeskNote(note, draft);
    }
  }
  if (placement.objectType === 'unit') {
    const unit = draft.units[placement.objectId];
    if (unit) unit.location = 'desk';
  }
  pushHistory(draft, 'unplace', 'Unplaced an item');
}

/* -------------------------------- Deletion ------------------------------------- */

export function deleteObject(
  draft: D,
  payload: { objectType: PlaceableType | 'note' | 'course' | 'section'; objectId: string },
): void {
  const { objectType, objectId } = payload;
  if (objectType === 'unit' && unitHasAnyChildren(draft, objectId)) {
    throw new DomainError('Delete or reassign the lessons in this unit before deleting it.');
  }
  if (objectType === 'course') {
    const hasChildren =
      Object.values(draft.sections).some((s) => s.courseId === objectId) ||
      Object.values(draft.units).some((u) => u.courseId === objectId) ||
      Object.values(draft.lessons).some((l) => l.courseId === objectId);
    if (hasChildren) throw new DomainError('Delete sections, units, and lessons under this course first.');
    delete draft.courses[objectId];
    pushHistory(draft, 'deleteCourse', 'Deleted a course');
    return;
  }
  if (objectType === 'section') {
    const hasChildren =
      Object.values(draft.lessons).some((l) => l.sectionId === objectId) ||
      Object.values(draft.placements).some((p) => p.sectionId === objectId);
    if (hasChildren) throw new DomainError('Reassign or delete this section\u2019s scheduled items first.');
    delete draft.sections[objectId];
    pushHistory(draft, 'deleteSection', 'Deleted a section');
    return;
  }

  for (const [pid, p] of Object.entries(draft.placements)) {
    if (p.objectType === objectType && p.objectId === objectId) delete draft.placements[pid];
  }

  if (objectType === 'unit') delete draft.units[objectId];
  else if (objectType === 'lesson') delete draft.lessons[objectId];
  else if (objectType === 'magnet') delete draft.magnets[objectId];
  else if (objectType === 'note') {
    const note = draft.notes[objectId];
    if (note?.taskColumn) {
      const col = draft.taskbar.columns[note.taskColumn];
      const idx = col.indexOf(objectId);
      if (idx >= 0) col.splice(idx, 1);
    }
    delete draft.notes[objectId];
  }
  pushHistory(draft, 'deleteObject', `Deleted a ${objectType}`);
}

/* ------------------------------ Importance / state ------------------------------- */

export function markImportant(
  draft: D,
  payload: { objectType: 'unit' | 'lesson' | 'note'; objectId: string; important: boolean },
): void {
  const store = draft[`${payload.objectType}s` as 'units' | 'lessons' | 'notes'] as Record<
    string,
    { important: boolean; title: string }
  >;
  const obj = store[payload.objectId];
  if (!obj) throw new DomainError('Item not found.');
  obj.important = payload.important;
  pushHistory(
    draft,
    'markImportant',
    `${payload.important ? 'Marked' : 'Unmarked'} "${obj.title}" as important`,
  );
}

export function crossOut(
  draft: D,
  payload: { objectType: 'lesson' | 'note'; objectId: string; crossedOut: boolean },
): void {
  const store = draft[`${payload.objectType}s` as 'lessons' | 'notes'] as Record<
    string,
    { crossedOut: boolean; title: string }
  >;
  const obj = store[payload.objectId];
  if (!obj) throw new DomainError('Item not found.');
  obj.crossedOut = payload.crossedOut;
  pushHistory(draft, 'crossOut', `Crossed ${payload.crossedOut ? 'out' : 'back in'} "${obj.title}"`);
}

/* --------------------------------- Notes routing ----------------------------------- */

export function moveMagnetToFridge(draft: D, payload: { magnetId: string }): void {
  const magnet = draft.magnets[payload.magnetId];
  if (!magnet) throw new DomainError('Item not found.');
  for (const [pid, p] of Object.entries(draft.placements)) {
    if (p.objectType === 'magnet' && p.objectId === magnet.id) delete draft.placements[pid];
  }
  const slot = nextFridgeSlot(draft);
  magnet.location = slot >= 0 ? 'fridge' : 'drawer';
  magnet.fridgeSlot = slot >= 0 ? slot : undefined;
  pushHistory(draft, 'moveToFridge', `Moved "${magnet.title}" to the fridge`);
}

export function moveMagnetToDrawer(draft: D, payload: { magnetId: string }): void {
  const magnet = draft.magnets[payload.magnetId];
  if (!magnet) throw new DomainError('Item not found.');
  for (const [pid, p] of Object.entries(draft.placements)) {
    if (p.objectType === 'magnet' && p.objectId === magnet.id) delete draft.placements[pid];
  }
  magnet.location = 'drawer';
  magnet.fridgeSlot = undefined;
  pushHistory(draft, 'moveToDrawer', `Moved "${magnet.title}" to the drawer`);
}

function removeNoteCalendarPlacement(draft: D, noteId: string) {
  for (const [pid, p] of Object.entries(draft.placements)) {
    if (p.objectType === 'note' && p.objectId === noteId) delete draft.placements[pid];
  }
}

function removeNoteFromTaskBar(draft: D, note: Draft<Note>) {
  if (!note.taskColumn) return;
  const col = draft.taskbar.columns[note.taskColumn];
  const idx = col.indexOf(note.id);
  if (idx >= 0) col.splice(idx, 1);
  note.taskColumn = undefined;
}

export function moveNoteToFridge(draft: D, payload: { noteId: string }): void {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  removeNoteCalendarPlacement(draft, note.id);
  removeNoteFromTaskBar(draft, note);
  const slot = nextFridgeSlot(draft);
  note.location = slot >= 0 ? 'fridge' : 'drawer';
  note.fridgeSlot = slot >= 0 ? slot : undefined;
  pushHistory(draft, 'moveToFridge', `Moved "${note.title}" to the fridge`);
}

export function moveNoteToDrawer(draft: D, payload: { noteId: string }): void {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  removeNoteCalendarPlacement(draft, note.id);
  removeNoteFromTaskBar(draft, note);
  note.location = 'drawer';
  note.fridgeSlot = undefined;
  pushHistory(draft, 'moveToDrawer', `Moved "${note.title}" to the drawer`);
}

export function moveNoteToTaskBar(draft: D, payload: { noteId: string; column: TaskColumn }): void {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  removeNoteCalendarPlacement(draft, note.id);
  removeNoteFromTaskBar(draft, note);
  note.location = 'taskbar';
  note.taskColumn = payload.column;
  note.fridgeSlot = undefined;
  draft.taskbar.columns[payload.column].push(note.id);
  pushHistory(draft, 'moveToTaskBar', `Moved "${note.title}" to ${payload.column.toUpperCase()}`);
}

/* -------------------------------- Delivery / Live -------------------------------- */

export function setDelivery(
  draft: D,
  payload: {
    sectionId: string;
    lessonId: string;
    state: DeliveryState;
    resumeNote?: string;
    actualDate?: ISODate;
  },
): void {
  const lesson = draft.lessons[payload.lessonId];
  if (!lesson) throw new DomainError('Lesson not found.');
  if (payload.state === 'in-progress' && !payload.resumeNote?.trim()) {
    throw new DomainError('Stop here needs a short resume note so you know where to pick back up.');
  }
  const existing = draft.delivery[payload.sectionId]?.[payload.lessonId];
  if (payload.state === 'skipped' && existing && existing.state !== 'not-started') {
    throw new DomainError('Only a not-started lesson can be skipped.');
  }
  if (existing && (existing.state === 'completed' || existing.state === 'skipped')) {
    throw new DomainError('This lesson already has a final outcome and cannot be relaunched.');
  }
  if (!draft.delivery[payload.sectionId]) draft.delivery[payload.sectionId] = {};
  draft.delivery[payload.sectionId][payload.lessonId] = {
    state: payload.state,
    resumeNote: payload.resumeNote,
    actualDate: payload.actualDate,
  };
  pushHistory(draft, 'setDelivery', `Marked "${lesson.title}" as ${payload.state.replace('-', ' ')}`);
}

/**
 * Wipes the generated example plan (courses/sections/units/lessons/notes/
 * magnets/placements/delivery) while preserving the real school-calendar
 * setup, so the teacher can start their own plan on a truthful blank
 * workspace instead of an indistinguishable demo (Canonical Product Spec \u00a72).
 */
export function clearSampleData(draft: D): void {
  draft.courses = {};
  draft.sections = {};
  draft.units = {};
  draft.lessons = {};
  draft.notes = {};
  draft.magnets = {};
  draft.placements = {};
  draft.delivery = {};
  draft.taskbar.columns = { must: [], should: [], could: [] };
  draft.isSampleWorkspace = false;
  pushHistory(draft, 'clearSampleData', 'Cleared the sample plan to start fresh');
}

/* ------------------------------- Calendar truth ----------------------------------- */

export function setCalendarDay(
  draft: D,
  payload: { date: ISODate; kind: WorkspaceDomainState['calendar']['days'][string]['kind']; label?: string },
): void {
  draft.calendar.days[payload.date] = {
    date: payload.date,
    kind: payload.kind,
    label: payload.label,
    confidence: 'confirmed',
  };
  pushHistory(draft, 'setCalendarDay', `Set ${payload.date} as ${payload.kind}${payload.label ? ` (${payload.label})` : ''}`);
}

function assertYearInstructionalDay(draft: D, date: ISODate, action: string) {
  if (
    !isInstructionalDay(draft.calendar, date) ||
    compareISO(date, draft.calendar.startDate) < 0 ||
    compareISO(date, draft.calendar.endDate) > 0
  ) {
    throw new DomainError(`Only a school day can be ${action} on the Year lens.`);
  }
}

export function toggleYearCross(draft: D, payload: { date: ISODate }): void {
  assertYearInstructionalDay(draft, payload.date, 'crossed out');
  if (!draft.calendar.crossedDates) draft.calendar.crossedDates = {};
  if (!draft.calendar.teacherOutDates) draft.calendar.teacherOutDates = {};
  if (draft.calendar.teacherOutDates[payload.date]) {
    delete draft.calendar.teacherOutDates[payload.date];
    pushHistory(draft, 'teacherOut', `Cleared out-of-school mark for ${payload.date}`);
    return;
  }
  if (draft.calendar.crossedDates[payload.date]) {
    delete draft.calendar.crossedDates[payload.date];
    pushHistory(draft, 'yearCross', `Restored ${payload.date} on the Year lens`);
    return;
  }
  draft.calendar.crossedDates[payload.date] = true;
  pushHistory(draft, 'yearCross', `Crossed out ${payload.date} on the Year lens`);
}

export function markTeacherOut(draft: D, payload: { date: ISODate; reason: TeacherOutReason | null }): void {
  assertYearInstructionalDay(draft, payload.date, 'marked');
  if (!draft.calendar.teacherOutDates) draft.calendar.teacherOutDates = {};
  if (!draft.calendar.crossedDates) draft.calendar.crossedDates = {};
  const current = draft.calendar.teacherOutDates[payload.date];
  if (payload.reason === null || payload.reason === current) {
    delete draft.calendar.teacherOutDates[payload.date];
    pushHistory(draft, 'teacherOut', `Cleared out-of-school mark for ${payload.date}`);
    return;
  }
  delete draft.calendar.crossedDates[payload.date];
  draft.calendar.teacherOutDates[payload.date] = payload.reason;
  const label = payload.reason === 'sick' ? 'out sick' : 'sub covered';
  pushHistory(draft, 'teacherOut', `Marked ${payload.date} as ${label}`);
}

export function updateSettings(draft: D, patch: Partial<WorkspaceDomainState['settings']>): void {
  Object.assign(draft.settings, patch);
  // Weekend visibility and start-of-week are linked, not independently
  // chosen (Master Operating Document \u00a73): Week defaults to Monday-Friday;
  // enabling weekends renders Sunday-Saturday with Sunday first.
  if (patch.showWeekends !== undefined && patch.weekStartsOn === undefined) {
    draft.settings.weekStartsOn = patch.showWeekends ? 'sunday' : 'monday';
  }
  draft.calendar.showWeekends = draft.settings.showWeekends;
  draft.calendar.weekStartsOn = draft.settings.weekStartsOn;
}

/* ----------------------------------- Shifts ---------------------------------------- */

export interface ShiftPreviewItem {
  placementId: string;
  objectType: PlaceableType;
  objectId: string;
  title: string;
  fromDate: ISODate;
  toDate: ISODate;
  fromEndDate?: ISODate;
  toEndDate?: ISODate;
}

export function previewShift(
  state: WorkspaceDomainState,
  payload: { sectionId: string; fromDate: ISODate; schoolDays: number },
): ShiftPreviewItem[] {
  const items: ShiftPreviewItem[] = [];
  for (const placement of Object.values(state.placements)) {
    if (isParkedPlacement(placement)) continue;
    if (placement.sectionId !== payload.sectionId) continue;
    if (placement.fixed) continue;
    if (compareISO(placement.date, payload.fromDate) < 0) continue;
    const toDate = addSchoolDays(state.calendar, placement.date, payload.schoolDays);
    const toEndDate = placement.endDate
      ? addSchoolDays(state.calendar, placement.endDate, payload.schoolDays)
      : undefined;
    const title =
      placement.objectType === 'lesson'
        ? state.lessons[placement.objectId]?.title
        : placement.objectType === 'unit'
          ? state.units[placement.objectId]?.title
          : state.magnets[placement.objectId]?.title;
    items.push({
      placementId: placement.id,
      objectType: placement.objectType,
      objectId: placement.objectId,
      title: title ?? 'Untitled',
      fromDate: placement.date,
      toDate,
      fromEndDate: placement.endDate,
      toEndDate,
    });
  }
  return items.sort((a, b) => compareISO(a.fromDate, b.fromDate));
}

export function applyShift(
  draft: D,
  payload: { sectionId: string; fromDate: ISODate; schoolDays: number; reason?: string },
): ShiftPreviewItem[] {
  const preview = previewShift(draft as unknown as WorkspaceDomainState, payload);
  for (const item of preview) {
    const placement = draft.placements[item.placementId];
    if (!placement) continue;
    placement.date = item.toDate;
    if (item.toEndDate) placement.endDate = item.toEndDate;
  }
  const sectionName = draft.sections[payload.sectionId]?.name ?? 'section';
  pushHistory(
    draft,
    'applyShift',
    `Shifted ${sectionName} by ${payload.schoolDays} school day${Math.abs(payload.schoolDays) === 1 ? '' : 's'} from ${payload.fromDate}${payload.reason ? ` (${payload.reason})` : ''}`,
  );
  return preview;
}

export { isInstructionalDay };
