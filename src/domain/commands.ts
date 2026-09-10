import type { Draft } from 'immer';
import { addSchoolDays, compareISO, isInstructionalDay } from '../calendar/dates';
import { DomainError } from './errors';
import { createId } from './ids';
import type {
  Course,
  DeliveryState,
  ISODate,
  Lesson,
  LessonField,
  Magnet,
  MagnetKind,
  Note,
  NoteLocation,
  PaletteToken,
  PlaceableType,
  Placement,
  Section,
  TaskColumn,
  Unit,
  Visibility,
  WorkspaceDomainState,
} from './types';

type D = Draft<WorkspaceDomainState>;

type LessonFieldInput = Omit<LessonField, 'id'>;

export function pushHistory(draft: D, type: string, summary: string) {
  draft.history.unshift({ id: createId('hist'), timestamp: Date.now(), type, summary });
  if (draft.history.length > 300) draft.history.length = 300;
}

export function createCourse(
  draft: D,
  payload: { name: string; colorToken: PaletteToken },
): Course {
  const course: Course = { id: createId('course'), name: payload.name, colorToken: payload.colorToken, createdAt: Date.now() };
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

export function createSection(draft: D, payload: { courseId: string; name: string }): Section {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  const section: Section = { id: createId('section'), courseId: payload.courseId, name: payload.name, createdAt: Date.now() };
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

export function createUnit(
  draft: D,
  payload: { courseId: string; title: string; colorToken: PaletteToken; startDate: ISODate; endDate: ISODate; notes?: string },
): Unit {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  const unit: Unit = {
    id: createId('unit'), kind: 'unit', courseId: payload.courseId, title: payload.title,
    colorToken: payload.colorToken, notes: payload.notes, important: false, createdAt: Date.now(),
  };
  draft.units[unit.id] = unit;
  place(draft, { objectType: 'unit', objectId: unit.id, date: payload.startDate, endDate: payload.endDate, fixed: false });
  pushHistory(draft, 'createUnit', `Created unit "${unit.title}"`);
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
    (lesson) => lesson.unitId === unitId && Object.values(draft.placements).some((p) => p.objectType === 'lesson' && p.objectId === lesson.id),
  );
}

function unitHasAnyChildren(draft: D, unitId: string): boolean {
  return Object.values(draft.lessons).some((lesson) => lesson.unitId === unitId);
}

export function createLesson(
  draft: D,
  payload: {
    courseId: string;
    unitId?: string;
    sectionId?: string;
    title: string;
    body?: string;
    fields?: LessonFieldInput[];
    date: ISODate;
    visibility?: Visibility;
    allowCollision?: boolean;
  },
): Lesson {
  if (!draft.courses[payload.courseId]) throw new DomainError('Course not found.');
  const lesson: Lesson = {
    id: createId('lesson'), kind: 'lesson', courseId: payload.courseId, unitId: payload.unitId,
    sectionId: payload.sectionId, title: payload.title, body: payload.body,
    fields: (payload.fields ?? []).map((field) => ({ ...field, id: createId('field') })),
    important: false, crossedOut: false, visibility: payload.visibility ?? 'teacher-private', createdAt: Date.now(),
  };
  draft.lessons[lesson.id] = lesson;
  place(draft, {
    objectType: 'lesson', objectId: lesson.id, date: payload.date, sectionId: payload.sectionId,
    fixed: false, allowCollision: payload.allowCollision,
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
    courseId: source.courseId, unitId: source.unitId, sectionId: source.sectionId, title: source.title,
    body: source.body,
    fields: source.fields.map(({ label, content, plannerVisible, tableVisible }) => ({ label, content, plannerVisible, tableVisible })),
    date: payload.date, visibility: source.visibility,
  });
}

export function createNote(
  draft: D,
  payload: { title: string; body?: string; location: NoteLocation; taskColumn?: TaskColumn; date?: ISODate },
): Note {
  if (payload.location === 'calendar' && !payload.date) throw new DomainError('A calendar note needs a date.');
  const note: Note = {
    id: createId('note'), kind: 'note', title: payload.title, body: payload.body, important: false,
    crossedOut: false, location: payload.location, taskColumn: payload.taskColumn, createdAt: Date.now(),
  };
  draft.notes[note.id] = note;
  if (payload.location === 'taskbar' && payload.taskColumn) draft.taskbar.columns[payload.taskColumn].push(note.id);
  if (payload.location === 'fridge') note.fridgeSlot = nextFridgeSlot(draft);
  if (payload.location === 'calendar' && payload.date) place(draft, { objectType: 'note', objectId: note.id, date: payload.date, fixed: false });
  pushHistory(draft, 'createNote', `Created note "${note.title}"`);
  return note as Note;
}

export function editNote(draft: D, payload: { id: string; patch: Partial<Note> }) {
  const note = draft.notes[payload.id];
  if (!note) throw new DomainError('Note not found.');
  Object.assign(note, payload.patch);
  pushHistory(draft, 'editNote', `Edited note "${note.title}"`);
}

export function createMagnet(draft: D, payload: { magnetKind: MagnetKind; title: string; body?: string }): Magnet {
  const magnet: Magnet = {
    id: createId('magnet'), kind: 'magnet', magnetKind: payload.magnetKind, title: payload.title, body: payload.body,
    location: 'drawer', createdAt: Date.now(),
  };
  draft.magnets[magnet.id] = magnet;
  pushHistory(draft, 'createMagnet', `Created ${magnet.magnetKind} "${magnet.title}"`);
  return magnet as Magnet;
}

export function editMagnet(draft: D, payload: { id: string; patch: Partial<Magnet> }) {
  const magnet = draft.magnets[payload.id];
  if (!magnet) throw new DomainError('Item not found.');
  Object.assign(magnet, payload.patch);
  pushHistory(draft, 'editMagnet', `Edited item "${magnet.title}"`);
}

function placementsForSectionDate(draft: D, sectionId: string, date: ISODate, exceptId?: string) {
  return Object.values(draft.placements).filter(
    (p) => p.sectionId === sectionId && p.date === date && p.id !== exceptId,
  );
}

export function place(
  draft: D,
  payload: {
    objectType: PlaceableType; objectId: string; date: ISODate; endDate?: ISODate; sectionId?: string;
    fixed?: boolean; allowCollision?: boolean;
  },
): Placement {
  if (payload.objectType === 'unit' && payload.endDate && compareISO(payload.endDate, payload.date) < 0) {
    throw new DomainError('Unit end date cannot be before its start date.');
  }
  if (payload.sectionId && !payload.allowCollision && placementsForSectionDate(draft, payload.sectionId, payload.date).length > 0) {
    throw new DomainError('That class already has something planned on this day.');
  }
  const placement: Placement = {
    id: createId('placement'), objectType: payload.objectType, objectId: payload.objectId,
    sectionId: payload.sectionId, date: payload.date, endDate: payload.endDate,
    order: Object.keys(draft.placements).length, fixed: payload.fixed ?? false,
  };
  draft.placements[placement.id] = placement;
  return placement as Placement;
}

export function move(draft: D, payload: { placementId: string; date: ISODate; allowCollision?: boolean }) {
  const p = draft.placements[payload.placementId];
  if (!p) throw new DomainError('Placement not found.');
  if (p.fixed) throw new DomainError('This item is fixed. Unpin it before moving.');
  if (p.sectionId && !payload.allowCollision && placementsForSectionDate(draft, p.sectionId, payload.date, p.id).length > 0) {
    throw new DomainError('That class already has something planned on this day.');
  }
  if (p.endDate) {
    const deltaDays = Math.round((new Date(`${payload.date}T00:00:00`).getTime() - new Date(`${p.date}T00:00:00`).getTime()) / 86400000);
    p.endDate = new Date(new Date(`${p.endDate}T00:00:00`).getTime() + deltaDays * 86400000).toISOString().slice(0, 10);
  }
  p.date = payload.date;
  pushHistory(draft, 'move', 'Moved a planned item');
}

export function setPlacementFixed(draft: D, payload: { placementId: string; fixed: boolean }) {
  const p = draft.placements[payload.placementId];
  if (!p) throw new DomainError('Placement not found.');
  p.fixed = payload.fixed;
  pushHistory(draft, 'fixed', payload.fixed ? 'Fixed a planned item' : 'Unfixed a planned item');
}

export function unplace(draft: D, payload: { placementId: string }) {
  const p = draft.placements[payload.placementId];
  if (!p) throw new DomainError('Placement not found.');
  if (p.objectType === 'unit' && unitHasScheduledChildren(draft, p.objectId)) {
    throw new DomainError('Move or unplace this Unit’s scheduled lessons first.');
  }
  delete draft.placements[p.id];
  pushHistory(draft, 'unplace', 'Removed an item from the calendar');
}

export function deleteObject(
  draft: D,
  payload: { objectType: PlaceableType | 'note' | 'course' | 'section'; objectId: string },
) {
  const { objectType, objectId } = payload;
  if (objectType === 'unit' && unitHasAnyChildren(draft, objectId)) throw new DomainError('Delete or move this Unit’s lessons first.');
  for (const p of Object.values(draft.placements)) if (p.objectType === objectType && p.objectId === objectId) delete draft.placements[p.id];
  if (objectType === 'unit') delete draft.units[objectId];
  else if (objectType === 'lesson') delete draft.lessons[objectId];
  else if (objectType === 'note') {
    delete draft.notes[objectId];
    for (const column of Object.values(draft.taskbar.columns)) {
      const idx = column.indexOf(objectId);
      if (idx >= 0) column.splice(idx, 1);
    }
  } else if (objectType === 'magnet') delete draft.magnets[objectId];
  else if (objectType === 'section') delete draft.sections[objectId];
  else if (objectType === 'course') delete draft.courses[objectId];
  pushHistory(draft, 'delete', 'Deleted an item');
}

export function markImportant(draft: D, payload: { objectType: 'unit' | 'lesson' | 'note'; objectId: string; important: boolean }) {
  const obj = payload.objectType === 'unit' ? draft.units[payload.objectId] : payload.objectType === 'lesson' ? draft.lessons[payload.objectId] : draft.notes[payload.objectId];
  if (!obj) throw new DomainError('Item not found.');
  obj.important = payload.important;
  pushHistory(draft, 'important', payload.important ? 'Circled an item in red' : 'Removed a red circle');
}

export function crossOut(draft: D, payload: { objectType: 'lesson' | 'note'; objectId: string; crossedOut: boolean }) {
  const obj = payload.objectType === 'lesson' ? draft.lessons[payload.objectId] : draft.notes[payload.objectId];
  if (!obj) throw new DomainError('Item not found.');
  obj.crossedOut = payload.crossedOut;
  pushHistory(draft, 'crossOut', payload.crossedOut ? 'Crossed out an item' : 'Restored an item');
}

function nextFridgeSlot(draft: D): number | undefined {
  const used = new Set<number>();
  for (const note of Object.values(draft.notes)) if (note.location === 'fridge' && note.fridgeSlot !== undefined) used.add(note.fridgeSlot);
  for (const magnet of Object.values(draft.magnets)) if (magnet.location === 'fridge' && magnet.fridgeSlot !== undefined) used.add(magnet.fridgeSlot);
  for (let i = 0; i < draft.fridge.capacity; i += 1) if (!used.has(i)) return i;
  return undefined;
}

function requireFridgeSlot(draft: D): number {
  const slot = nextFridgeSlot(draft);
  if (slot === undefined) throw new DomainError('The Fridge is full. Move something to the Drawer first.');
  return slot;
}

export function moveNoteToFridge(draft: D, payload: { noteId: string }) {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  note.location = 'fridge';
  note.fridgeSlot = requireFridgeSlot(draft);
  for (const column of Object.values(draft.taskbar.columns)) {
    const idx = column.indexOf(note.id);
    if (idx >= 0) column.splice(idx, 1);
  }
  for (const p of Object.values(draft.placements)) if (p.objectType === 'note' && p.objectId === note.id) delete draft.placements[p.id];
  pushHistory(draft, 'moveNote', 'Moved note to Fridge');
}

export function moveNoteToDrawer(draft: D, payload: { noteId: string }) {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  note.location = 'drawer';
  note.fridgeSlot = undefined;
  for (const column of Object.values(draft.taskbar.columns)) {
    const idx = column.indexOf(note.id);
    if (idx >= 0) column.splice(idx, 1);
  }
  for (const p of Object.values(draft.placements)) if (p.objectType === 'note' && p.objectId === note.id) delete draft.placements[p.id];
  pushHistory(draft, 'moveNote', 'Moved note to Drawer');
}

export function moveNoteToTaskBar(draft: D, payload: { noteId: string; column: TaskColumn }) {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  for (const ids of Object.values(draft.taskbar.columns)) {
    const idx = ids.indexOf(note.id);
    if (idx >= 0) ids.splice(idx, 1);
  }
  for (const p of Object.values(draft.placements)) if (p.objectType === 'note' && p.objectId === note.id) delete draft.placements[p.id];
  note.location = 'taskbar';
  note.taskColumn = payload.column;
  note.fridgeSlot = undefined;
  draft.taskbar.columns[payload.column].push(note.id);
  pushHistory(draft, 'moveNote', `Moved note to ${payload.column}`);
}

export function placeNoteOnCalendar(draft: D, payload: { noteId: string; date: ISODate }) {
  const note = draft.notes[payload.noteId];
  if (!note) throw new DomainError('Note not found.');
  for (const ids of Object.values(draft.taskbar.columns)) {
    const idx = ids.indexOf(note.id);
    if (idx >= 0) ids.splice(idx, 1);
  }
  for (const p of Object.values(draft.placements)) if (p.objectType === 'note' && p.objectId === note.id) delete draft.placements[p.id];
  note.location = 'calendar';
  note.fridgeSlot = undefined;
  place(draft, { objectType: 'note', objectId: note.id, date: payload.date, fixed: false });
  pushHistory(draft, 'moveNote', 'Placed note on calendar');
}

export function associateTaskWithDate(draft: D, payload: { noteId: string; date: ISODate }) {
  const note = draft.notes[payload.noteId];
  if (!note || note.location !== 'taskbar') throw new DomainError('Task not found.');
  note.associatedDate = payload.date;
  pushHistory(draft, 'taskDate', `Associated task with ${payload.date}`);
}

export function moveMagnetToFridge(draft: D, payload: { magnetId: string }) {
  const magnet = draft.magnets[payload.magnetId];
  if (!magnet) throw new DomainError('Item not found.');
  magnet.location = 'fridge';
  magnet.fridgeSlot = requireFridgeSlot(draft);
  for (const p of Object.values(draft.placements)) if (p.objectType === 'magnet' && p.objectId === magnet.id) delete draft.placements[p.id];
  pushHistory(draft, 'moveMagnet', 'Moved item to Fridge');
}

export function moveMagnetToDrawer(draft: D, payload: { magnetId: string }) {
  const magnet = draft.magnets[payload.magnetId];
  if (!magnet) throw new DomainError('Item not found.');
  magnet.location = 'drawer';
  magnet.fridgeSlot = undefined;
  for (const p of Object.values(draft.placements)) if (p.objectType === 'magnet' && p.objectId === magnet.id) delete draft.placements[p.id];
  pushHistory(draft, 'moveMagnet', 'Moved item to Drawer');
}

export function setDelivery(
  draft: D,
  payload: { sectionId: string; lessonId: string; state: DeliveryState; resumeNote?: string; actualDate?: ISODate },
) {
  if (!draft.sections[payload.sectionId]) throw new DomainError('Section not found.');
  if (!draft.lessons[payload.lessonId]) throw new DomainError('Lesson not found.');
  draft.delivery[payload.sectionId] ??= {};
  draft.delivery[payload.sectionId][payload.lessonId] = { state: payload.state, resumeNote: payload.resumeNote, actualDate: payload.actualDate };
  pushHistory(draft, 'delivery', `Lesson marked ${payload.state}`);
}

export function setCalendarDay(
  draft: D,
  payload: { date: ISODate; kind: WorkspaceDomainState['calendar']['days'][string]['kind']; label?: string },
) {
  draft.calendar.days[payload.date] = { date: payload.date, kind: payload.kind, label: payload.label, confidence: 'confirmed' };
  pushHistory(draft, 'calendarDay', `Set ${payload.date} to ${payload.kind}`);
}

export function updateSettings(draft: D, patch: Partial<WorkspaceDomainState['settings']>) {
  Object.assign(draft.settings, patch);
  draft.calendar.showWeekends = draft.settings.showWeekends;
  draft.calendar.weekStartsOn = draft.settings.showWeekends ? 'sunday' : 'monday';
  draft.settings.weekStartsOn = draft.calendar.weekStartsOn;
  pushHistory(draft, 'settings', 'Updated calendar settings');
}

export function applyShift(
  draft: D,
  payload: { sectionId: string; fromDate: ISODate; schoolDays: number; reason?: string },
) {
  if (!draft.sections[payload.sectionId]) throw new DomainError('Section not found.');
  const candidates = Object.values(draft.placements)
    .filter((p) => p.sectionId === payload.sectionId && compareISO(p.date, payload.fromDate) >= 0 && !p.fixed)
    .sort((a, b) => compareISO(b.date, a.date));
  for (const p of candidates) {
    const next = addSchoolDays(draft.calendar, p.date, payload.schoolDays);
    p.date = next;
  }
  pushHistory(draft, 'shift', `Shifted ${payload.sectionId} by ${payload.schoolDays} school day(s)${payload.reason ? `: ${payload.reason}` : ''}`);
}

export function clearSampleData(draft: D) {
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
  pushHistory(draft, 'clearSample', 'Cleared example planning data');
}

export function firstInstructionalDate(draft: D, from: ISODate): ISODate {
  let date = from;
  while (!isInstructionalDay(draft.calendar, date)) date = addSchoolDays(draft.calendar, date, 1);
  return date;
}
