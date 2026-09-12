import { isClassroomPath } from '../table/boardSession';

export type EntryScreen = 'landing' | 'beta' | 'signup' | 'enter' | 'desk' | 'table';

export function screenFromPath(pathname: string): EntryScreen {
  if (isClassroomPath(pathname)) return 'table';
  if (pathname.startsWith('/beta')) return 'beta';
  if (pathname.startsWith('/signup')) return 'signup';
  if (pathname.startsWith('/enter')) return 'enter';
  return 'desk';
}

export function gateScreen(pathname: string, betaUnlocked: boolean): EntryScreen {
  const screen = screenFromPath(pathname);
  if (screen === 'table') return 'table';
  if (!betaUnlocked) {
    if (screen === 'beta' || screen === 'signup') return screen;
    return 'landing';
  }
  if (screen === 'enter' || screen === 'landing') return screen === 'landing' ? 'desk' : 'enter';
  if (screen === 'beta' || screen === 'signup') return 'enter';
  return 'desk';
}
