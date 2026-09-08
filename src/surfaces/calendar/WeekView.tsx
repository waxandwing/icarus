import { useMemo, useRef, useState } from 'react';
import { addCalendarDays, fromISODate, getWeekDays } from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import { DayCell } from './DayCell';
import type { ViewProps } from './CalendarShell';
import styles from './WeekView.module.css';

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short' };

export function WeekView({ onEdit, onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const showWeekends = useWorkspaceStore((s) => s.domain.settings.showWeekends);
  const weekStartsOn = useWorkspaceStore((s) => s.domain.settings.weekStartsOn);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);

  const days = useMemo(
    () => getWeekDays(anchor, weekStartsOn, showWeekends),
    [anchor, weekStartsOn, showWeekends],
  );
  const [focusedDate, setFocusedDate] = useState(days.includes(anchor) ? anchor : days[0]);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function moveFocus(next: string) {
    setFocusedDate(next);
    setAnchor(next);
    requestAnimationFrame(() => cellRefs.current[next]?.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = days.indexOf(focusedDate);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(days[Math.min(idx + 1, days.length - 1)] ?? addCalendarDays(focusedDate, 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus(days[Math.max(idx - 1, 0)] ?? addCalendarDays(focusedDate, -1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveFocus(days[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveFocus(days[days.length - 1]);
    }
  }

  return (
    <div>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((d) => (
          <div key={d} className={styles.weekdayHeader}>
            {fromISODate(d).toLocaleDateString(undefined, WEEKDAY_FORMAT)}
          </div>
        ))}
      </div>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)`, marginTop: 4 }}
        role="grid"
        aria-label="Week"
        onKeyDown={handleKeyDown}
      >
        {days.map((d) => (
          <DayCell
            key={d}
            date={d}
            onEdit={onEdit}
            onCreate={onCreate}
            cellRef={(el) => {
              cellRefs.current[d] = el;
            }}
            onFocusDate={setFocusedDate}
            tabIndex={d === focusedDate ? 0 : -1}
          />
        ))}
      </div>
    </div>
  );
}
