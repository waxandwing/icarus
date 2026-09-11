/** Geometric stacked Arc mark from the REBUILD header — cream field, no black plate. */
export function ArcMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 84"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <rect x="5" y="5" width="70" height="64" rx="5" fill="var(--arc-page)" stroke="var(--arc-forest)" strokeWidth="5" />
      <text
        x="12"
        y="36"
        fill="var(--arc-blue)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="30"
        fontWeight="700"
      >
        a
      </text>
      <path d="M48 10h22v24c0 10-8 16-16 16s-8-4-8-10V10Z" fill="var(--arc-terracotta)" />
      <text
        x="12"
        y="62"
        fill="var(--arc-mustard)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
      >
        r
      </text>
      <text
        x="36"
        y="78"
        fill="var(--arc-forest)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="38"
        fontWeight="700"
      >
        c
      </text>
    </svg>
  );
}
