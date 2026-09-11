/**
 * Small original utility marks (replace ARC-013 important-circle,
 * ARC-014 add-mark, and the ARC-019 tab icon family). Hand-drawn wobble is
 * achieved with intentionally uneven bezier control points, not a filter.
 */

export function ImportantCircle({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M20.5 4.5c8 .3 14.8 6 15 13.7.2 8-6.6 15.3-15.3 15.8C11.6 34.4 4.9 28 4.6 20 4.3 12 10.9 5 19 4.6"
        fill="none"
        stroke="var(--arc-red)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AddMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.5" fill="var(--arc-ink)" />
      <path d="M12 7v10M7 12h10" stroke="var(--arc-paper-white)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.66 6.34l-1.7 1.7M8.04 15.96l-1.7 1.7M17.66 17.66l-1.7-1.7M8.04 8.04l-1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FridgeGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="5.5" x2="8" y2="7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="12.5" x2="8" y2="14.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TaskGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5l1.8 1.8L12.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7.5" y1="15.5" x2="16.5" y2="15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DrawerGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3.5" y="6" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="9.5" y1="12.5" x2="14.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 6l3-3h11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FixedMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M8 2.2v9.2M5.2 5.1l2.8-2.6 2.8 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="13.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function ChevronGlyph({ size = 16, direction = 'left' as 'left' | 'right' }) {
  const rotation = direction === 'left' ? 0 : 180;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
