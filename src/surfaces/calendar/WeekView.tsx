import { useMemo, useRef, useState } from 'react';
import { dayKind, dayLabel, fromISODate, getWeekDays, isToday, rangeOverlapColumns } from '../../calendar/dates';
import { PlacementChip, UnitBar } from '../../components/PlacementChip';
import {
  countLessonsInUnit,
  deliveryForSection,
  getCourseUnitsIntersecting,
  getLoosePlacementsForDate,
  getOrderedSections,
  getSectionLessonsForDate,
  nestLessonsInUnits,
} from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyCalendarDrop } from './calendarDrop';
import type { ViewProps } from './CalendarShell';
import styles from './WeekView.module.css';

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'short' };

export function WeekView({ onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const showWeekends = domain.settings.showWeekends;
  const weekStartsOn = domain.settings.weekStartsOn;
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);

  const days = useMemo(
    () => getWeekDays(anchor, weekStartsOn, showWeekends),
    [anchor, weekStartsOn, showWeekends],
  );
  const sections = getOrderedSections(domain);
  const weekStart = days[0];
  const weekEnd = days[days.length - 1];
  const rowIds = useMemo(() => {
    const ids: string[] = [];
    for (const section of sections) {
      const units =
        weekStart && weekEnd ? getCourseUnitsIntersecting(domain, section.courseId, weekStart, weekEnd) : [];
      const lessonsByDay = days.flatMap((d) => getSectionLessonsForDate(domain, section.id, d));
      const { groups, loose } = nestLessonsInUnits(units, lessonsByDay);
      for (const group of groups) ids.push(`${section.id}::${group.unit.objectId}`);
      if (groups.length === 0 || loose.length > 0) ids.push(`${section.id}::loose`);
    }
    ids.push('notes');
    return ids;
  }, [sections, domain, days, weekStart, weekEnd]);

  const defaultRow = rowIds[0] ?? 'notes';
  const [focused, setFocused] = useState({
    row: defaultRow,
    date: days.includes(anchor) ? anchor : days[0],
  });
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const dropActions = { movePlacement, placeMagnetOnCalendar, placeNoteOnCalendar };

  function focusCell(row: string, date: string) {
    setFocused({ row, date });
    setAnchor(date);
    requestAnimationFrame(() => cellRefs.current[`${row}:${date}`]?.focus());
  }

  function handleGridKeyDown(e: React.KeyboardEvent) {
    const rowIdx = rowIds.indexOf(focused.row);
    const colIdx = days.indexOf(focused.date);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusCell(focused.row, days[Math.min(colIdx + 1, days.length - 1)]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusCell(focused.row, days[Math.max(colIdx - 1, 0)]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(rowIds[Math.min(Math.max(rowIdx, 0) + 1, rowIds.length - 1)], focused.date);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(rowIds[Math.max(rowIdx - 1, 0)], focused.date);
    }
  }

  const notesByDay = days.map((d) => ({ date: d, items: getLoosePlacementsForDate(domain, d) }));

  function renderDayCell({
    row,
    date,
    sectionId,
    lessons,
    addLabel,
    onAdd,
    showAdd,
    gridColumn,
    gridRow,
  }: {
    row: string;
    date: string;
    sectionId?: string;
    lessons: ReturnType<typeof getSectionLessonsForDate>;
    addLabel: string;
    onAdd?: () => void;
    showAdd: boolean;
    gridColumn?: number;
    gridRow?: number;
  }) {
    const kind = dayKind(domain.calendar, date);
    const key = `${row}:${date}`;
    return (
      <div
        key={date}
        ref={(el) => {
          cellRefs.current[key] = el;
        }}
        className={styles.dayCell}
        style={gridColumn ? { gridColumn, gridRow } : undefined}
        data-kind={kind}
        data-today={isToday(date)}
        data-dragover={dragOver === key}
        role="gridcell"
        tabIndex={focused.row === row && focused.date === date ? 0 : -1}
        aria-label={addLabel}
        onFocus={() => {
          setFocused({ row, date });
          setAnchor(date);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setDragOver(key);
        }}
        onDragLeave={() => setDragOver((current) => (current === key ? null : current))}
        onDrop={(e) => {
          setDragOver(null);
          applyCalendarDrop(e, date, dropActions);
        }}
      >
        {lessons.map((lesson) => (
          <PlacementChip
            key={lesson.placementId}
            view={{
              ...lesson,
              deliveryState:
                deliveryForSection(domain, sectionId ?? lesson.sectionId ?? '', lesson.objectId) ?? lesson.deliveryState,
            }}
            date={date}
          />
        ))}
        {showAdd && onAdd && (
          <button type="button" className={styles.addInCell} aria-label={addLabel} onClick={onAdd}>
            +
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.spread}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `minmax(112px, 16%) repeat(${days.length}, 1fr)` }}
        role="grid"
        aria-label="Week"
        onKeyDown={handleGridKeyDown}
      >
        <div className={styles.corner} />
        {days.map((d) => {
          const kind = dayKind(domain.calendar, d);
          const today = isToday(d);
          const label = dayLabel(domain.calendar, d);
          return (
            <div key={d} className={styles.dayHead} data-today={today} data-kind={kind}>
              <span className={styles.weekday}>
                {fromISODate(d).toLocaleDateString(undefined, WEEKDAY_FORMAT)}
              </span>
              <span className={styles.dateNum}>{Number(d.slice(-2))}</span>
              {label && <span className={styles.kindLabel}>{label}</span>}
            </div>
          );
        })}

        {sections.length === 0 && (
          <p className={styles.empty} style={{ gridColumn: '1 / -1' }}>
            Add a course in Settings, then place a lesson on a day.
          </p>
        )}

        {sections.map((section) => {
          const course = domain.courses[section.courseId];
          const units = weekStart && weekEnd ? getCourseUnitsIntersecting(domain, section.courseId, weekStart, weekEnd) : [];
          const lessonsByDay = days.map((d) => ({
            date: d,
            items: getSectionLessonsForDate(domain, section.id, d),
          }));
          const allLessons = lessonsByDay.flatMap((d) => d.items);
          const { groups, loose } = nestLessonsInUnits(units, allLessons);
          const showLoose = groups.length === 0 || loose.length > 0;

          return (
            <div key={section.id} className={styles.sectionRow} style={{ gridColumn: '1 / -1' }}>
              <div
                className={styles.sectionBlock}
                style={{ gridTemplateColumns: `minmax(112px, 16%) repeat(${days.length}, 1fr)` }}
              >
                <div className={`arc-token-${course?.colorToken ?? 'charcoal'} ${styles.sectionLabel}`}>
                  <h3>{course?.name ?? 'Course'}</h3>
                  <p>{section.name}</p>
                </div>
                <div className={styles.sectionField} style={{ gridColumn: `2 / span ${days.length}` }}>
                  {groups.map(({ unit, lessons }) => {
                    const span = rangeOverlapColumns(days, unit.startDate, unit.endDate ?? unit.startDate);
                    if (!span) return null;
                    const row = `${section.id}::${unit.objectId}`;
                    return (
                      <div
                        key={unit.placementId}
                        className={`arc-token-${unit.colorToken} ${styles.unitNest}`}
                        style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                      >
                        <div
                          className={styles.unitBarSlot}
                          style={{ gridColumn: `${span.from + 1} / ${span.to + 2}` }}
                        >
                          <UnitBar
                            view={unit}
                            showTitle
                            lessonCount={countLessonsInUnit(domain, unit.objectId)}
                            continueLeft={unit.startDate < days[0]}
                            continueRight={(unit.endDate ?? unit.startDate) > days[days.length - 1]}
                          />
                        </div>
                        {days.map((d, col) => {
                          const inSpan = col >= span.from && col <= span.to;
                          return renderDayCell({
                            row,
                            date: d,
                            sectionId: section.id,
                            lessons: lessons.filter((lesson) => lesson.startDate === d),
                            addLabel: `Add a lesson in ${unit.title} for ${section.name} on ${d}`,
                            showAdd: inSpan,
                            onAdd: () => onCreate(d, { unitId: unit.objectId, sectionId: section.id }),
                            gridColumn: col + 1,
                            gridRow: 2,
                          });
                        })}
                      </div>
                    );
                  })}

                  {showLoose && (
                    <div
                      className={styles.looseNest}
                      style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                    >
                      {groups.length > 0 && <p className={styles.looseLabel}>Not in a unit</p>}
                      {days.map((d, col) => {
                        const row = `${section.id}::loose`;
                        return renderDayCell({
                          row,
                          date: d,
                          sectionId: section.id,
                          lessons: loose.filter((lesson) => lesson.startDate === d),
                          addLabel: `Add to ${section.name} on ${d}`,
                          showAdd: groups.length === 0,
                          onAdd: () => onCreate(d, { sectionId: section.id }),
                          gridColumn: col + 1,
                          gridRow: groups.length > 0 ? 2 : 1,
                        });
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {weekStart && (
          <>
            <div className={styles.notesLabel}>Notes</div>
            {notesByDay.map(({ date, items }) => (
              <div
                key={date}
                ref={(el) => {
                  cellRefs.current[`notes:${date}`] = el;
                }}
                className={styles.dayCell}
                data-kind={dayKind(domain.calendar, date)}
                data-today={isToday(date)}
                data-dragover={dragOver === `notes:${date}`}
                role="gridcell"
                tabIndex={focused.row === 'notes' && focused.date === date ? 0 : -1}
                aria-label={`Notes, ${date}`}
                onFocus={() => {
                  setFocused({ row: 'notes', date });
                  setAnchor(date);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOver(`notes:${date}`);
                }}
                onDragLeave={() => setDragOver((current) => (current === `notes:${date}` ? null : current))}
                onDrop={(e) => {
                  setDragOver(null);
                  applyCalendarDrop(e, date, dropActions);
                }}
              >
                {items.map((item) => (
                  <PlacementChip key={item.placementId} view={item} date={date} />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
