import { describe, expect, it } from 'vitest';
import { gateScreen } from './paths';

describe('entry path gate', () => {
  it('keeps locked visitors on landing unless they asked for beta or signup', () => {
    expect(gateScreen('/', false)).toBe('landing');
    expect(gateScreen('/beta', false)).toBe('beta');
    expect(gateScreen('/signup', false)).toBe('signup');
    expect(gateScreen('/enter', false)).toBe('landing');
    expect(gateScreen('/table', false)).toBe('table');
    expect(gateScreen('/board', false)).toBe('table');
    expect(gateScreen('/knyhagen/live', false)).toBe('table');
  });

  it('sends unlocked visitors to the desk, or Enter Arc if they are still on that step', () => {
    expect(gateScreen('/', true)).toBe('desk');
    expect(gateScreen('/enter', true)).toBe('enter');
    expect(gateScreen('/beta', true)).toBe('enter');
    expect(gateScreen('/table', true)).toBe('table');
    expect(gateScreen('/board', true)).toBe('table');
    expect(gateScreen('/knyhagen/live', true)).toBe('table');
  });
});
