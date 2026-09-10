import {
  addCalendarDays,
  formatFriendly,
  formatShort,
  fromISODate,
  getWeekDays,
} from '../../calendar/dates';
import { ChevronGlyph } from '../../assets/Icons';
import { useWorkspaceStore } from '../../state/store';
import styles from './CalendarNav.module.css';

function monthTitle(date: string): string {
  return fromISODate(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function CalendarNav() {
  const view = useWorkspaceStore((s) => s.ui.view);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const weekStartsOn = useWorkspaceStore((s) => s.domain.settings.weekStartsOn);
  const showWeekends = useWorkspaceStore((s) => s.domain.settings.showWeekends);

  const weekDays = getWeekDays(anchor, weekStartsOn, showWeekends);
  const title = view === 'week' && weekDays.length > 0 ? monthTitle(weekDays[0]) : monthTitle(anchor);
  const subtitle =
    view === 'day'
      ? formatFriendly(anchor)
      : view === 'week' && weekDays.length > 0
        ? `${formatShort(weekDays[0])} – ${formatShort(weekDays[weekDays.length - 1])}`
        : 'Month overview';

  function go(direction: -1 | 1) {
    if (view === 'month') {
      const d = fromISODate(anchor);
      d.setMonth(d.getMonth() + direction);
      setAnchor(d.toISOString().slice(0, 10));
      return;
    }
    setAnchor(addCalendarDays(anchor, direction * (view === 'day' ? 1 : 7)));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.period} aria-live="polite">
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
      <nav className={styles.nav} aria-label="Calendar navigation">
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => go(-1)}
          aria-label={`Previous ${view}`}
        >
          <ChevronGlyph direction="left" />
        </button>
        <button
          type="button"
          className={styles.todayButton}
          onClick={() => setAnchor(new Date().toISOString().slice(0, 10))}
        >
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
    </div>
  );
}
