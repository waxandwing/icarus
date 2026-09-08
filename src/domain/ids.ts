/**
 * Stable identity is a non-negotiable invariant (see docs/01_ARCHITECTURE_AND_STATE.md).
 * Every canonical entity and placement gets one of these ids at creation and keeps it
 * for the rest of its life, across every move, shift, and projection.
 */
export function createId(prefix: string): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${raw}`;
}
