/**
 * Original abstract classroom-studio collage for the Fridge door
 * (replaces ARC-015_fridge-artwork). Non-representational shapes only —
 * no text, characters, or third-party motifs.
 */
export function FridgeArtwork({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="6" y="10" width="48" height="60" rx="3" fill="var(--arc-paper-white)" stroke="var(--arc-line-strong)" transform="rotate(-6 30 40)" />
      <circle cx="30" cy="34" r="10" fill="var(--arc-mustard)" transform="rotate(-6 30 40)" />
      <path d="M14 58l10-14 8 8 6-10 8 16z" fill="none" stroke="var(--arc-terracotta)" strokeWidth="2" transform="rotate(-6 30 40)" />

      <rect x="58" y="28" width="52" height="40" rx="3" fill="var(--arc-paper-white)" stroke="var(--arc-line-strong)" transform="rotate(4 84 48)" />
      <circle cx="72" cy="44" r="6" fill="none" stroke="var(--arc-blue)" strokeWidth="2.4" transform="rotate(4 84 48)" />
      <circle cx="88" cy="52" r="4" fill="var(--arc-blue)" transform="rotate(4 84 48)" />

      <rect x="30" y="72" width="40" height="30" rx="3" fill="var(--arc-paper-white)" stroke="var(--arc-line-strong)" transform="rotate(-3 50 87)" />
      <path d="M36 94l7-10 6 6 5-8 8 12z" fill="none" stroke="var(--arc-sage)" strokeWidth="2" transform="rotate(-3 50 87)" />
    </svg>
  );
}
