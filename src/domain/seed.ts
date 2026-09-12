import { produce } from 'immer';
import { addCalendarDays, isInstructionalDay } from '../calendar/dates';
import * as cmd from './commands';
import type { WorkspaceDomainState } from './types';

const CURRENT_SCHEMA_VERSION = 1;

function emptyState(): WorkspaceDomainState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    isSampleWorkspace: false,
    calendar: {
      startDate: '2026-08-24',
      endDate: '2027-06-11',
      days: {},
      crossedDates: {},
      teacherOutDates: {},
      showWeekends: false,
      weekStartsOn: 'monday',
      source: 'manual',
    },
    courses: {},
    sections: {},
    units: {},
    lessons: {},
    notes: {},
    magnets: {},
    placements: {},
    delivery: {},
    history: [],
    settings: {
      showWeekends: false,
      reducedMotion: false,
      highContrast: false,
      weekStartsOn: 'monday',
    },
    fridge: { capacity: 9 },
    taskbar: { columns: { must: [], should: [], could: [] } },
  };
}

function noSchoolRange(state: WorkspaceDomainState, from: string, to: string, label: string) {
  let cursor = from;
  while (cursor <= to) {
    state.calendar.days[cursor] = { date: cursor, kind: 'no-school', label, confidence: 'confirmed' };
    cursor = addCalendarDays(cursor, 1);
  }
}

/** Builds the calendar exceptions and a small demo teaching plan so a first-run workspace isn't empty. */
export function createInitialState(): WorkspaceDomainState {
  return produce(emptyState(), (draft) => {
    noSchoolRange(draft, '2026-09-07', '2026-09-07', 'Labor Day');
    noSchoolRange(draft, '2026-10-12', '2026-10-12', 'Staff Development Day');
    noSchoolRange(draft, '2026-11-25', '2026-11-27', 'Thanksgiving Break');
    noSchoolRange(draft, '2026-12-21', '2027-01-01', 'Winter Break');
    noSchoolRange(draft, '2027-01-18', '2027-01-18', 'MLK Day');
    noSchoolRange(draft, '2027-02-15', '2027-02-15', "Presidents' Day");
    noSchoolRange(draft, '2027-03-22', '2027-03-26', 'Spring Break');
    noSchoolRange(draft, '2027-05-31', '2027-05-31', 'Memorial Day');
    draft.calendar.days['2026-12-18'] = {
      date: '2026-12-18',
      kind: 'early-release',
      label: 'Early Release',
      confidence: 'confirmed',
    };
    draft.calendar.days['2027-06-11'] = {
      date: '2027-06-11',
      kind: 'early-release',
      label: 'Last Day \u2014 Early Release',
      confidence: 'confirmed',
    };

    const course = cmd.createCourse(draft, { name: 'AP Biology', colorToken: 'sage' });
    const section = cmd.createSection(draft, { courseId: course.id, name: 'Period 2' });

    const unit1 = cmd.createUnit(draft, {
      courseId: course.id,
      title: 'Unit 1 \u00b7 Cell Structure',
      colorToken: 'blue',
      startDate: '2026-09-08',
      endDate: '2026-09-25',
    });
    cmd.createUnit(draft, {
      courseId: course.id,
      title: 'Unit 2 \u00b7 Genetics',
      colorToken: 'terracotta',
      startDate: '2026-09-28',
      endDate: '2026-10-16',
    });

    const l1 = cmd.createLesson(draft, {
      courseId: course.id,
      unitId: unit1.id,
      sectionId: section.id,
      title: 'Organelles walk-through',
      body: 'Diagram the organelles and their function. Bell-ringer: name three organelles.',
      date: '2026-09-08',
    });
    cmd.setDelivery(draft, { sectionId: section.id, lessonId: l1.id, state: 'completed' });

    cmd.createLesson(draft, {
      courseId: course.id,
      unitId: unit1.id,
      sectionId: section.id,
      title: 'Membrane transport lab',
      body: 'Egg osmosis demo \u2014 set up before period starts.',
      date: '2026-09-10',
    });

    cmd.createLesson(draft, {
      courseId: course.id,
      unitId: unit1.id,
      sectionId: section.id,
      title: 'Cell structure quiz',
      date: '2026-09-15',
    });

    cmd.createNote(draft, {
      title: 'Print lab safety sheets',
      body: 'Need 32 copies for the osmosis lab.',
      location: 'taskbar',
      taskColumn: 'must',
    });
    cmd.createNote(draft, {
      title: 'Email sub plan template to Ortiz',
      location: 'taskbar',
      taskColumn: 'should',
    });
    cmd.createNote(draft, {
      title: 'Reorder microscope slides',
      location: 'desk',
    });
    cmd.createNote(draft, {
      title: 'Ask about extra petri dishes',
      location: 'desk',
    });

    markSampleYearCrosses(draft.calendar);

    draft.history = [];
    // Marked explicitly so the UI can tell the teacher this is example content
    // rather than presenting it as their real plan (Canonical Product Spec \u00a72).
    draft.isSampleWorkspace = true;
  });
}

/** Cross instructional days through 10 Sep 2026 so the Year lens looks lived-in. */
export function markSampleYearCrosses(
  calendar: WorkspaceDomainState['calendar'],
  through: string = '2026-09-10',
) {
  if (!calendar.crossedDates) calendar.crossedDates = {};
  if (!calendar.teacherOutDates) calendar.teacherOutDates = {};
  calendar.teacherOutDates['2026-09-04'] = 'sick';
  calendar.teacherOutDates['2026-09-08'] = 'sub';
  let cursor = calendar.startDate;
  while (cursor <= through) {
    if (isInstructionalDay(calendar, cursor) && !calendar.teacherOutDates[cursor]) {
      calendar.crossedDates[cursor] = true;
    }
    cursor = addCalendarDays(cursor, 1);
  }
}

export { CURRENT_SCHEMA_VERSION };

