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
  TaskColumn,
  Unit,
  Visibility,
  WorkspaceDomainState,
} from './types';

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

/** A brand magnet dropped on a day becomes a Unit — never a task or a lesson. */
export function createUnitFromMagnet(
  draft: D,
  payload: { colorToken: PaletteToken; date: ISODate },
): Unit {
  const course = Object.values(draft.courses).find((c) => !c.archived);
  if (!course) throw new DomainError('Create a course in Settings first.');
  const n = Object.keys(draft.units).length + 1;
  return createUnit(draft, {
    courseId: course.id,
    title: `Unit ${n}`,
    colorToken: payload.colorToken,
    startDate: payload.date,
    endDate: addCalendarDays(payload.date, 9),
  });
}

function calendarDayDelta(from: ISODate, to: ISODate): number {
  return Math.round((fromISODate(to).getTime() - fromISODate(from).getTime()) / 86400000);
}

function setNestedLessonStorage(draft: D, unitId: string, storage: PlacementStorage) {
  for (const p of Object.values(draft.placements)) {
    if (p.objectType !== 'lesson') continue;
    const lesson = draft.lessons[p.objectId];
    if (lesson?.unitId === unitId) p.storage = storage;
  }
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
    const fromDrawer = existing.storage === 'drawer';
    const oldStart = existing.date;
    existing.storage = 'calendar';
    if (fromDrawer) {
      const delta = calendarDayDelta(oldStart, payload.date);
      for (const p of Object.values(draft.placements)) {
        if (p.objectType !== 'lesson') continue;
        const lesson = draft.lessons[p.objectId];
        if (lesson?.unitId !== payload.unitId) continue;
        p.storage = 'calendar';
        p.date = addCalendarDays(p.date, delta);
        if (p.endDate) p.endDate = addCalendarDays(p.endDate, delta);
      }
    }
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
  pushHistory(draft, 'placeUnit', `Placed unit "${unit.title}"`);
}

/**
 * A unit dragged to the Fridge goes in the drawer.
 * Same unit, remembered dates — not a task, idea, or deleted object.
 */
export function stowUnitInDrawer(draft: D, payload: { unitId: string }): void {
  const unit = draft.units[payload.unitId];
  if (!unit) throw new DomainError('Unit not found.');
  unit.location = 'drawer';
  for (const p of Object.values(draft.placements)) {
    if (p.objectType === 'unit' && p.objectId === payload.unitId) {
      p.storage = 'drawer';
    }
  }
  setNestedLessonStorage(draft, payload.unitId, 'drawer');
  pushHistory(draft, 'stowUnit', `Stored unit "${unit.title}" in the drawer`);
}

/** Blank brand magnet dropped on the Fridge becomes a unit waiting in the drawer. */
export function createUnitInDrawer(draft: D, payload: { colorToken: PaletteToken }): Unit {
  const course = Object.values(draft.courses).find((c) => !c.archived);
  if (!course) throw new DomainError('Create a course in Settings first.');
  const n = Object.keys(draft.units).length + 1;
  const unit: Unit = {
    id: createId('unit'),
    kind: 'unit',
    courseId: course.id,
    title: `Unit ${n}`,
    colorToken: payload.colorToken,
    important: false,
    createdAt: Date.now(),
    location: 'drawer',
  };
  draft.units[unit.id] = unit;
  pushHistory(draft, 'stowUnit', `Stored unit "${unit.title}" in the drawer`);
  return unit as Unit;
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
        (p) => p.objectType === 'lesson' && p.objectId === lesson.id && p.storage !== 'drawer',
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
    body: payload.body,
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
  { x: 6, y: 48, r: -6 },
  { x: 87, y: 64, r: 5 },
  { x: 85, y: 78, r: -4 },
  { x: 8, y: 72, r: 7 },
  { x: 86, y: 42, r: -8 },
];

function scatterDeskNote(note: Note, draft: D) {
  if (note.deskX != null && note.deskY != null) return;
  const count = Object.values(draft.notes).filter((n) => n.location === 'desk' && n.id !== note.id).length;
  const spot = DESK_SPOTS[count % DESK_SPOTS.length];
  note.deskX = spot.x;
  note.deskY = spot.y;
  note.deskRotate = spot.r;
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
    (p) => p.date === payload.date && p.storage !== 'drawer',
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
      p.storage !== 'drawer',
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

export function toggleYearCross(draft: D, payload: { date: ISODate }): void {
  if (
    !isInstructionalDay(draft.calendar, payload.date) ||
    compareISO(payload.date, draft.calendar.startDate) < 0 ||
    compareISO(payload.date, draft.calendar.endDate) > 0
  ) {
    throw new DomainError('Only a school day can be crossed out on the Year lens.');
  }
  if (!draft.calendar.crossedDates) draft.calendar.crossedDates = {};
  if (draft.calendar.crossedDates[payload.date]) {
    delete draft.calendar.crossedDates[payload.date];
    pushHistory(draft, 'yearCross', `Restored ${payload.date} on the Year lens`);
    return;
  }
  draft.calendar.crossedDates[payload.date] = true;
  pushHistory(draft, 'yearCross', `Crossed out ${payload.date} on the Year lens`);
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
    if (placement.storage === 'drawer') continue;
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
