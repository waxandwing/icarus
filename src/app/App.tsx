import { useEffect } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { useWorkspaceStore } from '../state/store';
import { AppFrame } from './AppFrame';
import styles from './App.module.css';

export function App() {
  const ready = useWorkspaceStore((s) => s.ui.ready);
  const highContrast = useWorkspaceStore((s) => s.domain.settings.highContrast);
  const reducedMotionSetting = useWorkspaceStore((s) => s.domain.settings.reducedMotion);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotionSetting));
  }, [highContrast, reducedMotionSetting]);

  if (!ready) {
    return (
      <div className={styles.splash} role="status" aria-live="polite">
        <ArcMark size={56} />
        <p>Opening Arc{'\u2026'}</p>
      </div>
    );
  }

  return <AppFrame />;
}
