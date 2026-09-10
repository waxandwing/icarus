import { useEffect } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { ArcTable } from '../table/ArcTable';
import { useWorkspaceStore } from '../state/store';
import { AppFrame } from './AppFrame';
import styles from './App.module.css';

export function App() {
  const ready = useWorkspaceStore((s) => s.ui.ready);
  const highContrast = useWorkspaceStore((s) => s.domain.settings.highContrast);
  const reducedMotionSetting = useWorkspaceStore((s) => s.domain.settings.reducedMotion);
  const tablePreview = window.location.pathname.startsWith('/table');

  useEffect(() => {
    if (!tablePreview) void useWorkspaceStore.getState().init();
  }, [tablePreview]);

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    document.documentElement.setAttribute('data-reduced-motion', String(reducedMotionSetting));
  }, [highContrast, reducedMotionSetting]);

  if (tablePreview) return <ArcTable />;

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
