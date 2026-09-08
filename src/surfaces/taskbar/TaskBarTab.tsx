import { TaskGlyph } from '../../assets/Icons';
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
      onClick={() => toggleFurniture('taskbar')}
      aria-expanded={isOpen}
      aria-controls="arc-taskbar-panel"
    >
      <TaskGlyph size={16} />
      Task Bar
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
