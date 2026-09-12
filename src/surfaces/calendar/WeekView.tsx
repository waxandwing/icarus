import { useMemo, useRef, useState } from 'react';
import { dayKind, dayLabel, fromISODate, getWeekDays, isToday, rangeOverlapColumns } from '../../calendar/dates';
import { PlacementChip, UnitBar } from '../../components/PlacementChip';
import { UnitLessonOrg } from '../../components/UnitLessonOrg';
import {
  deliveryForSection,
  getCourseUnitsIntersecting,
  getLoosePlacementsForDate,
  getOrderedSections,
  getSectionLessonsForDate,
  nestLessonsInUnits,
  preferCoveringUnits,
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
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
  const placeUnitOnDate = useWorkspaceStore((s) => s.placeUnitOnDate);
  const createUnitFromMagnet = useWorkspaceStore((s) => s.createUnitFromMagnet);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeLessonOnDate = useWorkspaceStore((s) => s.placeLessonOnDate);
  const organizingUnitId = useWorkspaceStore((s) => s.ui.organizingUnitId);
  const openClassOverview = useWorkspaceStore((s) => s.openClassOverview);

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
        weekStart && weekEnd
          ? preferCoveringUnits(getCourseUnitsIntersecting(domain, section.courseId, weekStart, weekEnd), anchor)
          : [];
      const lessonsByDay = days.flatMap((d) => getSectionLessonsForDate(domain, section.id, d));
      const { groups, loose } = nestLessonsInUnits(units, lessonsByDay);
      ids.push(section.id);
      if (groups.length > 0 && loose.length > 0) ids.push(`${section.id}::loose`);
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

  const dropActions = {
    movePlacement,
    placeNoteOnCalendar,
    placeUnitOnDate,
    createUnitFromMagnet,
    placeMagnetOnCalendar,
    placeLessonOnDate,
  };

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
        data-date={date}
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
          const units =
            weekStart && weekEnd
              ? preferCoveringUnits(getCourseUnitsIntersecting(domain, section.courseId, weekStart, weekEnd), anchor)
              : [];
          const lessonsByDay = days.map((d) => ({
            date: d,
            items: getSectionLessonsForDate(domain, section.id, d),
          }));
          const allLessons = lessonsByDay.flatMap((d) => d.items);
          const { groups, loose } = nestLessonsInUnits(units, allLessons);
          const showLoose = groups.length === 0 || loose.length > 0;
          const coveringOn = (date: string) =>
            groups.find(({ unit }) => date >= unit.startDate && date <= (unit.endDate ?? unit.startDate));

          return (
            <div key={section.id} className={styles.sectionRow} style={{ gridColumn: '1 / -1' }}>
              <div
                className={styles.sectionBlock}
                style={{ gridTemplateColumns: `minmax(112px, 16%) repeat(${days.length}, 1fr)` }}
              >
                <button
                  type="button"
                  className={`arc-token-${course?.colorToken ?? 'charcoal'} ${styles.sectionLabel}`}
                  onClick={() => openClassOverview(section.id)}
                  onDoubleClick={() => openClassOverview(section.id)}
                  aria-label={`Open class overview for ${course?.name ?? 'course'}, ${section.name}`}
                >
                  <h3>{course?.name ?? 'Course'}</h3>
                  <p>{section.name}</p>
                </button>
                <div className={styles.sectionField} style={{ gridColumn: `2 / span ${days.length}` }}>
                  {groups.length > 0 && (
                    <div
                      className={styles.unitNest}
                      style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                    >
                      {days.map((d, col) => {
                        const cover = coveringOn(d);
                        if (!cover) return null;
                        return (
                          <div
                            key={`ink-${cover.unit.placementId}-${d}`}
                            className={`arc-token-${cover.unit.colorToken} ${styles.unitColumnInk}`}
                            style={{ gridColumn: col + 1, gridRow: 1 }}
                            aria-hidden="true"
                          />
                        );
                      })}
                      {groups.map(({ unit }) => {
                        const span = rangeOverlapColumns(days, unit.startDate, unit.endDate ?? unit.startDate);
                        if (!span) return null;
                        const organizing = organizingUnitId === unit.objectId;
                        return (
                          <div
                            key={unit.placementId}
                            className={`arc-token-${unit.colorToken} ${styles.unitBarSlot}`}
                            style={{ gridColumn: `${span.from + 1} / ${span.to + 2}` }}
                          >
                            <div className={styles.unitInk} aria-hidden="true" />
                            <UnitBar
                              view={unit}
                              showTitle
                              continueLeft={unit.startDate < days[0]}
                              continueRight={(unit.endDate ?? unit.startDate) > days[days.length - 1]}
                            />
                            {organizing && <UnitLessonOrg unitId={unit.objectId} />}
                          </div>
                        );
                      })}
                      {days.map((d, col) => {
                        const cover = coveringOn(d);
                        const dayLessons = allLessons.filter(
                          (lesson) => lesson.startDate === d && groups.some((g) => g.unit.objectId === lesson.unitId),
                        );
                        return renderDayCell({
                          row: section.id,
                          date: d,
                          sectionId: section.id,
                          lessons: dayLessons,
                          addLabel: cover
                            ? `Add a lesson in ${cover.unit.title} for ${section.name} on ${d}`
                            : `Add to ${section.name} on ${d}`,
                          showAdd: Boolean(cover),
                          onAdd: () => onCreate(d, { unitId: cover?.unit.objectId, sectionId: section.id }),
                          gridColumn: col + 1,
                          gridRow: 2,
                        });
                      })}
                    </div>
                  )}

                  {showLoose && (
                    <div
                      className={styles.looseNest}
                      style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
                    >
                      {groups.length > 0 && <p className={styles.looseLabel}>Not in a unit</p>}
                      {days.map((d, col) => {
                        const row = groups.length > 0 ? `${section.id}::loose` : section.id;
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
                data-date={date}
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
