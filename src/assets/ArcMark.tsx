/** Real stacked Arc mark — cream field, hanging c, no black plate. */
export function ArcMark({ size = 48 }: { size?: number }) {
  const height = Math.round(size * (269 / 256));
  return (
    <img
      src="/assets/arc/arc-mark.png"
      width={size}
      height={height}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
}
