import { getFridgeItems } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { useFridgeDrop } from './useFridgeDrop';
import styles from './FridgeTab.module.css';

export function FridgeTab() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);
  const count = useWorkspaceStore((s) => getFridgeItems(s.domain).length);
  const isOpen = openPanel === 'fridge';
  const drop = useFridgeDrop();

  return (
    <button
      type="button"
      id="arc-fridge-tab"
      className={styles.tab}
      data-drop={drop.over}
      onClick={() => toggleFurniture('fridge')}
      onDragOver={drop.onDragOver}
      onDragLeave={drop.onDragLeave}
      onDrop={drop.onDrop}
      aria-expanded={isOpen}
      aria-controls="arc-fridge-panel"
    >
      <span className={styles.label}>Fridge</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
