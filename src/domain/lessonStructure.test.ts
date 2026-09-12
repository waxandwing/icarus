import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { createInitialState } from './seed';
import { resolveLessonFrame, resolveLessonStructure } from './lessonStructure';

describe('resolveLessonStructure', () => {
  it('lets a section override the course recipe and otherwise inherits', () => {
    const domain = produce(createInitialState(), (draft) => {
      const course = Object.values(draft.courses)[0]!;
      const section = Object.values(draft.sections)[0]!;
      draft.courses[course.id].lessonStructure = [{ title: 'Bell work', minutes: 5, prompt: 'Daily doodle' }];
      draft.courses[course.id].lessonFrame = 'ubd';
      draft.sections[section.id].lessonStructure = [{ title: 'Warm Up', minutes: 8, prompt: 'Sketchbook' }];
    });
    const course = Object.values(domain.courses)[0]!;
    const section = Object.values(domain.sections)[0]!;
    expect(resolveLessonStructure(domain, course.id, section.id)[0]?.title).toBe('Warm Up');
    expect(resolveLessonFrame(domain, course.id, section.id)).toBe('ubd');

    const inherited = produce(domain, (draft) => {
      draft.sections[section.id].lessonStructure = [];
      draft.sections[section.id].lessonFrame = 'marzano';
    });
    expect(resolveLessonStructure(inherited, course.id, section.id)[0]?.prompt).toBe('Daily doodle');
    expect(resolveLessonFrame(inherited, course.id, section.id)).toBe('marzano');
  });
});
