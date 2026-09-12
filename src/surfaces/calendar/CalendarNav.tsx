import {
  addCalendarDays,
  addCalendarYears,
  fromISODate,
  toISODate,
  todayISO,
  yearShiftStaysLoaded,
} from '../../calendar/dates';
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
  const calendarStart = useWorkspaceStore((s) => s.domain.calendar.startDate);
  const calendarEnd = useWorkspaceStore((s) => s.domain.calendar.endDate);

  const canPrevYear = view !== 'year' || yearShiftStaysLoaded(anchor, -1, calendarStart, calendarEnd);
  const canNextYear = view !== 'year' || yearShiftStaysLoaded(anchor, 1, calendarStart, calendarEnd);

  function go(direction: -1 | 1) {
    if (view === 'month') {
      const d = fromISODate(anchor);
      d.setMonth(d.getMonth() + direction);
      setAnchor(toISODate(d));
      return;
    }
    if (view === 'year') {
      if (!yearShiftStaysLoaded(anchor, direction, calendarStart, calendarEnd)) return;
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
        disabled={!canPrevYear}
        aria-disabled={!canPrevYear}
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
        disabled={!canNextYear}
        aria-disabled={!canNextYear}
        aria-label={`Next ${view}`}
      >
        <ChevronGlyph direction="right" />
      </button>
    </nav>
  );
}
