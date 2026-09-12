import { beforeEach, describe, expect, it } from 'vitest';
import { dismissSetup, readEntrySession, reopenSetup, unlockBeta, verifyBetaPassword } from './session';

describe('entry session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts locked with setup still open', () => {
    expect(readEntrySession()).toEqual({ betaUnlocked: false, setupDismissed: false });
  });

  it('accepts the local beta password and rejects empty guesses', () => {
    expect(verifyBetaPassword('icarus')).toBe(true);
    expect(verifyBetaPassword('  Icarus  ')).toBe(true);
    expect(verifyBetaPassword('ICARUS')).toBe(true);
    expect(verifyBetaPassword('')).toBe(false);
    expect(verifyBetaPassword('arc-beta')).toBe(false);
    expect(verifyBetaPassword('wrong')).toBe(false);
  });

  it('persists unlock and a later skip of setup', () => {
    unlockBeta();
    expect(readEntrySession().betaUnlocked).toBe(true);
    expect(readEntrySession().setupDismissed).toBe(false);
    dismissSetup();
    expect(readEntrySession()).toEqual({ betaUnlocked: true, setupDismissed: true });
    reopenSetup();
    expect(readEntrySession().setupDismissed).toBe(false);
  });
});
