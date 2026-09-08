import { FridgeGlyph } from '../../assets/Icons';
import { getFridgeItems } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './FridgeTab.module.css';

export function FridgeTab() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const toggleFurniture = useWorkspaceStore((s) => s.toggleFurniture);
  const count = useWorkspaceStore((s) => getFridgeItems(s.domain).length);
  const isOpen = openPanel === 'fridge';

  return (
    <button
      type="button"
      id="arc-fridge-tab"
      className={styles.tab}
      onClick={() => toggleFurniture('fridge')}
      aria-expanded={isOpen}
      aria-controls="arc-fridge-panel"
    >
      <FridgeGlyph size={18} />
      <span className={styles.label}>Fridge</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
