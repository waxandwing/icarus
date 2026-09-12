import { describe, expect, it } from 'vitest';
import {
  CLEANUP_SECONDS,
  addFlowBlock,
  addNamedStudents,
  closePass,
  DEFAULT_FLOW,
  DEFAULT_TABLE_PREFS,
  displayModeFromWidth,
  durationLabel,
  elapsedSeconds,
  enabledPassKinds,
  formatElapsed,
  formatTimer,
  isCleanup,
  isPassOverdue,
  moveFlowBlock,
  nextBlock,
  nextPassState,
  parseStudentNames,
  passHeading,
  pickStudent,
  removeFlowBlock,
  removeStudentById,
  requestArcSync,
  resolveDisplayMode,
  roomStatusLabel,
  resolveAccessibilityToggle,
  secondsForBlock,
  startPass,
  STUDENTS,
  updateFlowBlock,
} from './classroom';

describe('ArcTable classroom session helpers', () => {
  it('treats five minutes and under as cleanup unless the current block is itself cleanup', () => {
    expect(isCleanup(CLEANUP_SECONDS)).toBe(true);
    expect(isCleanup(CLEANUP_SECONDS + 1)).toBe(false);
    expect(isCleanup(8 * 60, DEFAULT_FLOW[4])).toBe(true);
    expect(isCleanup(25 * 60, DEFAULT_FLOW[2])).toBe(false);
  });

  it('lets a teacher set a block length without changing the rest of the day', () => {
    expect(durationLabel(7)).toBe('7 min');
    expect(secondsForBlock(7)).toBe(7 * 60);
    expect(nextBlock(DEFAULT_FLOW, 2)?.title).toBe('Critique');
    expect(nextBlock(DEFAULT_FLOW, 4)).toBeNull();
  });

  it('adds, names, and removes a class-order block instead of leaving a dead stub', () => {
    const added = addFlowBlock(DEFAULT_FLOW);
    expect(added).toHaveLength(DEFAULT_FLOW.length + 1);
    expect(added[added.length - 1]?.title).toBe('New block');
    const named = updateFlowBlock(added, added.length - 1, { title: 'Gallery walk', minutes: 8, kind: 'block' });
    expect(named[named.length - 1]?.title).toBe('Gallery walk');
    expect(named[named.length - 1]?.minutes).toBe(8);
    expect(removeFlowBlock(named, named.length - 1)).toHaveLength(DEFAULT_FLOW.length);
    expect(moveFlowBlock(DEFAULT_FLOW, 2, 1)[3]?.title).toBe('Studio Time');
  });

  it('keeps absent students out of the picker pool', () => {
    for (let i = 0; i < 12; i += 1) {
      expect(pickStudent('available', undefined, ['amira'])?.id).not.toBe('amira');
    }
  });

  it('only offers pass destinations the teacher left on', () => {
    expect(enabledPassKinds({ ...DEFAULT_TABLE_PREFS, passBathroom: false, passNurse: true, passOffice: false })).toEqual(['nurse']);
  });

  it('formats the live timer without baking numerals into artwork', () => {
    expect(formatTimer(24 * 60 + 58)).toBe('24:58');
    expect(formatTimer(0)).toBe('00:00');
  });

  it('maps Smart Board, laptop, and compact widths', () => {
    expect(displayModeFromWidth(1920)).toBe('board');
    expect(displayModeFromWidth(1600)).toBe('board');
    expect(displayModeFromWidth(1440)).toBe('laptop');
    expect(displayModeFromWidth(1024)).toBe('laptop');
    expect(displayModeFromWidth(980)).toBe('compact');
    expect(displayModeFromWidth(390)).toBe('compact');
    expect(displayModeFromWidth(320)).toBe('compact');
  });

  it('lets a teacher force a display mode instead of following the window', () => {
    expect(resolveDisplayMode('board', 390)).toBe('board');
    expect(resolveDisplayMode('auto', 390)).toBe('compact');
  });

  it('walks pass available → active → return without collapsing states', () => {
    expect(nextPassState('available')).toBe('active');
    expect(nextPassState('active')).toBe('return');
    expect(nextPassState('return')).toBe('available');
  });

  it('lets a teacher paste a roster instead of waiting on a fake SIS', () => {
    const names = parseStudentNames('Maya Chen\nAmira K.\n  Luis P.  , Dee Patel');
    expect(names).toEqual(['Maya Chen', 'Amira K.', 'Luis P.', 'Dee Patel']);
    const roster = addNamedStudents(STUDENTS, ['Maya Chen', 'Amira K.']);
    expect(roster.some((student) => student.name === 'Maya Chen')).toBe(true);
    expect(roster.filter((student) => student.name === 'Amira K.')).toHaveLength(1);
    expect(removeStudentById(roster, 'maya-missing')).toHaveLength(roster.length);
  });

  it('records a named pass and flags ten minutes out', () => {
    const amira = STUDENTS[0];
    if (!amira) throw new Error('seed roster');
    const started = startPass(amira, 'bathroom', 1_000);
    expect(started.studentName).toBe('Amira K.');
    expect(isPassOverdue(started.outAt, 1_000 + 9 * 60 * 1000)).toBe(false);
    expect(isPassOverdue(started.outAt, 1_000 + 10 * 60 * 1000)).toBe(true);
    expect(formatElapsed(elapsedSeconds(started.outAt, 1_000 + 65_000))).toBe('01:05');
    expect(closePass(started, 2_000).inAt).toBe(2_000);
  });

  it('does not pretend Arc roster sync succeeded', () => {
    expect(requestArcSync(50).connected).toBe(false);
    expect(requestArcSync(50).lastAttemptAt).toBe(50);
  });

  it('never picks a student who is currently out on a pass', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(pickStudent('active')?.id).not.toBe('jordan');
    }
  });

  it('keeps blackout distinct from hold and reconnecting', () => {
    expect(roomStatusLabel(true, 'hold')).toBe('black');
    expect(roomStatusLabel(false, 'hold')).toBe('hold');
    expect(passHeading('active')).toBe('1 student out');
  });

  it('follows the OS accessibility preference until a teacher sets an override', () => {
    expect(resolveAccessibilityToggle(null, true)).toBe(true);
    expect(resolveAccessibilityToggle(null, false)).toBe(false);
    expect(resolveAccessibilityToggle(false, true)).toBe(false);
    expect(resolveAccessibilityToggle(true, false)).toBe(true);
  });
});
