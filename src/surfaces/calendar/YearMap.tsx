import { useMemo } from 'react';
import { eachDayOfInterval, eachMonthOfInterval, endOfMonth, format, isBefore, startOfMonth } from 'date-fns';
import { dayKind, fromISODate, toISODate } from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import type { ViewProps } from './CalendarShell';
import styles from './YearMap.module.css';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F'];

export function YearMap({ onCreate }: ViewProps) {
  const calendar = useWorkspaceStore((s) => s.domain.calendar);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const setView = useWorkspaceStore((s) => s.setView);

  const months = useMemo(() => {
    const schoolStart = fromISODate(calendar.startDate);
    const schoolEnd = fromISODate(calendar.endDate);
    return eachMonthOfInterval({ start: schoolStart, end: schoolEnd }).map((month) => {
      const start = startOfMonth(month) < schoolStart ? schoolStart : startOfMonth(month);
      const end = endOfMonth(month) > schoolEnd ? schoolEnd : endOfMonth(month);
      const days = eachDayOfInterval({ start, end }).filter((d) => d.getDay() >= 1 && d.getDay() <= 5);
      return { month, days };
    });
  }, [calendar.startDate, calendar.endDate]);

  const today = new Date();

  function openDay(date: string) {
    setAnchor(date);
    setView('day');
  }

  return (
    <section className={styles.year} aria-label="School year map">
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>School year</p>
          <h2>{format(fromISODate(calendar.startDate), 'yyyy')}–{format(fromISODate(calendar.endDate), 'yy')}</h2>
        </div>
        <p>Orientation, pacing, and the shape of the year. Weekends stay out of the way.</p>
      </div>

      <div className={styles.months}>
        {months.map(({ month, days }) => {
          const firstDow = (days[0]?.getDay() ?? 1) - 1;
          return (
            <article className={styles.month} key={month.toISOString()}>
              <h3>{format(month, 'MMMM')}</h3>
              <div className={styles.weekdays} aria-hidden="true">
                {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
              </div>
              <div className={styles.days}>
                {Array.from({ length: firstDow }).map((_, i) => <span key={`blank-${i}`} />)}
                {days.map((day) => {
                  const iso = toISODate(day);
                  const kind = dayKind(calendar, iso);
                  const passed = isBefore(day, today);
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={styles.day}
                      data-kind={kind}
                      data-passed={passed}
                      data-anchor={iso === anchor}
                      aria-label={`${format(day, 'MMMM d')}, ${kind}`}
                      onClick={() => openDay(iso)}
                      onDoubleClick={() => onCreate(iso)}
                    >
                      <span>{day.getDate()}</span>
                      {passed && <i aria-hidden="true">×</i>}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
