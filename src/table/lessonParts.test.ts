import { describe, expect, it } from 'vitest';
import {
  flowBlockFromPart,
  flowBlocksFromLesson,
  parseLessonParts,
  withClassroomCleanup,
} from './lessonParts';

describe('parseLessonParts', () => {
  it('keeps a single notes blob as one part under the lesson title', () => {
    expect(parseLessonParts('Egg osmosis demo — set up before period starts.', 'Membrane lab')).toEqual([
      { title: 'Membrane lab', prompt: 'Egg osmosis demo — set up before period starts.' },
    ]);
  });

  it('splits markdown headings into ordered parts', () => {
    const parts = parseLessonParts(
      `## Warm Up
Name three organelles.

## Demo
Egg osmosis at the front table.

## Studio
Stations around the room.`,
      'Membrane lab',
    );
    expect(parts).toEqual([
      { title: 'Warm Up', prompt: 'Name three organelles.' },
      { title: 'Demo', prompt: 'Egg osmosis at the front table.' },
      { title: 'Studio', prompt: 'Stations around the room.' },
    ]);
  });

  it('splits numbered parts and treats a colon as title versus prompt', () => {
    const parts = parseLessonParts(
      `1. Bell ringer: name three organelles.
2. Lab
Egg osmosis demo.`,
      'Membrane lab',
    );
    expect(parts[0]).toEqual({ title: 'Bell ringer', prompt: 'name three organelles.' });
    expect(parts[1]).toEqual({ title: 'Lab', prompt: 'Egg osmosis demo.' });
  });

  it('uses the lesson title when notes are empty', () => {
    expect(parseLessonParts(undefined, 'Quiz')).toEqual([{ title: 'Quiz', prompt: '' }]);
  });
});

describe('flow block mapping', () => {
  it('maps a part to a block and appends classroom cleanup once', () => {
    const warmup = flowBlockFromPart(
      'les-1',
      { title: 'Warm Up', prompt: 'Settle in.' },
      0,
    );
    expect(warmup).toMatchObject({
      id: 'les-1:part:0',
      title: 'Warm Up',
      kind: 'block',
      minutes: 5,
      prompt: 'Settle in.',
    });
    const demo = flowBlockFromPart('les-1', { title: 'Demo', prompt: 'Watch.' }, 1);
    expect(demo.kind).toBe('demo');
    const withCleanup = withClassroomCleanup([warmup, demo]);
    expect(withCleanup.at(-1)?.kind).toBe('cleanup');
    expect(withCleanup.at(-1)?.title).toBe('Cleanup');
    expect(withClassroomCleanup(withCleanup)).toHaveLength(withCleanup.length);
  });
});

describe('class default structure → flow', () => {
  const defaults = [
    { title: 'Bell work', minutes: 5, prompt: 'Daily doodle' },
    { title: 'Demo', minutes: 15, kind: 'demo' as const, prompt: 'Watch the move' },
    { title: 'Studio', minutes: 25, prompt: 'Make' },
  ];
  const lesson = {
    id: 'les-blank',
    kind: 'lesson' as const,
    courseId: 'c1',
    sectionId: 's1',
    title: 'Collage day',
    important: false,
    crossedOut: false,
    visibility: 'teacher-private' as const,
    createdAt: 1,
  };

  it('fills flow from class defaults when the lesson has no headings', () => {
    const blocks = flowBlocksFromLesson({ ...lesson, body: undefined }, defaults);
    expect(blocks.map((b) => ({ title: b.title, minutes: b.minutes, prompt: b.prompt, kind: b.kind }))).toEqual([
      { title: 'Bell work', minutes: 5, prompt: 'Daily doodle', kind: 'block' },
      { title: 'Demo', minutes: 15, prompt: 'Watch the move', kind: 'demo' },
      { title: 'Studio', minutes: 25, prompt: 'Make', kind: 'block' },
    ]);
  });

  it('keeps explicit ## parts and does not replace them with class defaults', () => {
    const blocks = flowBlocksFromLesson(
      { ...lesson, body: '## Hook\nLook at the still life.\n\n## Work\nDraw for 20 minutes.' },
      defaults,
    );
    expect(blocks.map((b) => b.title)).toEqual(['Hook', 'Work']);
    expect(blocks[0]?.prompt).toContain('still life');
  });

  it('appends a blob note onto the first default prompt instead of inventing headings', () => {
    const blocks = flowBlocksFromLesson({ ...lesson, body: 'Bring magazines.' }, defaults);
    expect(blocks[0]?.title).toBe('Bell work');
    expect(blocks[0]?.prompt).toBe('Daily doodle\nBring magazines.');
    expect(blocks.map((b) => b.title)).toEqual(['Bell work', 'Demo', 'Studio']);
  });
});
