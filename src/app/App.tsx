import { useEffect, useState } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { useWorkspaceStore } from '../state/store';
import { AppFrame } from './AppFrame';
import { EntryFlow } from './EntryFlow';
import styles from './App.module.css';

export function App() {
  const ready = useWorkspaceStore((s) => s.ui.ready);
  const highContrast = useWorkspaceStore((s) => s.domain.settings.highContrast);
  const reducedMotionSetting = useWorkspaceStore((s) => s.domain.settings.reducedMotion);
  const [entryComplete, setEntryComplete] = useState(() => localStorage.getItem('arc.setup.complete') === 'true');

  useEffect(() => {
    void useWorkspaceStore.getState().init();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotionSetting));
  }, [highContrast, reducedMotionSetting]);

  if (!entryComplete) {
    return <EntryFlow onComplete={() => setEntryComplete(true)} />;
  }

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
