import { useWorkspaceStore } from '../../state/store';
import styles from './SettingsTab.module.css';

export function SettingsTab() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);
  const isOpen = openPanel === 'settings';

  return (
    <button
      type="button"
      id="arc-settings-tab"
      className={styles.tab}
      onClick={() => toggleFurniture('settings')}
      aria-expanded={isOpen}
      aria-controls="arc-settings-panel"
    >
      <span className={styles.label}>Settings</span>
    </button>
  );
}
