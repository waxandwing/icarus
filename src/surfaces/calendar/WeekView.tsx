import { useMemo, useRef, useState } from 'react';
import { addCalendarDays, compareISO, dayKind, dayLabel, fromISODate, getWeekDays, isToday } from '../../calendar/dates';
import { ImportantCircle } from '../../assets/Icons';
import { useWorkspaceStore } from '../../state/store';
import { DayPlanningLane } from './DayPlanningLane';
import type { ViewProps } from './CalendarShell';
import styles from './WeekView.module.css';

const DAY_NAME: Intl.DateTimeFormatOptions = { weekday: 'short' };
const DAY_NUMBER: Intl.DateTimeFormatOptions = { day: 'numeric' };

function overlapColumns(start: string, end: string, days: string[]) {
  const first = days.findIndex((day) => compareISO(day, start) >= 0 && compareISO(day, end) <= 0);
  if (first < 0) return null;
  let last = first;
  for (let i = first + 1; i < days.length; i += 1) {
    if (compareISO(days[i], end) <= 0) last = i;
    else break;
  }
  return { start: first + 2, span: last - first + 1 };
}

export function WeekView({ onCreate }: ViewProps) {
  const domain = useWorkspaceStore((s) => s.domain);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const showWeekends = useWorkspaceStore((s) => s.domain.settings.showWeekends);
  const weekStartsOn = useWorkspaceStore((s) => s.domain.settings.weekStartsOn);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const select = useWorkspaceStore((s) => s.select);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);

  const days = useMemo(
    () => getWeekDays(anchor, weekStartsOn, showWeekends),
    [anchor, weekStartsOn, showWeekends],
  );
  const sections = useMemo(
    () => Object.values(domain.sections).filter((section) => !section.archived),
    [domain.sections],
  );
  const [focusedDate, setFocusedDate] = useState(days.includes(anchor) ? anchor : days[0]);
  const dateRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function moveDateFocus(next: string) {
    if (!days.includes(next)) return;
    setFocusedDate(next);
    setAnchor(next);
    requestAnimationFrame(() => dateRefs.current[next]?.focus());
  }

  function handleDateKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = Math.max(0, days.indexOf(focusedDate));
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveDateFocus(days[Math.min(idx + 1, days.length - 1)] ?? addCalendarDays(focusedDate, 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveDateFocus(days[Math.max(idx - 1, 0)] ?? addCalendarDays(focusedDate, -1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      moveDateFocus(days[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      moveDateFocus(days[days.length - 1]);
    }
  }

  const gridTemplateColumns = `minmax(116px, 0.9fr) repeat(${days.length}, minmax(96px, 1fr))`;

  return (
    <div className={styles.week}>
      <div
        className={styles.dateGrid}
        style={{ gridTemplateColumns }}
        role="row"
        onKeyDown={handleDateKeyDown}
      >
        <div className={styles.cornerLabel}>Planning</div>
        {days.map((date) => {
          const kind = dayKind(domain.calendar, date);
          const label = dayLabel(domain.calendar, date);
          return (
            <button
              key={date}
              ref={(el) => {
                dateRefs.current[date] = el;
              }}
              type="button"
              className={styles.dateHeader}
              data-kind={kind}
              data-today={isToday(date)}
              tabIndex={date === focusedDate ? 0 : -1}
              onFocus={() => setFocusedDate(date)}
              onClick={() => setAnchor(date)}
              onDoubleClick={() => onCreate(date)}
              aria-label={`${fromISODate(date).toLocaleDateString()}${label ? `, ${label}` : ''}`}
            >
              <span className={styles.dayName}>{fromISODate(date).toLocaleDateString(undefined, DAY_NAME)}</span>
              <span className={styles.dayNumber}>{fromISODate(date).toLocaleDateString(undefined, DAY_NUMBER)}</span>
              {label && <span className={styles.dayLabel}>{label}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.planningGrid} style={{ gridTemplateColumns }}>
        <div className={styles.planningPrompt}>day notes</div>
        {days.map((date) => (
          <DayPlanningLane key={date} date={date} />
        ))}
      </div>

      <div className={styles.classRows} role="grid" aria-label="Week by class">
        {sections.length === 0 && (
          <div className={styles.emptyState}>Add a class in Settings to begin planning this week.</div>
        )}

        {sections.map((section) => {
          const course = domain.courses[section.courseId];
          if (!course) return null;
          const unitPlacements = Object.values(domain.placements).filter((placement) => {
            if (placement.objectType !== 'unit') return false;
            const unit = domain.units[placement.objectId];
            if (!unit || unit.courseId !== course.id) return false;
            const end = placement.endDate ?? placement.date;
            return days.some((date) => compareISO(date, placement.date) >= 0 && compareISO(date, end) <= 0);
          });
          const lessonPlacements = Object.values(domain.placements).filter((placement) => {
            if (placement.objectType !== 'lesson' || !days.includes(placement.date)) return false;
            const lesson = domain.lessons[placement.objectId];
            return Boolean(
              lesson &&
                lesson.courseId === course.id &&
                (!lesson.sectionId || lesson.sectionId === section.id),
            );
          });

          return (
            <section
              key={section.id}
              className={styles.classRow}
              style={{ gridTemplateColumns }}
              role="row"
              aria-label={`${course.name}, ${section.name}`}
            >
              <div className={styles.classLabel} role="rowheader">
                <span className={styles.courseName}>{course.name}</span>
                <span className={styles.sectionName}>{section.name}</span>
              </div>

              {days.map((date) => (
                <div
                  key={`${section.id}-${date}`}
                  className={styles.dayColumn}
                  data-kind={dayKind(domain.calendar, date)}
                  aria-hidden="true"
                />
              ))}

              <div className={styles.unitLayer} style={{ gridTemplateColumns }} aria-label="Units">
                <div aria-hidden="true" />
                {unitPlacements.map((placement) => {
                  const unit = domain.units[placement.objectId];
                  const columns = overlapColumns(placement.date, placement.endDate ?? placement.date, days);
                  if (!unit || !columns) return null;
                  const selected = selection?.objectType === 'unit' && selection.objectId === unit.id;
                  return (
                    <button
                      key={placement.id}
                      type="button"
                      className={`arc-token-${unit.colorToken} ${styles.unitSpan}`}
                      style={{ gridColumn: `${columns.start} / span ${columns.span}` }}
                      aria-pressed={selected}
                      aria-label={`Unit: ${unit.title}. Select to edit. Unit movement is available in Month.`}
                      onClick={() => select(selected ? null : { objectType: 'unit', objectId: unit.id })}
                    >
                      <span>{unit.title}</span>
                      {unit.important && <ImportantCircle size={14} />}
                    </button>
                  );
                })}
              </div>

              <div className={styles.lessonLayer} style={{ gridTemplateColumns }} aria-label="Lessons">
                <div aria-hidden="true" />
                {lessonPlacements.map((placement) => {
                  const lesson = domain.lessons[placement.objectId];
                  if (!lesson) return null;
                  const dayIndex = days.indexOf(placement.date);
                  if (dayIndex < 0) return null;
                  const selected = selection?.objectType === 'lesson' && selection.objectId === lesson.id;
                  return (
                    <button
                      key={placement.id}
                      type="button"
                      className={`arc-token-${course.colorToken} ${styles.lesson}`}
                      style={{ gridColumn: dayIndex + 2 }}
                      data-selected={selected}
                      data-crossed={lesson.crossedOut}
                      draggable={!placement.fixed}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/arc-placement-id', placement.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => select(selected ? null : { objectType: 'lesson', objectId: lesson.id })}
                      aria-pressed={selected}
                    >
                      <span>{lesson.title}</span>
                      {lesson.important && <ImportantCircle size={14} />}
                    </button>
                  );
                })}
              </div>

              <div className={styles.dropLayer} style={{ gridTemplateColumns }} aria-hidden="true">
                <div />
                {days.map((date) => (
                  <div
                    key={`${section.id}-drop-${date}`}
                    className={styles.lessonDropTarget}
                    onDragOver={(e) => {
                      if (Array.from(e.dataTransfer.types).includes('text/arc-placement-id')) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const placementId = e.dataTransfer.getData('text/arc-placement-id');
                      const placement = domain.placements[placementId];
                      if (placement?.objectType === 'lesson') movePlacement(placementId, date);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
