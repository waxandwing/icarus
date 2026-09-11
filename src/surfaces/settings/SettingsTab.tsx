import { useWorkspaceStore } from '../../state/store';
import styles from './SettingsTab.module.css';

export function SettingsTab() {
  const isOpen = useWorkspaceStore((s) => s.ui.openPanels.settings);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);

  return (
    <button
      type="button"
      id="arc-settings-tab"
      className={styles.tab}
      onClick={() => toggleFurniture('settings')}
      aria-expanded={isOpen}
      aria-controls="arc-settings-panel"
      aria-label="Settings"
    >
      <span className={styles.label}>Settings</span>
    </button>
  );
}
