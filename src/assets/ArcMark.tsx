/** Geometric stacked Arc mark from the REBUILD header — cream field, no black plate. */
export function ArcMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <rect x="6" y="6" width="68" height="60" rx="5" fill="var(--arc-page)" stroke="var(--arc-forest)" strokeWidth="5.5" />
      <text
        x="14"
        y="38"
        fill="var(--arc-blue)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
      >
        a
      </text>
      <path d="M46 12.5h21.5v26c0 8-7 13-14 13-5.5 0-7.5-3-7.5-8V12.5Z" fill="var(--arc-terracotta)" />
      <text
        x="14"
        y="64"
        fill="var(--arc-mustard)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="26"
        fontWeight="700"
      >
        r
      </text>
      <path
        d="M38 42c14 0 26 10 26 24H50c0-7-5-12-12-12-8 0-12 5-12 12H14c0-14 10-24 24-24Z"
        fill="var(--arc-forest)"
      />
    </svg>
  );
}
