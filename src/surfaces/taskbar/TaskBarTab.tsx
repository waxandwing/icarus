import { useWorkspaceStore } from '../../state/store';
import styles from './TaskBarTab.module.css';

export function TaskBarTab() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);
  const count = useWorkspaceStore(
    (s) =>
      s.domain.taskbar.columns.must.length +
      s.domain.taskbar.columns.should.length +
      s.domain.taskbar.columns.could.length,
  );
  const isOpen = openPanel === 'taskbar';

  return (
    <button
      type="button"
      id="arc-taskbar-tab"
      className={styles.tab}
      data-open={isOpen}
      data-placement="bottom"
      onClick={() => toggleFurniture('taskbar')}
      aria-expanded={isOpen}
      aria-controls="arc-taskbar-panel"
    >
      <span className={styles.label}>Tasks</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
