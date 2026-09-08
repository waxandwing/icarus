/**
 * Original abstract arc/continuity mark (replaces ARC-001_arc-mark).
 * Recreated from scratch as inline SVG — no Canva/Figma source geometry.
 */
export function ArcMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Arc"
    >
      <path
        d="M8 40C8 24 20 12 34 12C44 12 52 18 56 27"
        stroke="var(--arc-terracotta)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M12 46C14 34 24 24 36 24C43 24 49 28 52 34"
        stroke="var(--arc-mustard)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M16 51C18 44 24 39 31 39"
        stroke="var(--arc-ink)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
