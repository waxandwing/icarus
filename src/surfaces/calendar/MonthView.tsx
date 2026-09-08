import { useMemo, useRef, useState } from 'react';
import { fromISODate, getMonthGrid } from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import { DayCell } from './DayCell';
import type { ViewProps } from './CalendarShell';
import styles from './MonthView.module.css';

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short' };

export function MonthView({ onEdit, onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const showWeekends = useWorkspaceStore((s) => s.domain.settings.showWeekends);
  const weekStartsOn = useWorkspaceStore((s) => s.domain.settings.weekStartsOn);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);

  const weeks = useMemo(
    () => getMonthGrid(anchor, weekStartsOn, showWeekends),
    [anchor, weekStartsOn, showWeekends],
  );
  const flat = useMemo(() => weeks.flat(), [weeks]);
  const columns = weeks[0]?.length ?? 7;
  const [focusedDate, setFocusedDate] = useState(
    flat.find((c) => c.date === anchor)?.date ?? flat[0]?.date,
  );
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function moveFocus(date: string | undefined) {
    if (!date) return;
    setFocusedDate(date);
    setAnchor(date);
    requestAnimationFrame(() => cellRefs.current[date]?.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = flat.findIndex((c) => c.date === focusedDate);
    if (idx < 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(flat[idx + 1]?.date);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveFocus(flat[idx - 1]?.date);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(flat[idx + columns]?.date);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(flat[idx - columns]?.date);
    }
  }

  return (
    <div>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {weeks[0]?.map((c) => (
          <div key={c.date} className={styles.weekdayHeader}>
            {fromISODate(c.date).toLocaleDateString(undefined, WEEKDAY_FORMAT)}
          </div>
        ))}
      </div>
      <div role="grid" aria-label="Month" onKeyDown={handleKeyDown}>
        {weeks.map((week) => (
          <div key={week[0]?.date} className={styles.week} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {week.map((cell) => (
              <DayCell
                key={cell.date}
                date={cell.date}
                dimmed={!cell.inCurrentMonth}
                compact
                onEdit={onEdit}
                onCreate={onCreate}
                cellRef={(el) => {
                  cellRefs.current[cell.date] = el;
                }}
                onFocusDate={setFocusedDate}
                tabIndex={cell.date === focusedDate ? 0 : -1}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
