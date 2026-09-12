import { describe, expect, it } from 'vitest';
import {
  BOARD_PATTERN_LENGTH,
  BOARD_SHAPES,
  patternsMatch,
  randomBoardPattern,
  sanitizeBoardPattern,
} from './boardShapes';

describe('board privacy pattern', () => {
  it('is a four-shape sequence from the Arc brand set', () => {
    expect(BOARD_SHAPES.map((shape) => shape.id)).toEqual(['mustard', 'clay', 'slate', 'sage', 'forest']);
    const pattern = randomBoardPattern();
    expect(pattern).toHaveLength(BOARD_PATTERN_LENGTH);
    expect(sanitizeBoardPattern(pattern)).toEqual(pattern);
    expect(sanitizeBoardPattern(['mustard', 'typed-code'])).toBeNull();
  });

  it('only unlocks when the tapped sequence matches', () => {
    expect(patternsMatch(['mustard', 'clay', 'slate', 'sage'], ['mustard', 'clay', 'slate', 'sage'])).toBe(true);
    expect(patternsMatch(['mustard', 'clay', 'slate', 'sage'], ['mustard', 'clay', 'sage', 'slate'])).toBe(false);
  });
});
