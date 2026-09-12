import { describe, expect, it } from 'vitest';
import { produce } from 'immer';
import { createInitialState } from '../domain/seed';
import * as cmd from '../domain/commands';
import { buildTableDayPlan, isChosenForTable, resolveTeachingSection } from './dayPlan';

describe('table day plan', () => {
  it('treats daily-board visibility as chosen for the table', () => {
    expect(isChosenForTable('daily-board')).toBe(true);
    expect(isChosenForTable('teacher-private')).toBe(false);
  });

  it('loads that day\'s lesson for the focused section, by part, plus cleanup', () => {
    const domain = produce(createInitialState(), (draft) => {
      const bio = Object.values(draft.courses)[0]!;
      cmd.createSection(draft, { courseId: bio.id, name: 'Period 5' });
      const period5 = Object.values(draft.sections).find((s) => s.name === 'Period 5')!;
      const unit = Object.values(draft.units).find((u) => u.title.includes('Cell'))!;
      cmd.createLesson(draft, {
        courseId: bio.id,
        unitId: unit.id,
        sectionId: period5.id,
        title: 'Microscope stations',
        body: '## Hook\nFind a specimen.\n\n## Studio\nRotate tables.',
        date: '2026-09-10',
      });
    });

    const period2 = Object.values(domain.sections).find((s) => s.name === 'Period 2')!;
    const period5 = Object.values(domain.sections).find((s) => s.name === 'Period 5')!;
    const first = resolveTeachingSection(domain, '2026-09-10');
    expect(first?.id).toBe(period2.id);

    const onDay = buildTableDayPlan(domain, '2026-09-10', { sectionId: period2.id });
    expect(onDay.periodLabel).toBe('Period 2');
    expect(onDay.headline).toBe('AP Biology');
    expect(onDay.blocks.map((b) => b.title)).toEqual(['Warm Up', 'Demo', 'Studio', 'Critique', 'Cleanup']);
    expect(onDay.blocks[0]?.prompt).toContain('organelles');
    expect(onDay.blocks.find((b) => b.title === 'Demo')?.kind).toBe('demo');
    expect(onDay.blocks.at(-1)?.kind).toBe('cleanup');

    const fifth = buildTableDayPlan(domain, '2026-09-10', { sectionId: period5.id });
    expect(fifth.periodLabel).toBe('Period 5');
    expect(fifth.blocks.map((b) => b.title)).toEqual(['Hook', 'Studio', 'Cleanup']);
    expect(fifth.blocks.some((b) => b.title.includes('Membrane'))).toBe(false);
  });

  it('does not invent a flow when the focused section has no lesson that day', () => {
    const domain = createInitialState();
    const empty = buildTableDayPlan(domain, '2026-09-11');
    expect(empty.blocks).toEqual([]);
  });

  it('maps a section lesson with no headings onto that class\'s default parts', () => {
    const domain = produce(createInitialState(), (draft) => {
      const bio = Object.values(draft.courses)[0]!;
      draft.courses[bio.id].lessonStructure = [
        { title: 'Bell work', minutes: 5, prompt: 'Daily doodle' },
        { title: 'Demo', minutes: 12, kind: 'demo', prompt: 'Show the station' },
      ];
      const section = Object.values(draft.sections)[0]!;
      cmd.createLesson(draft, {
        courseId: bio.id,
        sectionId: section.id,
        title: 'Open studio',
        date: '2026-09-11',
        allowCollision: true,
      });
    });
    const section = Object.values(domain.sections)[0]!;
    const plan = buildTableDayPlan(domain, '2026-09-11', { sectionId: section.id });
    expect(plan.blocks.map((b) => b.title)).toEqual(['Bell work', 'Demo', 'Cleanup']);
    expect(plan.blocks[0]?.prompt).toBe('Daily doodle');
    expect(plan.blocks[0]?.minutes).toBe(5);
    expect(plan.blocks[1]?.kind).toBe('demo');
  });
});
