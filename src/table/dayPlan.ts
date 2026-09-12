import { todayISO } from '../calendar/dates';
import { resolveLessonStructure } from '../domain/lessonStructure';
import type { Lesson, Section, SelectionRef, Visibility, WorkspaceDomainState } from '../domain/types';
import {
  deliveryForSection,
  getOrderedSections,
  getSectionLessonsForDate,
} from '../projections/selectors';
import type { FlowBlock } from './classroom';
import { flowBlocksFromLesson, withClassroomCleanup } from './lessonParts';

export const TABLE_DAY_FOCUS_KEY = 'arc-table-day-focus';

export function isChosenForTable(visibility: Visibility | undefined): boolean {
  return visibility === 'daily-board' || visibility === 'live-classroom';
}

export type TableDayFocus = {
  date: string;
  sectionId?: string;
  lessonId?: string;
};

export type TableDayPlan = {
  date: string;
  headline: string;
  periodLabel: string;
  sectionId?: string;
  lessonId?: string;
  blocks: FlowBlock[];
};

export function writeTableDayFocus(focus: TableDayFocus): void {
  try {
    sessionStorage.setItem(TABLE_DAY_FOCUS_KEY, JSON.stringify(focus));
  } catch {
    /* private mode */
  }
}

export function readTableDayFocus(): TableDayFocus | null {
  try {
    const raw = sessionStorage.getItem(TABLE_DAY_FOCUS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TableDayFocus;
    if (!parsed || typeof parsed.date !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function resolveTeachingSection(
  domain: WorkspaceDomainState,
  date: string,
  focus?: Pick<TableDayFocus, 'sectionId' | 'lessonId'> | null,
  selection?: SelectionRef | null,
): Section | undefined {
  const sections = getOrderedSections(domain);
  if (focus?.sectionId) {
    const match = sections.find((section) => section.id === focus.sectionId);
    if (match) return match;
  }
  const lessonId = focus?.lessonId ?? (selection?.objectType === 'lesson' ? selection.objectId : undefined);
  if (lessonId) {
    const lesson = domain.lessons[lessonId];
    if (lesson?.sectionId) {
      const match = sections.find((section) => section.id === lesson.sectionId);
      if (match) return match;
    }
    if (lesson) {
      const hosting = sections.find((section) =>
        getSectionLessonsForDate(domain, section.id, date).some((placed) => placed.objectId === lesson.id),
      );
      if (hosting) return hosting;
    }
  }
  const withToday = sections.find((section) => getSectionLessonsForDate(domain, section.id, date).length > 0);
  return withToday ?? sections[0];
}

function pickLessonsForSection(
  domain: WorkspaceDomainState,
  section: Section,
  date: string,
  lessonId?: string,
): Lesson[] {
  const placed = getSectionLessonsForDate(domain, section.id, date);
  if (lessonId) {
    const wanted = placed.find((item) => item.objectId === lessonId);
    const record = wanted ? domain.lessons[wanted.objectId] : domain.lessons[lessonId];
    if (record) return [record];
  }
  const inProgress = placed.filter(
    (item) => deliveryForSection(domain, section.id, item.objectId) === 'in-progress',
  );
  const chosen = inProgress.length > 0 ? inProgress : placed;
  return chosen
    .map((item) => domain.lessons[item.objectId])
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export function buildTableDayPlan(
  domain: WorkspaceDomainState,
  date: string = todayISO(),
  options?: {
    sectionId?: string;
    lessonId?: string;
    selection?: SelectionRef | null;
  },
): TableDayPlan {
  const section = resolveTeachingSection(domain, date, options, options?.selection);
  if (!section) {
    return { date, headline: 'Teaching day', periodLabel: '', blocks: [] };
  }
  const course = domain.courses[section.courseId];
  const lessons = pickLessonsForSection(domain, section, date, options?.lessonId);
  const defaults = resolveLessonStructure(domain, section.courseId, section.id);
  const instructional = lessons.flatMap((lesson) => flowBlocksFromLesson(lesson, defaults));
  const blocks = instructional.length > 0 ? withClassroomCleanup(instructional) : [];
  return {
    date,
    headline: course?.name ?? 'Class',
    periodLabel: section.name,
    sectionId: section.id,
    lessonId: lessons[0]?.id,
    blocks,
  };
}

export function planFromWorkspace(
  domain: WorkspaceDomainState,
  focus: TableDayFocus | null,
  today: string = todayISO(),
): TableDayPlan {
  return buildTableDayPlan(domain, focus?.date ?? today, {
    sectionId: focus?.sectionId,
    lessonId: focus?.lessonId,
  });
}
