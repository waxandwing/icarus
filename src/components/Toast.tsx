import { useEffect } from 'react';
import { useWorkspaceStore } from '../state/store';
import styles from './Toast.module.css';

/** Receipt on the paper — not a floating SaaS chip. */
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

  if (!toast && !undo) return null;

  return (
    <div className={styles.receipt}>
      {toast && (
        <span className={styles.alert} data-tone={toast.tone} role="alert">
          {toast.message}
        </span>
      )}
      {undo && (
        <span className={styles.undo}>
          {undo.label}
          <button type="button" className={styles.undoButton} onClick={() => undoLast()}>
            Undo
          </button>
        </span>
      )}
    </div>
  );
}
