import { useWorkspaceStore } from '../../state/store';
import styles from './TaskBarTab.module.css';

export function TaskBarTab() {
  const isOpen = useWorkspaceStore((s) => s.ui.openPanels.taskbar);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);
  const count = useWorkspaceStore(
    (s) =>
      s.domain.taskbar.columns.must.length +
      s.domain.taskbar.columns.should.length +
      s.domain.taskbar.columns.could.length,
  );

  return (
    <button
      type="button"
      id="arc-taskbar-tab"
      className={styles.tab}
      onClick={() => toggleFurniture('taskbar')}
      aria-expanded={isOpen}
      aria-controls="arc-taskbar-panel"
      aria-label="Task Bar"
    >
      <span className={styles.label}>Task Bar</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
