import { useMemo, useRef, useState } from 'react';
import { dayKind, dayLabel, fromISODate, getMonthGrid, isToday, rangeOverlapColumns } from '../../calendar/dates';
import { PlacementChip, UnitBar } from '../../components/PlacementChip';
import {
  countLessonsInUnit,
  getPlacementsIntersectingRange,
  nestLessonsInUnits,
} from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyCalendarDrop } from './calendarDrop';
import type { ViewProps } from './CalendarShell';
import styles from './MonthView.module.css';

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short' };

export function MonthView({ onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const showWeekends = domain.settings.showWeekends;
  const weekStartsOn = domain.settings.weekStartsOn;
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);

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
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dropActions = { movePlacement, placeMagnetOnCalendar, placeNoteOnCalendar };

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
      <div className={styles.dowRow} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {weeks[0]?.map((c) => (
          <div key={c.date} className={styles.weekdayHeader}>
            {fromISODate(c.date).toLocaleDateString(undefined, WEEKDAY_FORMAT)}
          </div>
        ))}
      </div>
      <div role="grid" aria-label="Month" onKeyDown={handleKeyDown}>
        {weeks.map((week) => {
          const days = week.map((cell) => cell.date);
          const start = days[0];
          const end = days[days.length - 1];
          const placements = start && end ? getPlacementsIntersectingRange(domain, start, end) : [];
          const units = placements.filter((p) => p.objectType === 'unit');
          const lessons = placements.filter((p) => p.objectType === 'lesson');
          const scraps = placements.filter((p) => p.objectType === 'note' || p.objectType === 'magnet');
          const { groups, loose } = nestLessonsInUnits(units, lessons);

          return (
            <div
              key={week[0]?.date}
              className={styles.week}
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {week.map((cell) => {
                const kind = dayKind(domain.calendar, cell.date);
                const label = dayLabel(domain.calendar, cell.date);
                const today = isToday(cell.date);
                const important = placements.some((p) => p.important && p.startDate === cell.date);
                return (
                  <div
                    key={cell.date}
                    ref={(el) => {
                      cellRefs.current[cell.date] = el;
                    }}
                    className={styles.dateHead}
                    data-kind={kind}
                    data-today={today}
                    data-important={important}
                    data-dimmed={!cell.inCurrentMonth}
                    data-dragover={dragOver === cell.date}
                    role="gridcell"
                    tabIndex={cell.date === focusedDate ? 0 : -1}
                    aria-label={`${cell.date}${today ? ', today' : ''}${label ? `, ${label}` : ''}`}
                    onFocus={() => {
                      setFocusedDate(cell.date);
                      setAnchor(cell.date);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOver(cell.date);
                    }}
                    onDragLeave={() => setDragOver((current) => (current === cell.date ? null : current))}
                    onDrop={(e) => {
                      setDragOver(null);
                      applyCalendarDrop(e, cell.date, dropActions);
                    }}
                  >
                    <span className={styles.dateNum}>{Number(cell.date.slice(-2))}</span>
                    {label && <span className={styles.kindLabel}>{label}</span>}
                    <button
                      type="button"
                      className={styles.addQuiet}
                      aria-label={`Add to ${cell.date}`}
                      onClick={() => onCreate(cell.date)}
                    >
                      +
                    </button>
                  </div>
                );
              })}

              {groups.map(({ unit, lessons: kids }) => {
                const span = rangeOverlapColumns(days, unit.startDate, unit.endDate ?? unit.startDate);
                if (!span) return null;
                return (
                  <div
                    key={unit.placementId}
                    className={styles.spanTrack}
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                  >
                    <div
                      className={styles.spanSlot}
                      style={{ gridColumn: `${span.from + 1} / ${span.to + 2}` }}
                    >
                      <UnitBar
                        view={unit}
                        showTitle
                        density="compact"
                        lessonCount={countLessonsInUnit(domain, unit.objectId)}
                        continueLeft={unit.startDate < days[0]}
                        continueRight={(unit.endDate ?? unit.startDate) > days[days.length - 1]}
                      />
                    </div>
                    {kids.map((lesson) => {
                      const lessonSpan = rangeOverlapColumns(
                        days,
                        lesson.startDate,
                        lesson.endDate ?? lesson.startDate,
                      );
                      if (!lessonSpan) return null;
                      return (
                        <div
                          key={lesson.placementId}
                          className={styles.spanSlot}
                          style={{ gridColumn: `${lessonSpan.from + 1} / ${lessonSpan.to + 2}` }}
                        >
                          <PlacementChip view={lesson} date={lesson.startDate} density="compact" />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {(loose.length > 0 || scraps.length > 0) && (
                <div
                  className={styles.spanTrack}
                  style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                  {[...loose, ...scraps].map((item) => {
                    const span = rangeOverlapColumns(days, item.startDate, item.endDate ?? item.startDate);
                    if (!span) return null;
                    return (
                      <div
                        key={item.placementId}
                        className={styles.spanSlot}
                        style={{ gridColumn: `${span.from + 1} / ${span.to + 2}` }}
                      >
                        <PlacementChip view={item} date={item.startDate} density="compact" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
