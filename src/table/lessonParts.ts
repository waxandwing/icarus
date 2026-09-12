import {
  hasExplicitLessonParts,
  LESSON_HEADING,
  LESSON_NUMBERED,
  matchStructurePart,
} from '../domain/lessonStructure';
import type { Lesson, LessonPartDefault } from '../domain/types';
import { DEFAULT_FLOW, type FlowBlock, type FlowKind } from './classroom';

export type LessonPart = {
  title: string;
  prompt: string;
};

function splitTitlePrompt(raw: string): LessonPart {
  const trimmed = raw.trim();
  const colon = trimmed.match(/^(.{1,48}?)[:：]\s+(.+)$/s);
  if (colon?.[1] && colon[2]) return { title: colon[1].trim(), prompt: colon[2].trim() };
  const dash = trimmed.match(/^(.{1,48}?)\s+[—–]\s+(.+)$/s);
  if (dash?.[1] && dash[2]) return { title: dash[1].trim(), prompt: dash[2].trim() };
  return { title: trimmed, prompt: '' };
}

function flushPart(part: LessonPart): LessonPart {
  return { title: part.title.trim(), prompt: part.prompt.trim() };
}

/** Split a lesson notes field into ordered parts (markdown headings or numbered lines). */
export function parseLessonParts(body: string | undefined, fallbackTitle: string): LessonPart[] {
  const text = (body ?? '').replace(/\r\n/g, '\n').trim();
  const fallback = fallbackTitle.trim() || 'Lesson';
  if (!text) return [{ title: fallback, prompt: '' }];

  const parts: LessonPart[] = [];
  let current: LessonPart | null = null;
  let sawSplit = false;

  const startPart = (rawTitle: string) => {
    if (current) parts.push(flushPart(current));
    current = splitTitlePrompt(rawTitle);
    sawSplit = true;
  };

  for (const line of text.split('\n')) {
    const heading = line.match(LESSON_HEADING);
    if (heading?.[2]) {
      startPart(heading[2]);
      continue;
    }
    const numbered = line.match(LESSON_NUMBERED);
    if (numbered?.[2]) {
      startPart(numbered[2]);
      continue;
    }
    if (!current) {
      current = { title: fallback, prompt: line };
      continue;
    }
    current.prompt = current.prompt ? `${current.prompt}\n${line}` : line;
  }
  if (current) parts.push(flushPart(current));

  if (!sawSplit) return [{ title: fallback, prompt: text }];
  return parts.filter((part) => part.title.length > 0);
}

export function flowKindForPartTitle(title: string): FlowKind {
  const t = title.toLowerCase();
  if (/\bclean\s*up\b|\bcleanup\b/.test(t)) return 'cleanup';
  if (/\bdemo\b|\bdemonstration\b/.test(t)) return 'demo';
  return 'block';
}

export function minutesForPartTitle(title: string, kind: FlowKind = flowKindForPartTitle(title)): number {
  if (kind === 'cleanup') return 5;
  const t = title.toLowerCase();
  if (/\bwarm\b|\bbell\b|\bhook\b/.test(t)) return 5;
  if (kind === 'demo') return 15;
  if (/\bstudio\b|\bwork time\b/.test(t)) return 25;
  if (/\bcritique\b/.test(t)) return 10;
  return 10;
}

export function classroomCleanupBlock(idSuffix = 'day'): FlowBlock {
  const gold = DEFAULT_FLOW.find((block) => block.kind === 'cleanup') ?? {
    id: 'cleanup',
    title: 'Cleanup',
    minutes: 5,
    kind: 'cleanup' as const,
    prompt: 'Tools away. Tables clear. Chairs in.',
  };
  return { ...gold, id: `cleanup:${idSuffix}` };
}

export function withClassroomCleanup(blocks: FlowBlock[]): FlowBlock[] {
  const last = blocks[blocks.length - 1];
  if (last?.kind === 'cleanup') return blocks;
  return [...blocks, classroomCleanupBlock(blocks[0]?.id ?? 'day')];
}

export function flowBlockFromPart(
  lessonId: string,
  part: LessonPart,
  index: number,
  fallback?: LessonPartDefault,
): FlowBlock {
  const kind = fallback?.kind ?? flowKindForPartTitle(part.title);
  return {
    id: `${lessonId}:part:${index}`,
    title: part.title,
    minutes: fallback?.minutes ?? minutesForPartTitle(part.title, kind),
    kind,
    prompt: part.prompt || fallback?.prompt || part.title,
  };
}

function flowBlocksFromDefaults(
  lesson: Lesson,
  defaults: LessonPartDefault[],
): FlowBlock[] {
  const leftover = hasExplicitLessonParts(lesson.body) ? '' : (lesson.body ?? '').trim();
  return defaults.map((def, index) => {
    const kind = def.kind ?? flowKindForPartTitle(def.title);
    const base = (def.prompt?.trim() || def.title).trim();
    const prompt = index === 0 && leftover ? [base, leftover].filter(Boolean).join('\n') : base;
    return {
      id: `${lesson.id}:part:${index}`,
      title: def.title,
      minutes: def.minutes,
      kind,
      prompt,
    };
  });
}

/** One flow block per lesson part. Class defaults fill when the body has no ## / numbered parts. */
export function flowBlocksFromLesson(lesson: Lesson, defaults: LessonPartDefault[] = []): FlowBlock[] {
  if (hasExplicitLessonParts(lesson.body)) {
    return parseLessonParts(lesson.body, lesson.title).map((part, index) =>
      flowBlockFromPart(lesson.id, part, index, matchStructurePart(defaults, part.title)),
    );
  }
  if (defaults.length > 0) return flowBlocksFromDefaults(lesson, defaults);
  return parseLessonParts(lesson.body, lesson.title).map((part, index) =>
    flowBlockFromPart(lesson.id, part, index),
  );
}
