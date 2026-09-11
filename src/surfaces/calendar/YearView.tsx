import { dayKind, formatMonthTitle, fromISODate, getMonthGrid, monthsInInclusiveRange, schoolQuarter, schoolYearWindow } from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import styles from './YearView.module.css';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Year lens: mini months inside the planner chrome.
 * No left rail, no Caught up, no Quarter product view.
 */
export function YearView() {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const setView = useWorkspaceStore((s) => s.setView);
  const setAnchor = useWorkspaceStore((s) => s.setAnchorDate);

  const window = schoolYearWindow(anchor, domain.calendar.startDate, domain.calendar.endDate);
  const months = monthsInInclusiveRange(window.start, window.end);

  function openMonth(date: string) {
    setAnchor(date);
    setView('month');
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>Open a month to plan on the spread.</p>
      <div className={styles.months}>
        {months.map((monthDate) => {
          const weeks = getMonthGrid(monthDate, 'sunday', true);
          const year = fromISODate(monthDate).getFullYear();
          return (
            <button
              key={monthDate}
              type="button"
              className={styles.monthCard}
              onClick={() => openMonth(monthDate)}
              aria-label={`Open ${formatMonthTitle(monthDate)} ${year}`}
            >
              <header className={styles.monthHead}>
                <span className={styles.monthName}>{formatMonthTitle(monthDate)}</span>
                <span className={styles.monthYear}>{year}</span>
              </header>
              <div className={styles.dowRow}>
                {DOW.map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              {weeks.map((week) => (
                <div key={week[0]?.date} className={styles.weekRow}>
                  {week.map((cell) => {
                    const kind = dayKind(domain.calendar, cell.date);
                    const quarter = schoolQuarter(cell.date);
                    return (
                      <span
                        key={cell.date}
                        className={styles.day}
                        data-in-month={cell.inCurrentMonth}
                        data-kind={kind}
                        data-quarter={quarter}
                      >
                        {cell.inCurrentMonth ? Number(cell.date.slice(-2)) : ''}
                      </span>
                    );
                  })}
                </div>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
