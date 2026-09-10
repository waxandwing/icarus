import { produce } from 'immer';
import { addCalendarDays } from '../calendar/dates';
import * as cmd from './commands';
import type { WorkspaceDomainState } from './types';

export const CURRENT_SCHEMA_VERSION = 3;

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
    cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Cave conjecture',
      body: 'Close looking and evidence-based claims.',
      date: '2026-09-08',
      fields: [
        { label: 'Bell Ringer', content: 'What can an image prove?', plannerVisible: true, tableVisible: true },
        { label: 'Mini Lesson', content: 'Evidence vs. inference', plannerVisible: true, tableVisible: true },
      ],
    });
    cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Apollo 11 stones',
      date: '2026-09-09',
    });
    cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Great Hall of the Bulls',
      date: '2026-09-10',
    });
    cmd.createLesson(draft, {
      courseId: apah.id,
      unitId: prehistory.id,
      sectionId: apahSection.id,
      title: 'Camelid sacrum',
      date: '2026-09-11',
    });

    const art2d = cmd.createCourse(draft, { name: '2D Art 1', colorToken: 'blue' });
    const art2dSection = cmd.createSection(draft, { courseId: art2d.id, name: 'Period 4' });
    const sketchbook = cmd.createUnit(draft, {
      courseId: art2d.id,
      title: 'Sketchbook Launch',
      colorToken: 'blue',
      startDate: '2026-09-08',
      endDate: '2026-09-15',
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Daily Doodle + covers',
      date: '2026-09-08',
      fields: [
        { label: 'Materials', content: 'Journals, markers, spray bottles', plannerVisible: true, tableVisible: true },
        { label: 'Clean Up', content: 'Return journals and wipe tables', plannerVisible: true, tableVisible: true },
      ],
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Monoprint stations',
      date: '2026-09-09',
    });
    cmd.createLesson(draft, {
      courseId: art2d.id,
      unitId: sketchbook.id,
      sectionId: art2dSection.id,
      title: 'Collage harvesting',
      date: '2026-09-10',
    });

    const art3d = cmd.createCourse(draft, { name: '3D Art 1', colorToken: 'sage' });
    const art3dSection = cmd.createSection(draft, { courseId: art3d.id, name: 'Period 6' });
    const attachment = cmd.createUnit(draft, {
      courseId: art3d.id,
      title: 'Secure Attachment',
      colorToken: 'sage',
      startDate: '2026-09-08',
      endDate: '2026-09-18',
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Paper attachment lab',
      date: '2026-09-08',
      fields: [
        { label: 'Materials', content: 'Paper, scissors, tape', plannerVisible: true, tableVisible: true },
        { label: 'Safety', content: 'Cut away from hands and bodies', plannerVisible: true, tableVisible: true },
      ],
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Cardboard attachment lab',
      date: '2026-09-09',
    });
    cmd.createLesson(draft, {
      courseId: art3d.id,
      unitId: attachment.id,
      sectionId: art3dSection.id,
      title: 'Fan test challenge',
      date: '2026-09-10',
    });

    draft.isSampleWorkspace = true;
  });
}
