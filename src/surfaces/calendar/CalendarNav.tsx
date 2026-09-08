import { addCalendarDays, formatFriendly, formatShort, fromISODate } from '../../calendar/dates';
import { ChevronGlyph } from '../../assets/Icons';
import { useWorkspaceStore } from '../../state/store';
import styles from './CalendarNav.module.css';

function stepAmount(view: 'day' | 'week' | 'month'): number {
  if (view === 'day') return 1;
  if (view === 'week') return 7;
  return 30; // month stepping is re-anchored below, this is just a nudge
}

function label(view: 'day' | 'week' | 'month', anchor: string): string {
  if (view === 'day') return formatFriendly(anchor);
  if (view === 'week') {
    const start = anchor;
    const end = addCalendarDays(anchor, 6);
    return `${formatShort(start)} \u2013 ${formatShort(end)}`;
  }
  return fromISODate(anchor).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function CalendarNav() {
  const view = useWorkspaceStore((s) => s.ui.view);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);

  function go(direction: -1 | 1) {
    if (view === 'month') {
      const d = fromISODate(anchor);
      d.setMonth(d.getMonth() + direction);
      setAnchor(d.toISOString().slice(0, 10));
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
      <span className={styles.label} aria-live="polite">
        {label(view, anchor)}
      </span>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => go(1)}
        aria-label={`Next ${view}`}
      >
        <ChevronGlyph direction="right" />
      </button>
      <button
        type="button"
        className={styles.todayButton}
        onClick={() => setAnchor(new Date().toISOString().slice(0, 10))}
      >
        Today
      </button>
    </nav>
  );
}
