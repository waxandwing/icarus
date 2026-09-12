import { afterEach, describe, expect, it } from 'vitest';
import { BOARD_UNLOCK_KEY } from './boardSession';
import {
  BOARD_SESSION_KEY,
  DEFAULT_BOARD_SLUG,
  applyPublishPolicy,
  isClaimedLiveSlug,
  isClassroomPath,
  isStudentBoardPath,
  liveSlugFromPath,
  parseBoardJoinInput,
  publishBoard,
  readBoardSession,
  setAutoRunToday,
  slugFromTeacherName,
  studentBoardPath,
  tryUnlockBoard,
  unpublishBoard,
  writeBoardSession,
} from './boardSession';

afterEach(() => {
  localStorage.removeItem(BOARD_SESSION_KEY);
  sessionStorage.removeItem(BOARD_UNLOCK_KEY);
});

describe('live board address', () => {
  it('uses /{slug}/live, not a query string', () => {
    expect(studentBoardPath('knyhagen')).toBe('/knyhagen/live');
    expect(liveSlugFromPath('/knyhagen/live')).toBe('knyhagen');
    expect(liveSlugFromPath('/table')).toBeNull();
    expect(isStudentBoardPath('/knyhagen/live')).toBe(true);
    expect(isStudentBoardPath('/board')).toBe(true);
    expect(isStudentBoardPath('/table', '?display=student')).toBe(true);
    expect(isStudentBoardPath('/table')).toBe(false);
    expect(isClassroomPath('/knyhagen/live')).toBe(true);
    expect(isClassroomPath('/board')).toBe(true);
    expect(isClassroomPath('/table')).toBe(true);
    expect(isClassroomPath('/')).toBe(false);
  });

  it('derives Kelly Nyhagen as knyhagen', () => {
    expect(slugFromTeacherName('Kelly Nyhagen')).toBe('knyhagen');
    expect(isClaimedLiveSlug('knyhagen')).toBe(true);
  });

  it('parses a pasted live link from the local origin', () => {
    expect(parseBoardJoinInput('http://127.0.0.1:43217/knyhagen/live')).toEqual({
      slug: 'knyhagen',
      href: 'http://127.0.0.1:43217/knyhagen/live',
    });
    expect(parseBoardJoinInput('K7M2P')?.code).toBe('K7M2P');
  });
});

describe('publish gate', () => {
  it('starts unpublished and does not stay live after unpublish', () => {
    const session = readBoardSession();
    expect(session.published).toBe(false);
    expect(session.slug).toBe(DEFAULT_BOARD_SLUG);
    expect(session.pattern).toHaveLength(4);
    expect(publishBoard().published).toBe(true);
    expect(unpublishBoard().published).toBe(false);
    expect(writeBoardSession({ slug: 'smith' }).slug).toBe('smith');
  });

  it('keeps class content locked until the shape pattern matches', () => {
    const session = writeBoardSession({ pattern: ['mustard', 'clay', 'slate', 'sage'] });
    expect(tryUnlockBoard(['mustard', 'clay', 'sage', 'slate'], session)).toBe(false);
    expect(tryUnlockBoard(['mustard', 'clay', 'slate', 'sage'], session)).toBe(true);
  });

  it('does not auto-run on a weekend', () => {
    const saturday = new Date(2026, 8, 12);
    const session = setAutoRunToday(true, saturday);
    expect(session.published).toBe(false);
    expect(session.autoRunDate).toBeNull();
  });

  it('keeps auto-run live only for that calendar day', () => {
    const friday = new Date(2026, 8, 11);
    const session = setAutoRunToday(true, friday);
    expect(session.published).toBe(true);
    expect(session.autoRunDate).toBe('2026-09-11');
    const next = applyPublishPolicy(new Date(2026, 8, 14));
    expect(next.published).toBe(false);
    expect(next.autoRunDate).toBeNull();
  });
});
