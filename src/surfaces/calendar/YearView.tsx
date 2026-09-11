import {
  countSchoolDaysLeft,
  dayKind,
  formatFriendly,
  formatMonthTitle,
  fromISODate,
  getMonthGrid,
  isInstructionalDay,
  monthsInInclusiveRange,
  schoolQuarter,
  schoolYearWindow,
  todayISO,
} from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import { yearXSrc } from './yearMarks';
import styles from './YearView.module.css';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function countdownCopy(remaining: number, lastDay: string, today: string) {
  const lastLabel = formatFriendly(lastDay, 'MMMM d');
  if (today > lastDay) return 'School year ended.';
  if (remaining === 0) return 'Last day of school.';
  if (remaining === 1) return `1 school day until ${lastLabel}`;
  return `${remaining} school days until ${lastLabel}`;
}

/**
 * Year lens: mini months inside the planner chrome.
 * No left rail, no Caught up, no Quarter product view.
 */
export function YearView() {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const setView = useWorkspaceStore((s) => s.setView);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);
  const toggleYearCross = useWorkspaceStore((s) => s.toggleYearCross);

  const window = schoolYearWindow(anchor, domain.calendar.startDate, domain.calendar.endDate);
  const months = monthsInInclusiveRange(window.start, window.end);
  const today = todayISO();
  const remaining = countSchoolDaysLeft(domain.calendar, today);
  const crossed = domain.calendar.crossedDates ?? {};

  function openMonth(date: string) {
    setAnchor(date);
    setView('month');
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.countdown}>{countdownCopy(remaining, domain.calendar.endDate, today)}</p>
      <div className={styles.months}>
        {months.map((monthDate) => {
          const weeks = getMonthGrid(monthDate, 'sunday', true);
          const year = fromISODate(monthDate).getFullYear();
          return (
            <article key={monthDate} className={styles.monthCard}>
              <button
                type="button"
                className={styles.monthHead}
                onClick={() => openMonth(monthDate)}
                aria-label={`Open ${formatMonthTitle(monthDate)} ${year}`}
              >
                <span className={styles.monthName}>{formatMonthTitle(monthDate)}</span>
                <span className={styles.monthYear}>{year}</span>
              </button>
              <div className={styles.dowRow} aria-hidden="true">
                {DOW.map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              {weeks.map((week) => (
                <div key={week[0]?.date} className={styles.weekRow}>
                  {week.map((cell) => {
                    const kind = dayKind(domain.calendar, cell.date);
                    const quarter = schoolQuarter(cell.date);
                    const inYear =
                      cell.date >= domain.calendar.startDate && cell.date <= domain.calendar.endDate;
                    const canCross =
                      cell.inCurrentMonth && inYear && isInstructionalDay(domain.calendar, cell.date);
                    const isCrossed = Boolean(crossed[cell.date]);
                    const dayNum = cell.inCurrentMonth ? Number(cell.date.slice(-2)) : '';
                    if (!canCross) {
                      return (
                        <span
                          key={cell.date}
                          className={styles.day}
                          data-in-month={cell.inCurrentMonth}
                          data-kind={kind}
                          data-quarter={quarter}
                        >
                          {dayNum}
                        </span>
                      );
                    }
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        className={styles.day}
                        data-in-month="true"
                        data-kind={kind}
                        data-quarter={quarter}
                        data-crossed={isCrossed}
                        aria-pressed={isCrossed}
                        aria-label={
                          isCrossed
                            ? `${formatFriendly(cell.date, 'MMMM d')}, crossed out`
                            : `Cross out ${formatFriendly(cell.date, 'MMMM d')}`
                        }
                        onClick={() => toggleYearCross(cell.date)}
                      >
                        {dayNum}
                        {isCrossed && (
                          <img
                            src={yearXSrc(cell.date)}
                            alt=""
                            className={styles.xMark}
                            draggable={false}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}
