import { dayKind, isWeekend, toISODate } from '../calendar/dates';
import { useWorkspaceStore } from '../state/store';
import {
  BOARD_PATTERN_LENGTH,
  type BoardShapeId,
  patternKey,
  patternsMatch,
  randomBoardPattern,
  sanitizeBoardPattern,
} from './boardShapes';

export const DEFAULT_BOARD_SLUG = 'knyhagen';
export const BOARD_SESSION_KEY = 'arctable.board.session.v1';
export const BOARD_SESSION_CHANNEL = 'arctable-board-session';
export const BOARD_UNLOCK_KEY = 'arctable.board.unlock.v1';
export const CLASS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const RESERVED_SLUGS = new Set([
  'table',
  'board',
  'beta',
  'signup',
  'enter',
  'live',
  'settings',
  'desk',
  'planner',
  'calendar',
  'assets',
]);

export type BoardSession = {
  published: boolean;
  slug: string;
  pattern: BoardShapeId[];
  autoRunDate: string | null;
};

const listeners = new Set<(session: BoardSession) => void>();

export function sanitizeBoardSlug(input: string): string {
  const slug = input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  if (!slug || RESERVED_SLUGS.has(slug)) return DEFAULT_BOARD_SLUG;
  return slug;
}

export function slugFromTeacherName(name: string): string {
  const parts = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0] ?? '';
    const last = parts[parts.length - 1] ?? '';
    return sanitizeBoardSlug(`${first.slice(0, 1)}${last}`.slice(0, 24));
  }
  return sanitizeBoardSlug((parts[0] ?? '').slice(0, 24));
}

export function normalizeClassCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidClassCode(input: string): boolean {
  const code = normalizeClassCode(input);
  return code.length >= 4 && code.length <= 8 && [...code].every((ch) => CLASS_CODE_ALPHABET.includes(ch));
}

function fallbackSession(): BoardSession {
  return {
    published: false,
    slug: DEFAULT_BOARD_SLUG,
    pattern: randomBoardPattern(),
    autoRunDate: null,
  };
}

function normalizeSession(parsed: Partial<BoardSession> | null | undefined): BoardSession {
  const pattern = sanitizeBoardPattern(parsed?.pattern) ?? randomBoardPattern();
  const autoRunDate =
    typeof parsed?.autoRunDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.autoRunDate)
      ? parsed.autoRunDate
      : null;
  return {
    published: Boolean(parsed?.published),
    slug: sanitizeBoardSlug(parsed?.slug ?? DEFAULT_BOARD_SLUG),
    pattern,
    autoRunDate,
  };
}

export function readBoardSession(): BoardSession {
  try {
    const raw = localStorage.getItem(BOARD_SESSION_KEY);
    if (!raw) {
      const created = fallbackSession();
      localStorage.setItem(BOARD_SESSION_KEY, JSON.stringify(created));
      return created;
    }
    const parsed = JSON.parse(raw) as Partial<BoardSession>;
    const next = normalizeSession(parsed);
    if (
      next.published !== parsed.published ||
      next.slug !== parsed.slug ||
      patternKey(next.pattern) !== patternKey(sanitizeBoardPattern(parsed.pattern) ?? []) ||
      next.autoRunDate !== (parsed.autoRunDate ?? null)
    ) {
      localStorage.setItem(BOARD_SESSION_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return fallbackSession();
  }
}

function emit(session: BoardSession) {
  try {
    localStorage.setItem(BOARD_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode can refuse storage; in-memory + BroadcastChannel still work in this profile.
  }
  for (const listener of listeners) listener(session);
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(BOARD_SESSION_CHANNEL);
    channel.postMessage(session);
    channel.close();
  }
}

export function writeBoardSession(patch: Partial<BoardSession>): BoardSession {
  const current = readBoardSession();
  const next = normalizeSession({
    published: patch.published ?? current.published,
    slug: patch.slug ?? current.slug,
    pattern: patch.pattern ?? current.pattern,
    autoRunDate: patch.autoRunDate === undefined ? current.autoRunDate : patch.autoRunDate,
  });
  emit(next);
  return next;
}

export function publishBoard(): BoardSession {
  return writeBoardSession({ published: true });
}

export function unpublishBoard(): BoardSession {
  return writeBoardSession({ published: false, autoRunDate: null });
}

export function rotateBoardPattern(): BoardSession {
  return writeBoardSession({ pattern: randomBoardPattern() });
}

export function isInstructionalLocalDay(date = new Date()): boolean {
  if (isWeekend(date)) return false;
  try {
    const state = useWorkspaceStore.getState();
    if (!state.ui.ready) return true;
    const kind = dayKind(state.domain.calendar, toISODate(date));
    return kind === 'instructional' || kind === 'early-release';
  } catch {
    return true;
  }
}

/** Keep auto-run live only for today's local calendar date, and never on weekend/no-school. */
export function applyPublishPolicy(date = new Date()): BoardSession {
  const today = toISODate(date);
  const session = readBoardSession();
  const autoToday = session.autoRunDate === today;
  if (!autoToday) {
    if (session.autoRunDate && session.autoRunDate !== today) {
      return writeBoardSession({ published: false, autoRunDate: null });
    }
    return session;
  }
  if (!isInstructionalLocalDay(date)) {
    return writeBoardSession({ published: false, autoRunDate: null });
  }
  if (!session.published) return writeBoardSession({ published: true, autoRunDate: today });
  return session;
}

export function setAutoRunToday(enabled: boolean, date = new Date()): BoardSession {
  if (!enabled) return writeBoardSession({ published: false, autoRunDate: null });
  if (!isInstructionalLocalDay(date)) return writeBoardSession({ published: false, autoRunDate: null });
  return writeBoardSession({ published: true, autoRunDate: toISODate(date) });
}

export function readBoardUnlock(): string | null {
  try {
    return sessionStorage.getItem(BOARD_UNLOCK_KEY);
  } catch {
    return null;
  }
}

export function writeBoardUnlock(key: string) {
  try {
    sessionStorage.setItem(BOARD_UNLOCK_KEY, key);
  } catch {
    // Ignore quota / private mode.
  }
}

export function clearBoardUnlock() {
  try {
    sessionStorage.removeItem(BOARD_UNLOCK_KEY);
  } catch {
    // Ignore.
  }
}

export function isBoardUnlocked(session = readBoardSession()): boolean {
  const stored = readBoardUnlock();
  if (!stored) return false;
  return stored === patternKey(session.pattern);
}

export function tryUnlockBoard(attempt: readonly string[], session = readBoardSession()): boolean {
  if (attempt.length !== BOARD_PATTERN_LENGTH) return false;
  if (!patternsMatch(attempt, session.pattern)) return false;
  writeBoardUnlock(patternKey(session.pattern));
  return true;
}

export function subscribeBoardSession(listener: (session: BoardSession) => void): () => void {
  listeners.add(listener);
  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(BOARD_SESSION_CHANNEL);
    channel.onmessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      listener(normalizeSession(event.data as Partial<BoardSession>));
    };
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== BOARD_SESSION_KEY || !event.newValue) return;
    listener(readBoardSession());
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    channel?.close();
    window.removeEventListener('storage', onStorage);
  };
}

export function studentBoardPath(slug = readBoardSession().slug): string {
  return `/${sanitizeBoardSlug(slug)}/live`;
}

export function studentBoardUrl(slug?: string): string {
  return `${window.location.origin}${studentBoardPath(slug)}`;
}

export function liveSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z0-9][a-z0-9-]{0,31})\/live\/?$/i);
  if (!match?.[1]) return null;
  const slug = sanitizeBoardSlug(match[1]);
  return slug === DEFAULT_BOARD_SLUG || !RESERVED_SLUGS.has(match[1].toLowerCase()) ? slug : null;
}

export function isClassroomPath(pathname: string): boolean {
  if (pathname === '/table' || pathname.startsWith('/table/')) return true;
  if (pathname === '/board' || pathname.startsWith('/board/')) return true;
  return liveSlugFromPath(pathname) !== null;
}

export function isStudentBoardPath(pathname: string, search = ''): boolean {
  if (liveSlugFromPath(pathname)) return true;
  if (pathname === '/board' || pathname.startsWith('/board/')) return true;
  if (pathname === '/table' || pathname.startsWith('/table/')) {
    return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('display') === 'student';
  }
  return false;
}

export function isBoardJoinPath(pathname: string): boolean {
  return pathname === '/board' || pathname.startsWith('/board/');
}

export function isClaimedLiveSlug(slug: string, session = readBoardSession()): boolean {
  const next = sanitizeBoardSlug(slug);
  return next === DEFAULT_BOARD_SLUG || next === session.slug;
}

export function parseBoardJoinInput(input: string): { slug?: string; code?: string; href?: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const asUrl = trimmed.includes('://') || trimmed.startsWith('/') || trimmed.startsWith('www.');
  if (asUrl) {
    try {
      const href = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
      const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1');
      const slug = liveSlugFromPath(url.pathname);
      const room = normalizeClassCode(url.searchParams.get('room') ?? url.pathname.split('/').pop() ?? '');
      if (slug) return { slug, href: `${url.origin}${studentBoardPath(slug)}` };
      if (isValidClassCode(room) && (url.pathname.startsWith('/board') || url.pathname.startsWith('/table'))) {
        return { code: room };
      }
    } catch {
      return null;
    }
  }

  const code = normalizeClassCode(trimmed);
  if (isValidClassCode(code)) return { code };
  const slug = sanitizeBoardSlug(trimmed);
  if ((slug && slug !== DEFAULT_BOARD_SLUG) || trimmed.toLowerCase() === DEFAULT_BOARD_SLUG) {
    return { slug: sanitizeBoardSlug(trimmed) };
  }
  return null;
}
