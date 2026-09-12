import { useEffect, useState } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { EntryFlow } from '../entry/EntryFlow';
import { gateScreen } from '../entry/paths';
import { readEntrySession } from '../entry/session';
import { ArcTable } from '../table/ArcTable';
import { isStudentDisplay } from '../table/launch';
import { useWorkspaceStore } from '../state/store';
import { AppFrame } from './AppFrame';
import { useOsDisplayPrefs } from './useOsDisplayPrefs';
import styles from './App.module.css';

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  function go(next: string) {
    if (next === window.location.pathname) {
      setPathname(next);
      return;
    }
    window.history.pushState({}, '', next);
    setPathname(next);
  }

  return [pathname, go] as const;
}

export function App() {
  const ready = useWorkspaceStore((s) => s.ui.ready);
  const highContrast = useWorkspaceStore((s) => s.domain.settings.highContrast);
  const reducedMotionSetting = useWorkspaceStore((s) => s.domain.settings.reducedMotion);
  const { osHighContrast, osReducedMotion } = useOsDisplayPrefs();
  const [pathname, go] = usePathname();
  const [entry, setEntry] = useState(readEntrySession);
  const screen = gateScreen(pathname, entry.betaUnlocked);

  const studentTable = screen === 'table' && isStudentDisplay();

  useEffect(() => {
    if (screen === 'desk') void useWorkspaceStore.getState().init();
    if (screen === 'table' && !isStudentDisplay()) void useWorkspaceStore.getState().init();
  }, [screen]);

  useEffect(() => {
    const contrastOn = highContrast || osHighContrast;
    const motionOn = reducedMotionSetting || osReducedMotion;
    document.documentElement.setAttribute('data-high-contrast', String(contrastOn));
    document.documentElement.setAttribute('data-reduced-motion', String(motionOn));
  }, [highContrast, reducedMotionSetting, osHighContrast, osReducedMotion]);

  // Student kiosk follows the teacher over BroadcastChannel and stays display-only.
  if (screen === 'table' && studentTable) return <ArcTable />;

  // Teacher /table reads the planner workspace so today's lesson parts are the flow.
  if (screen === 'table') {
    if (!ready) {
      return (
        <div className={styles.splash} role="status" aria-live="polite">
          <ArcMark size={56} />
          <p>Opening the table…</p>
        </div>
      );
    }
    return <ArcTable />;
  }

  if (screen !== 'desk') {
    return (
      <EntryFlow
        screen={screen}
        onGo={(next) => {
          setEntry(readEntrySession());
          go(next);
        }}
      />
    );
  }

  if (!ready) {
    return (
      <div className={styles.splash} role="status" aria-live="polite">
        <ArcMark size={56} />
        <p>Opening Arc…</p>
      </div>
    );
  }

  return <AppFrame />;
}
