export function ArcMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/assets/arc/arc-mark-stacked.webp"
      width={size}
      height={size}
      alt="Arc"
      decoding="async"
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}
