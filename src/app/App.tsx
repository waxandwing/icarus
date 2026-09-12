import { useEffect } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { ArcTable } from '../table/ArcTable';
import { useWorkspaceStore } from '../state/store';
import { AppFrame } from './AppFrame';
import { useOsDisplayPrefs } from './useOsDisplayPrefs';
import styles from './App.module.css';

export function App() {
  const ready = useWorkspaceStore((s) => s.ui.ready);
  const highContrast = useWorkspaceStore((s) => s.domain.settings.highContrast);
  const reducedMotionSetting = useWorkspaceStore((s) => s.domain.settings.reducedMotion);
  const { osHighContrast, osReducedMotion } = useOsDisplayPrefs();
  const tableLive = window.location.pathname.startsWith('/table');

  useEffect(() => {
    if (!tableLive) void useWorkspaceStore.getState().init();
  }, [tableLive]);

  useEffect(() => {
    const contrastOn = highContrast || osHighContrast;
    const motionOn = reducedMotionSetting || osReducedMotion;
    document.documentElement.setAttribute('data-high-contrast', String(contrastOn));
    document.documentElement.setAttribute('data-reduced-motion', String(motionOn));
  }, [highContrast, reducedMotionSetting, osHighContrast, osReducedMotion]);

  if (tableLive) return <ArcTable />;

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
