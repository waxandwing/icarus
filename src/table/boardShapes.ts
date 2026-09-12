export const BOARD_SHAPES = [
  { id: 'mustard', label: 'mustard oval' },
  { id: 'clay', label: 'clay shard' },
  { id: 'slate', label: 'slate wedge' },
  { id: 'sage', label: 'sage leaf' },
  { id: 'forest', label: 'forest mark' },
] as const;

export type BoardShapeId = (typeof BOARD_SHAPES)[number]['id'];

export const BOARD_PATTERN_LENGTH = 4;

const SHAPE_IDS = BOARD_SHAPES.map((shape) => shape.id);

export function isBoardShapeId(value: string): value is BoardShapeId {
  return SHAPE_IDS.includes(value as BoardShapeId);
}

export function shapeLabel(id: BoardShapeId): string {
  return BOARD_SHAPES.find((shape) => shape.id === id)?.label ?? id;
}

export function randomBoardPattern(): BoardShapeId[] {
  const bytes = new Uint8Array(BOARD_PATTERN_LENGTH);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => SHAPE_IDS[byte % SHAPE_IDS.length]);
}

export function sanitizeBoardPattern(value: unknown): BoardShapeId[] | null {
  if (!Array.isArray(value) || value.length !== BOARD_PATTERN_LENGTH) return null;
  const next = value.filter((item): item is BoardShapeId => typeof item === 'string' && isBoardShapeId(item));
  return next.length === BOARD_PATTERN_LENGTH ? next : null;
}

export function patternsMatch(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}

export function patternKey(pattern: readonly string[]): string {
  return pattern.join('-');
}
