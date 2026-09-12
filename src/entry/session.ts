const STORAGE_KEY = 'arc.entry.v1';

export interface EntrySession {
  betaUnlocked: boolean;
  setupDismissed: boolean;
}

const EMPTY: EntrySession = { betaUnlocked: false, setupDismissed: false };

/** Local beta gate. Override with VITE_ARC_BETA_PASSWORD if needed; never ship a second hardcoded secret. */
const BETA_PASSWORD = 'icarus';

function betaSecret(): string {
  const fromEnv = import.meta.env.VITE_ARC_BETA_PASSWORD;
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : BETA_PASSWORD;
}

export function readEntrySession(): EntrySession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<EntrySession>;
    return {
      betaUnlocked: Boolean(parsed.betaUnlocked),
      setupDismissed: Boolean(parsed.setupDismissed),
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeEntrySession(next: EntrySession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function verifyBetaPassword(input: string): boolean {
  const guess = input.trim().toLowerCase();
  if (!guess) return false;
  return guess === betaSecret().trim().toLowerCase();
}

export function unlockBeta(): EntrySession {
  const next = { ...readEntrySession(), betaUnlocked: true };
  writeEntrySession(next);
  return next;
}

export function dismissSetup(): EntrySession {
  const next = { ...readEntrySession(), setupDismissed: true };
  writeEntrySession(next);
  return next;
}

export function reopenSetup(): EntrySession {
  const next = { ...readEntrySession(), setupDismissed: false };
  writeEntrySession(next);
  return next;
}
