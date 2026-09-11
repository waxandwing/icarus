import { addCalendarDays, addCalendarYears, fromISODate, toISODate, todayISO } from '../../calendar/dates';
import { ChevronGlyph } from '../../assets/Icons';
import { useWorkspaceStore } from '../../state/store';
import type { CalendarViewMode } from '../../state/store';
import styles from './CalendarNav.module.css';

function stepAmount(view: CalendarViewMode): number {
  if (view === 'day') return 1;
  if (view === 'week') return 7;
  return 30;
}

export function CalendarNav() {
  const view = useWorkspaceStore((s) => s.ui.view);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);

  function go(direction: -1 | 1) {
    if (view === 'month') {
      const d = fromISODate(anchor);
      d.setMonth(d.getMonth() + direction);
      setAnchor(toISODate(d));
      return;
    }
    if (view === 'year') {
      setAnchor(addCalendarYears(anchor, direction));
      return;
    }
    setAnchor(addCalendarDays(anchor, direction * stepAmount(view)));
  }

  return (
    <nav className={styles.nav} aria-label="Calendar navigation">
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => go(-1)}
        aria-label={`Previous ${view}`}
      >
        <ChevronGlyph direction="left" />
      </button>
      <button type="button" className={styles.todayButton} onClick={() => setAnchor(todayISO())}>
        Today
      </button>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => go(1)}
        aria-label={`Next ${view}`}
      >
        <ChevronGlyph direction="right" />
      </button>
    </nav>
  );
}
