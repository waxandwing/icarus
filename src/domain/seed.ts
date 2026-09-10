import { produce } from 'immer';
import { addCalendarDays } from '../calendar/dates';
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

/** Builds the calendar exceptions and a realistic sample teacher week. */
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
      label: 'Last Day · Early Release',
      confidence: 'confirmed',
    };

    const apah = cmd.createCourse(draft, { name: 'AP Art History', colorToken: 'mustard' });
    const apahSection = cmd.createSection(draft, { courseId: apah.id, name: 'Period 2' });
    const prehistory = cmd.createUnit(draft, {
      courseId: apah.id,
      title: 'Prehistory',
      colorToken: 'mustard',
      startDate: '2026-09-08',
      endDate: '2026-09-18',
    });
    const apahLesson1 = cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Origins + context',
      body: 'Close looking, context, and the first global prehistory objects.',
      date: '2026-09-08',
    });
    cmd.setDelivery(draft, { sectionId: apahSection.id, lessonId: apahLesson1.id, state: 'completed' });
    cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Cave conjecture',
      date: '2026-09-10',
    });

    const art2d = cmd.createCourse(draft, { name: '2D Art 1', colorToken: 'blue' });
    const art2dSection = cmd.createSection(draft, { courseId: art2d.id, name: 'Period 4' });
    const sketchbook = cmd.createUnit(draft, {
      courseId: art2d.id,
      title: 'Sketchbook Launch',
      colorToken: 'blue',
      startDate: '2026-09-08',
      endDate: '2026-09-17',
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Monoprint covers',
      body: 'Glossy board, marker transfer, spray, burnish.',
      date: '2026-09-08',
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Collage harvest',
      date: '2026-09-09',
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Assemble + refine',
      date: '2026-09-11',
    });

    const art3d = cmd.createCourse(draft, { name: '3D Art 1', colorToken: 'sage' });
    const art3dSection = cmd.createSection(draft, { courseId: art3d.id, name: 'Period 6' });
    const attachment = cmd.createUnit(draft, {
      courseId: art3d.id,
      title: 'Secure Attachment',
      colorToken: 'sage',
      startDate: '2026-09-08',
      endDate: '2026-09-16',
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Paper methods',
      date: '2026-09-08',
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Cardboard methods',
      date: '2026-09-09',
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Fan-test build',
      date: '2026-09-11',
    });

    cmd.createNote(draft, {
      title: 'Print AP image set',
      body: 'Need a class set before Period 2.',
      location: 'taskbar',
      taskColumn: 'must',
    });
    cmd.createNote(draft, {
      title: 'Refill glue guns',
      location: 'taskbar',
      taskColumn: 'should',
    });
    cmd.createNote(draft, {
      title: 'Photograph sketchbook covers',
      location: 'taskbar',
      taskColumn: 'could',
    });
    cmd.createNote(draft, {
      title: 'Make copies during 2nd',
      location: 'calendar',
      date: '2026-09-09',
    });

    cmd.createMagnet(draft, {
      magnetKind: 'idea',
      title: 'Try the new critique stem cards',
    });
    cmd.createMagnet(draft, {
      magnetKind: 'resource',
      title: 'Smarthistory · Prehistory overview',
    });
    cmd.createMagnet(draft, {
      magnetKind: 'reminder',
      title: 'Parent night is the 24th',
    });

    draft.history = [];
    draft.isSampleWorkspace = true;
  });
}

export { CURRENT_SCHEMA_VERSION };
