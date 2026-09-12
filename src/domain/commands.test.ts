import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import * as cmd from './commands';
import { DomainError } from './errors';
import type { WorkspaceDomainState } from './types';

function emptyState(): WorkspaceDomainState {
  return {
    schemaVersion: 1,
    isSampleWorkspace: false,
    calendar: {
      startDate: '2026-08-01',
      endDate: '2027-06-15',
      days: {},
      crossedDates: {},
      teacherOutDates: {},
      showWeekends: false,
      weekStartsOn: 'monday',
      source: 'test-fixture',
    },
    courses: {},
    sections: {},
    units: {},
    lessons: {},
    notes: {},
    magnets: {},
    placements: {},
    delivery: {},
    taskbar: { columns: { must: [], should: [], could: [] } },
    fridge: { capacity: 12 },
    history: [],
    settings: { showWeekends: false, reducedMotion: false, highContrast: false, weekStartsOn: 'monday' },
  };
}

/** Runs a command against `state` and returns both the next state and the command's return value. */
function apply<T>(state: WorkspaceDomainState, fn: (draft: WorkspaceDomainState) => T): { next: WorkspaceDomainState; result: T } {
  let result!: T;
  const next = produce(state, (draft) => {
    result = fn(draft as WorkspaceDomainState);
  });
  return { next, result };
}

describe('Fridge \u2192 Task Bar \u2192 Calendar \u2192 Fridge lifecycle (Desktop Interaction Blueprint \u00a714)', () => {
  it('preserves the same stable object and its richer data through every stage', () => {
    let state = emptyState();

    // 1. Create lightweight idea in the Fridge.
    const created = apply(state, (d) => cmd.createNote(d, { title: 'Print permission slips', location: 'fridge' }));
    state = created.next;
    const note = created.result;
    expect(state.notes[note.id].location).toBe('fridge');

    // 2. Move to Must Do and add richer detail.
    state = apply(state, (d) => cmd.moveNoteToTaskBar(d, { noteId: note.id, column: 'must' })).next;
    expect(state.notes[note.id].location).toBe('taskbar');
    expect(state.notes[note.id].taskColumn).toBe('must');

    state = apply(state, (d) => cmd.editNote(d, { id: note.id, patch: { body: 'Due before the field trip.' } })).next;
    expect(state.notes[note.id].body).toBe('Due before the field trip.');

    // 3. Move the same stable object to the Calendar.
    state = apply(state, (d) => cmd.place(d, { objectType: 'note', objectId: note.id, date: '2026-09-10' })).next;
    expect(state.notes[note.id].location).toBe('calendar');
    const placementId = Object.keys(state.placements)[0];
    expect(state.placements[placementId].date).toBe('2026-09-10');

    // 4. Move the object back to the Fridge \u2014 richer data (body) must survive.
    state = apply(state, (d) => cmd.moveNoteToFridge(d, { noteId: note.id })).next;
    expect(state.notes[note.id].location).toBe('fridge');
    expect(state.notes[note.id].body).toBe('Due before the field trip.');
    expect(Object.keys(state.placements)).toHaveLength(0);
    expect(state.notes[note.id].id).toBe(note.id); // same stable identity throughout
  });
});

describe('Object action semantics (Master Operating Document \u00a74)', () => {
  it('keeps Move / Unplace / Delete distinct and non-ambiguous', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const lessonCreated = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, title: 'Cell walls', date: '2026-09-10' }),
    );
    state = lessonCreated.next;
    const lesson = lessonCreated.result;
    const placementId = Object.keys(state.placements)[0];

    // Move preserves identity/history and only changes placement.
    state = apply(state, (d) => cmd.move(d, { placementId, date: '2026-09-11' })).next;
    expect(state.placements[placementId].date).toBe('2026-09-11');
    expect(state.lessons[lesson.id]).toBeDefined();

    // Unplace preserves the object but removes the calendar placement.
    state = apply(state, (d) => cmd.unplace(d, { placementId })).next;
    expect(Object.keys(state.placements)).toHaveLength(0);
    expect(state.lessons[lesson.id]).toBeDefined();

    // Delete destroys the object entirely.
    state = apply(state, (d) => cmd.deleteObject(d, { objectType: 'lesson', objectId: lesson.id })).next;
    expect(state.lessons[lesson.id]).toBeUndefined();
  });

  it('blocks moving a fixed placement until explicitly unpinned', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const lessonCreated = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, title: 'Field trip debrief', date: '2026-09-10' }),
    );
    state = lessonCreated.next;
    const placementId = Object.keys(state.placements)[0];
    state = apply(state, (d) => cmd.setPlacementFixed(d, { placementId, fixed: true })).next;

    expect(() => apply(state, (d) => cmd.move(d, { placementId, date: '2026-09-12' }))).toThrow(DomainError);

    state = apply(state, (d) => cmd.setPlacementFixed(d, { placementId, fixed: false })).next;
    state = apply(state, (d) => cmd.move(d, { placementId, date: '2026-09-12' })).next;
    expect(state.placements[placementId].date).toBe('2026-09-12');
  });

  it('never gives a Unit its own Section \u2014 Units belong to Course + calendar only', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const unitCreated = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.id,
        title: 'Genetics',
        colorToken: 'terracotta',
        startDate: '2026-09-08',
        endDate: '2026-09-20',
      }),
    );
    expect('sectionId' in unitCreated.result).toBe(false);
  });
});

describe('Live Classroom outcome semantics (Master Operating Document \u00a73)', () => {
  function setupSection() {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const sectionCreated = apply(state, (d) => cmd.createSection(d, { courseId: course.id, name: 'Period 2' }));
    state = sectionCreated.next;
    const section = sectionCreated.result;

    const lessonCreated = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, sectionId: section.id, title: 'Mitosis', date: '2026-09-10' }),
    );
    state = lessonCreated.next;
    const lesson = lessonCreated.result;

    return { state, section, lesson };
  }

  it('requires a resume note before writing Stop here (in-progress)', () => {
    const { state, section, lesson } = setupSection();
    expect(() =>
      apply(state, (d) => cmd.setDelivery(d, { sectionId: section.id, lessonId: lesson.id, state: 'in-progress' })),
    ).toThrow(DomainError);

    const next = apply(state, (d) =>
      cmd.setDelivery(d, {
        sectionId: section.id,
        lessonId: lesson.id,
        state: 'in-progress',
        resumeNote: 'Pick up at anaphase.',
      }),
    ).next;
    expect(next.delivery[section.id][lesson.id].resumeNote).toBe('Pick up at anaphase.');
  });

  it('only allows Skip while the lesson is still not-started', () => {
    const { state, section, lesson } = setupSection();
    const inProgress = apply(state, (d) =>
      cmd.setDelivery(d, {
        sectionId: section.id,
        lessonId: lesson.id,
        state: 'in-progress',
        resumeNote: 'Resume tomorrow.',
      }),
    ).next;

    expect(() =>
      apply(inProgress, (d) => cmd.setDelivery(d, { sectionId: section.id, lessonId: lesson.id, state: 'skipped' })),
    ).toThrow(DomainError);
  });

  it('never allows a completed or skipped lesson to be relaunched', () => {
    const { state, section, lesson } = setupSection();
    const completed = apply(state, (d) =>
      cmd.setDelivery(d, { sectionId: section.id, lessonId: lesson.id, state: 'completed' }),
    ).next;

    expect(() =>
      apply(completed, (d) => cmd.setDelivery(d, { sectionId: section.id, lessonId: lesson.id, state: 'completed' })),
    ).toThrow(DomainError);
    expect(() =>
      apply(completed, (d) =>
        cmd.setDelivery(d, { sectionId: section.id, lessonId: lesson.id, state: 'in-progress', resumeNote: 'x' }),
      ),
    ).toThrow(DomainError);
  });
});

describe('Nothing important disappears silently (Canonical Brand System \u00a73)', () => {
  it('blocks deleting a Unit that still has scheduled Lessons', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const unitCreated = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.id,
        title: 'Genetics',
        colorToken: 'terracotta',
        startDate: '2026-09-08',
        endDate: '2026-09-20',
      }),
    );
    state = unitCreated.next;
    const unit = unitCreated.result;

    state = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, unitId: unit.id, title: 'Punnett squares', date: '2026-09-09' }),
    ).next;

    expect(() => apply(state, (d) => cmd.deleteObject(d, { objectType: 'unit', objectId: unit.id }))).toThrow(
      DomainError,
    );
  });

  it('rejects a same-day double placement for the same Section (fail closed rather than silently overwrite)', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'blue' }));
    state = courseCreated.next;
    const course = courseCreated.result;

    const sectionCreated = apply(state, (d) => cmd.createSection(d, { courseId: course.id, name: 'Period 2' }));
    state = sectionCreated.next;
    const section = sectionCreated.result;

    state = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, sectionId: section.id, title: 'Mitosis', date: '2026-09-10' }),
    ).next;

    expect(() =>
      apply(state, (d) =>
        cmd.createLesson(d, { courseId: course.id, sectionId: section.id, title: 'Meiosis', date: '2026-09-10' }),
      ),
    ).toThrow(DomainError);
  });
});

describe('Unit magnets stay units', () => {
  it('keeps the same unit when its placement moves', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' }));
    state = courseCreated.next;
    const course = courseCreated.result;
    const created = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.id,
        title: 'Cell Structure',
        colorToken: 'blue',
        startDate: '2026-09-08',
        endDate: '2026-09-25',
      }),
    );
    state = created.next;
    const unit = created.result;
    const placement = Object.values(state.placements).find((p) => p.objectType === 'unit' && p.objectId === unit.id);
    expect(placement?.endDate).toBe('2026-09-25');

    state = apply(state, (d) => cmd.move(d, { placementId: placement!.id, date: '2026-09-10' })).next;
    const moved = Object.values(state.placements).find((p) => p.objectType === 'unit' && p.objectId === unit.id);
    expect(state.units[unit.id]).toBeDefined();
    expect(state.units[unit.id].kind).toBe('unit');
    expect(Object.values(state.lessons)).toHaveLength(0);
    expect(Object.values(state.notes)).toHaveLength(0);
    expect(moved?.date).toBe('2026-09-10');
    expect(moved?.endDate).toBe('2026-09-27');
    expect(moved?.objectType).toBe('unit');
    expect(moved?.objectId).toBe(unit.id);
  });

  it('creates a unit from a named brand magnet, not a lesson or decorative magnet', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' })).next;
    const created = apply(state, (d) =>
      cmd.createUnitFromMagnet(d, { colorToken: 'blue', date: '2026-09-14', title: 'Genetics' }),
    );
    state = created.next;
    expect(created.result.kind).toBe('unit');
    expect(state.units[created.result.id].title).toBe('Genetics');
    expect(Object.values(state.magnets)).toHaveLength(0);
    expect(Object.values(state.lessons)).toHaveLength(0);
  });

  it('writes a unit onto a desk magnet without scheduling it yet', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' })).next;
    const created = apply(state, (d) => cmd.createUnitOnDesk(d, { colorToken: 'sage', title: 'Ecology' }));
    state = created.next;
    expect(created.result.kind).toBe('unit');
    expect(state.units[created.result.id].location).toBe('desk');
    expect(Object.values(state.placements)).toHaveLength(0);
  });

  it('converts a fridge magnet into a unit span on the calendar', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' })).next;
    const magnetCreated = apply(state, (d) =>
      cmd.createMagnet(d, { magnetKind: 'idea', title: 'Photosynthesis' }),
    );
    state = magnetCreated.next;
    const placed = apply(state, (d) =>
      cmd.placeMagnetAsUnit(d, { magnetId: magnetCreated.result.id, date: '2026-09-15' }),
    );
    state = placed.next;
    expect(placed.result.kind).toBe('unit');
    expect(state.units[placed.result.id].title).toBe('Photosynthesis');
    expect(state.magnets[magnetCreated.result.id]).toBeUndefined();
    const placement = Object.values(state.placements).find((p) => p.objectId === placed.result.id);
    expect(placement?.objectType).toBe('unit');
    expect(placement?.date).toBe('2026-09-15');
    expect(placement?.endDate).toBe('2026-09-24');
  });

  it('creates a unit from a brand magnet, not a lesson or task', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' })).next;
    const created = apply(state, (d) => cmd.createUnitFromMagnet(d, { colorToken: 'terracotta', date: '2026-09-14' }));
    state = created.next;
    const unit = created.result;
    expect(unit.kind).toBe('unit');
    expect(state.units[unit.id].colorToken).toBe('terracotta');
    const placement = Object.values(state.placements).find((p) => p.objectId === unit.id);
    expect(placement?.objectType).toBe('unit');
    expect(placement?.date).toBe('2026-09-14');
    expect(Object.values(state.lessons)).toHaveLength(0);
  });

  it('writes an idea onto the desk as a post-it', () => {
    let state = emptyState();
    const created = apply(state, (d) => cmd.createNote(d, { title: 'Socratic seminar', location: 'desk' }));
    state = created.next;
    const note = created.result;
    expect(state.notes[note.id].location).toBe('desk');
    expect(state.notes[note.id].deskX).toBeDefined();
    expect(state.notes[note.id].deskY).toBeDefined();
  });

  it('slides a desk note once without requiring a title edit', () => {
    let state = emptyState();
    const created = apply(state, (d) => cmd.createNote(d, { title: 'Fire drill', location: 'desk' }));
    state = created.next;
    const note = created.result;
    state = apply(state, (d) => cmd.slideDeskNote(d, { noteId: note.id, deskX: 42, deskY: 18 })).next;
    expect(state.notes[note.id].deskX).toBe(42);
    expect(state.notes[note.id].deskY).toBe(18);
    expect(state.history[0].type).toBe('slideDeskNote');
  });

  it('stows a unit in the Fridge drawer without destroying it or turning it into a task', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' }));
    state = courseCreated.next;
    const course = courseCreated.result;
    const created = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.id,
        title: 'Cell Structure',
        colorToken: 'blue',
        startDate: '2026-09-08',
        endDate: '2026-09-25',
      }),
    );
    state = created.next;
    const unit = created.result;
    const sectionCreated = apply(state, (d) => cmd.createSection(d, { courseId: course.id, name: 'Period 2' }));
    state = sectionCreated.next;
    const section = sectionCreated.result;
    state = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.id,
        unitId: unit.id,
        sectionId: section.id,
        title: 'Membrane lab',
        date: '2026-09-10',
      }),
    ).next;

    state = apply(state, (d) => cmd.stowUnitInDrawer(d, { unitId: unit.id })).next;
    expect(state.units[unit.id]).toBeDefined();
    expect(state.units[unit.id].kind).toBe('unit');
    expect(state.units[unit.id].location).toBe('drawer');
    expect(state.units[unit.id].title).toBe('Cell Structure');
    expect(Object.values(state.notes)).toHaveLength(0);
    expect(Object.keys(state.taskbar.columns.must)).toHaveLength(0);
    const unitPlacement = Object.values(state.placements).find(
      (p) => p.objectType === 'unit' && p.objectId === unit.id,
    );
    expect(unitPlacement?.storage).toBe('drawer');
    expect(unitPlacement?.date).toBe('2026-09-08');
    expect(unitPlacement?.endDate).toBe('2026-09-25');
    const lessonPlacement = Object.values(state.placements).find((p) => p.objectType === 'lesson');
    expect(lessonPlacement?.storage).toBe('drawer');
    expect(state.lessons[lessonPlacement!.objectId].unitId).toBe(unit.id);

    state = apply(state, (d) => cmd.placeUnitOnDate(d, { unitId: unit.id, date: '2026-09-21' })).next;
    expect(state.units[unit.id].location).toBe('calendar');
    const restored = Object.values(state.placements).find(
      (p) => p.objectType === 'unit' && p.objectId === unit.id,
    );
    expect(restored?.storage).toBe('calendar');
    expect(restored?.date).toBe('2026-09-21');
    expect(restored?.endDate).toBe('2026-10-08');
    const restoredLesson = Object.values(state.placements).find((p) => p.objectType === 'lesson');
    expect(restoredLesson?.storage).toBe('calendar');
    expect(restoredLesson?.date).toBe('2026-09-23');
  });

  it('parks a unit on the desk as a magnet and carries nested lessons off the spread', () => {
    let state = emptyState();
    const course = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' }));
    state = course.next;
    const unit = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.result.id,
        title: 'Genetics',
        colorToken: 'blue',
        startDate: '2026-09-08',
        endDate: '2026-09-18',
      }),
    );
    state = unit.next;
    const section = apply(state, (d) => cmd.createSection(d, { courseId: course.result.id, name: 'Period 2' }));
    state = section.next;
    const first = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.result.id,
        unitId: unit.result.id,
        sectionId: section.result.id,
        title: 'Punnett squares',
        date: '2026-09-09',
      }),
    );
    state = first.next;
    const second = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.result.id,
        unitId: unit.result.id,
        sectionId: section.result.id,
        title: 'Dihybrid cross',
        date: '2026-09-10',
        allowCollision: true,
      }),
    );
    state = second.next;

    state = apply(state, (d) => cmd.stowUnitOnDesk(d, { unitId: unit.result.id })).next;
    expect(state.units[unit.result.id].location).toBe('desk');
    const parkedUnit = Object.values(state.placements).find(
      (p) => p.objectType === 'unit' && p.objectId === unit.result.id,
    );
    expect(parkedUnit?.storage).toBe('desk');
    const parkedLessons = Object.values(state.placements).filter((p) => p.objectType === 'lesson');
    expect(parkedLessons).toHaveLength(2);
    expect(parkedLessons.every((p) => p.storage === 'desk')).toBe(true);
    expect(state.lessons[first.result.id].unitId).toBe(unit.result.id);
    expect(state.lessons[second.result.id].unitId).toBe(unit.result.id);
  });

  it('nests stacked lessons under a desk magnet and brings them back onto the week', () => {
    let state = emptyState();
    const course = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' }));
    state = course.next;
    const magnet = apply(state, (d) => cmd.createUnitOnDesk(d, { colorToken: 'sage', title: 'Ecology' }));
    state = magnet.next;
    const section = apply(state, (d) => cmd.createSection(d, { courseId: course.result.id, name: 'Period 2' }));
    state = section.next;
    const first = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.result.id,
        sectionId: section.result.id,
        title: 'Food webs',
        date: '2026-09-08',
      }),
    );
    state = first.next;
    const second = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.result.id,
        sectionId: section.result.id,
        title: 'Energy pyramid',
        date: '2026-09-09',
        allowCollision: true,
      }),
    );
    state = second.next;
    state = apply(state, (d) => cmd.nestLessonInUnit(d, { lessonId: first.result.id, unitId: magnet.result.id })).next;
    state = apply(state, (d) => cmd.nestLessonInUnit(d, { lessonId: second.result.id, unitId: magnet.result.id })).next;
    expect(state.lessons[first.result.id].unitId).toBe(magnet.result.id);
    expect(state.lessons[second.result.id].unitId).toBe(magnet.result.id);
    expect(Object.values(state.placements).filter((p) => p.objectType === 'lesson').every((p) => p.storage === 'desk')).toBe(
      true,
    );

    state = apply(state, (d) => cmd.placeUnitOnDate(d, { unitId: magnet.result.id, date: '2026-09-21' })).next;
    expect(state.units[magnet.result.id].location).toBe('calendar');
    const kids = Object.values(state.placements).filter((p) => p.objectType === 'lesson');
    expect(kids).toHaveLength(2);
    expect(kids.every((p) => p.storage === 'calendar' || p.storage === undefined)).toBe(true);
    expect(kids.map((p) => p.date).sort()).toEqual(['2026-09-21', '2026-09-22']);
  });

  it('moves a unit along the spread and carries nested lesson dates', () => {
    let state = emptyState();
    const course = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' }));
    state = course.next;
    const unit = apply(state, (d) =>
      cmd.createUnit(d, {
        courseId: course.result.id,
        title: 'Cells',
        colorToken: 'blue',
        startDate: '2026-09-08',
        endDate: '2026-09-12',
      }),
    );
    state = unit.next;
    const section = apply(state, (d) => cmd.createSection(d, { courseId: course.result.id, name: 'Period 2' }));
    state = section.next;
    const lesson = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: course.result.id,
        unitId: unit.result.id,
        sectionId: section.result.id,
        title: 'Membrane',
        date: '2026-09-09',
      }),
    );
    state = lesson.next;
    const placement = Object.values(state.placements).find(
      (p) => p.objectType === 'unit' && p.objectId === unit.result.id,
    );
    state = apply(state, (d) => cmd.move(d, { placementId: placement!.id, date: '2026-09-15' })).next;
    const movedLesson = Object.values(state.placements).find((p) => p.objectType === 'lesson');
    expect(movedLesson?.date).toBe('2026-09-16');
    expect(state.lessons[lesson.result.id].unitId).toBe(unit.result.id);
  });

  it('creates a unit in the drawer from a blank magnet, not a note or task', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.createCourse(d, { name: 'Biology', colorToken: 'sage' })).next;
    const created = apply(state, (d) => cmd.createUnitInDrawer(d, { colorToken: 'terracotta' }));
    state = created.next;
    const unit = created.result;
    expect(unit.kind).toBe('unit');
    expect(state.units[unit.id].location).toBe('drawer');
    expect(Object.values(state.placements)).toHaveLength(0);
    expect(Object.values(state.notes)).toHaveLength(0);
    expect(Object.values(state.magnets)).toHaveLength(0);
  });

  it('crosses an instructional Year-lens day and refuses weekends', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.toggleYearCross(d, { date: '2026-09-11' })).next;
    expect(state.calendar.crossedDates['2026-09-11']).toBe(true);
    state = apply(state, (d) => cmd.toggleYearCross(d, { date: '2026-09-11' })).next;
    expect(state.calendar.crossedDates['2026-09-11']).toBeUndefined();
    expect(() => apply(state, (d) => cmd.toggleYearCross(d, { date: '2026-09-12' }))).toThrow(DomainError);
    expect(() => apply(state, (d) => cmd.toggleYearCross(d, { date: '2026-07-31' }))).toThrow(DomainError);
  });

  it('marks a school day as out sick or sub-covered, and click-clear does not invent an X', () => {
    let state = emptyState();
    state = apply(state, (d) => cmd.markTeacherOut(d, { date: '2026-09-11', reason: 'sick' })).next;
    expect(state.calendar.teacherOutDates['2026-09-11']).toBe('sick');
    state = apply(state, (d) => cmd.markTeacherOut(d, { date: '2026-09-11', reason: 'sub' })).next;
    expect(state.calendar.teacherOutDates['2026-09-11']).toBe('sub');
    expect(state.calendar.crossedDates['2026-09-11']).toBeUndefined();
    state = apply(state, (d) => cmd.toggleYearCross(d, { date: '2026-09-11' })).next;
    expect(state.calendar.teacherOutDates['2026-09-11']).toBeUndefined();
    expect(state.calendar.crossedDates['2026-09-11']).toBeUndefined();
  });
});

describe('lesson structure defaults', () => {
  it('writes class parts into a new lesson that has no headings', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: '2D Art', colorToken: 'terracotta' }));
    state = courseCreated.next;
    const course = courseCreated.result;
    state = apply(state, (d) =>
      cmd.editCourse(d, {
        id: course.id,
        patch: {
          lessonStructure: [{ title: 'Bell work', minutes: 5, prompt: 'Daily doodle' }],
        },
      }),
    ).next;
    const lessonCreated = apply(state, (d) =>
      cmd.createLesson(d, { courseId: course.id, title: 'Collage', date: '2026-09-10' }),
    );
    expect(lessonCreated.result.body).toContain('## Bell work');
    expect(lessonCreated.result.body).toContain('Daily doodle');
  });

  it('does not overwrite a lesson that already has numbered parts', () => {
    let state = emptyState();
    const courseCreated = apply(state, (d) => cmd.createCourse(d, { name: '2D Art', colorToken: 'terracotta' }));
    state = courseCreated.next;
    state = apply(state, (d) =>
      cmd.editCourse(d, {
        id: courseCreated.result.id,
        patch: { lessonStructure: [{ title: 'Bell work', minutes: 5, prompt: 'Daily doodle' }] },
      }),
    ).next;
    const lessonCreated = apply(state, (d) =>
      cmd.createLesson(d, {
        courseId: courseCreated.result.id,
        title: 'Collage',
        body: '1. Hook: look at the still life.\n2. Draw',
        date: '2026-09-10',
      }),
    );
    expect(lessonCreated.result.body).toContain('Hook');
    expect(lessonCreated.result.body).not.toContain('Daily doodle');
  });
});
