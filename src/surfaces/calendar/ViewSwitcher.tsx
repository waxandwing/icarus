import type { CalendarViewMode } from '../../state/store';
import { useWorkspaceStore } from '../../state/store';
import styles from './ViewSwitcher.module.css';

const VIEWS: { id: CalendarViewMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function ViewSwitcher() {
  const view = useWorkspaceStore((s) => s.ui.view);
  const setView = useWorkspaceStore((s) => s.setView);

  return (
    <div className={styles.switcher} role="tablist" aria-label="Calendar view">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          role="tab"
          aria-selected={view === v.id}
          className={styles.tab}
          onClick={() => setView(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
