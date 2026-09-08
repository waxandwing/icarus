/**
 * Original tileable paper-grain texture (replaces ARC-002/016/017/018).
 * Uses SVG turbulence rather than a raster/photographic source so it stays a
 * production-original asset and scales cleanly at any density.
 */
import { useId } from 'react';

export function PaperGrain({
  baseColor,
  opacity = 0.5,
  className,
}: {
  baseColor: string;
  opacity?: number;
  className?: string;
}) {
  const id = `arc-grain-${useId()}`;
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" intercept="0" />
          </feComponentTransfer>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={baseColor} />
      <rect width="100%" height="100%" filter={`url(#${id})`} opacity={opacity * 0.18} />
    </svg>
  );
}
