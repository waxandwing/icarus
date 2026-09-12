/** Hand-drawn analog X variants for completed school days on the Year lens. */

const MARKS = [
  '/assets/arc/marks/year-x-1.png',
  '/assets/arc/marks/year-x-2.png',
  '/assets/arc/marks/year-x-3.png',
  '/assets/arc/marks/year-x-4.png',
] as const;

export const YEAR_INKS = ['charcoal', 'forest', 'terracotta', 'kraft', 'navy'] as const;
export type YearInk = (typeof YEAR_INKS)[number];

function hashIso(iso: string): number {
  let n = 0;
  for (let i = 0; i < iso.length; i += 1) n += iso.charCodeAt(i) * (i + 3);
  return n;
}

export function yearXLook(iso: string): {
  src: string;
  ink: YearInk;
  rotate: number;
  scale: number;
} {
  const n = hashIso(iso);
  return {
    src: MARKS[n % MARKS.length],
    ink: YEAR_INKS[(n >> 3) % YEAR_INKS.length],
    rotate: (n % 23) - 11,
    scale: 0.96 + ((n >> 2) % 5) * 0.05,
  };
}

export function yearOutRotate(iso: string): number {
  return (hashIso(iso) % 15) - 7;
}
