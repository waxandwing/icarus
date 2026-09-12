import type {
  Lesson,
  LessonFrame,
  LessonPartDefault,
  WorkspaceDomainState,
} from './types';

export const LESSON_HEADING = /^(#{1,3})\s+(.+)$/;
export const LESSON_NUMBERED = /^(\d+)[.)]\s+(.+)$/;

/** True when the teacher already wrote period parts as headings or numbered lines. Those win. */
export function hasExplicitLessonParts(body: string | undefined): boolean {
  const text = (body ?? '').replace(/\r\n/g, '\n');
  if (!text.trim()) return false;
  for (const line of text.split('\n')) {
    if (line.match(LESSON_HEADING)?.[2] || line.match(LESSON_NUMBERED)?.[2]) return true;
  }
  return false;
}

export function serializeLessonStructure(parts: LessonPartDefault[]): string {
  return parts
    .map((part) => {
      const title = part.title.trim() || 'Part';
      const prompt = (part.prompt?.trim() || title).trim();
      return `## ${title}\n${prompt}`;
    })
    .join('\n\n');
}

export function resolveLessonStructure(
  domain: Pick<WorkspaceDomainState, 'courses' | 'sections'>,
  courseId: string,
  sectionId?: string,
): LessonPartDefault[] {
  const section = sectionId ? domain.sections[sectionId] : undefined;
  if (section?.lessonStructure?.length) return section.lessonStructure;
  return domain.courses[courseId]?.lessonStructure ?? [];
}

export function resolveLessonFrame(
  domain: Pick<WorkspaceDomainState, 'courses' | 'sections'>,
  courseId: string,
  sectionId?: string,
): LessonFrame {
  const section = sectionId ? domain.sections[sectionId] : undefined;
  if (section?.lessonFrame) return section.lessonFrame;
  return domain.courses[courseId]?.lessonFrame ?? 'none';
}

export function matchStructurePart(
  defaults: LessonPartDefault[],
  title: string,
): LessonPartDefault | undefined {
  const needle = title.trim().toLowerCase();
  return defaults.find((part) => part.title.trim().toLowerCase() === needle);
}

export function filledLessonBody(
  lesson: Pick<Lesson, 'body' | 'courseId' | 'sectionId'>,
  domain: Pick<WorkspaceDomainState, 'courses' | 'sections'>,
): string | undefined {
  if (hasExplicitLessonParts(lesson.body)) return lesson.body;
  if ((lesson.body ?? '').trim()) return lesson.body;
  const structure = resolveLessonStructure(domain, lesson.courseId, lesson.sectionId);
  if (!structure.length) return lesson.body;
  return serializeLessonStructure(structure);
}
