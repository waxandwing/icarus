/** Hand-drawn analog X variants for completed school days on the Year lens. */

const MARKS = [
  '/assets/arc/marks/year-x-1.png',
  '/assets/arc/marks/year-x-2.png',
  '/assets/arc/marks/year-x-3.png',
  '/assets/arc/marks/year-x-4.png',
] as const;

export function yearXSrc(iso: string): string {
  let n = 0;
  for (let i = 0; i < iso.length; i += 1) n += iso.charCodeAt(i) * (i + 3);
  return MARKS[n % MARKS.length];
}
