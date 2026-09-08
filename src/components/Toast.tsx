import { useEffect } from 'react';
import { useWorkspaceStore } from '../state/store';
import styles from './Toast.module.css';

export function Toast() {
  const toast = useWorkspaceStore((s) => s.ui.toast);
  const undo = useWorkspaceStore((s) => s.undo);
  const dismissToast = useWorkspaceStore((s) => s.dismissToast);
  const undoLast = useWorkspaceStore((s) => s.undoLast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 5000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <>
      {toast && (
        <div className={styles.toast} data-tone={toast.tone} role="alert">
          {toast.message}
        </div>
      )}
      {undo && (
        <div className={styles.undoPill}>
          <span>{undo.label}</span>
          <button type="button" className={styles.undoButton} onClick={() => undoLast()}>
            Undo
          </button>
        </div>
      )}
    </>
  );
}
