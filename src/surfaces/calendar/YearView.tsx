import type { MouseEvent } from 'react';
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
import type { TeacherOutReason } from '../../domain/types';
import { useWorkspaceStore } from '../../state/store';
import { yearOutRotate, yearXLook } from './yearMarks';
import styles from './YearView.module.css';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function countdownCopy(remaining: number, lastDay: string, today: string) {
  const lastLabel = formatFriendly(lastDay, 'MMMM d');
  if (today > lastDay) return 'School year ended.';
  if (remaining === 0) return 'Last day of school.';
  if (remaining === 1) return `1 school day until ${lastLabel}`;
  return `${remaining} school days until ${lastLabel}`;
}

function dayAria(date: string, crossed: boolean, out: TeacherOutReason | undefined) {
  const label = formatFriendly(date, 'MMMM d');
  if (out === 'sick') return `${label}, you were out sick`;
  if (out === 'sub') return `${label}, a sub covered`;
  if (crossed) return `${label}, crossed out`;
  return `Cross out ${label}`;
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
  const markTeacherOut = useWorkspaceStore((s) => s.markTeacherOut);

  const window = schoolYearWindow(anchor, domain.calendar.startDate, domain.calendar.endDate);
  const months = monthsInInclusiveRange(window.start, window.end);
  const today = todayISO();
  const remaining = countSchoolDaysLeft(domain.calendar, today);
  const crossed = domain.calendar.crossedDates ?? {};
  const outs = domain.calendar.teacherOutDates ?? {};

  function openMonth(date: string) {
    setAnchor(date);
    setView('month');
  }

  function onDayClick(e: MouseEvent<HTMLButtonElement>, date: string) {
    if (e.shiftKey) {
      markTeacherOut(date, 'sick');
      return;
    }
    if (e.altKey) {
      markTeacherOut(date, 'sub');
      return;
    }
    toggleYearCross(date);
  }

  function onDayContext(e: MouseEvent<HTMLButtonElement>, date: string) {
    e.preventDefault();
    const current = outs[date];
    if (!current) markTeacherOut(date, 'sick');
    else if (current === 'sick') markTeacherOut(date, 'sub');
    else markTeacherOut(date, null);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.countdown}>{countdownCopy(remaining, domain.calendar.endDate, today)}</p>
      <p className={styles.legend}>
        Click to cross out a day you taught. Shift-click if you were out sick. Option-click if a sub
        covered. Right-click cycles sick and sub.
      </p>
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
                    const canMark =
                      cell.inCurrentMonth && inYear && isInstructionalDay(domain.calendar, cell.date);
                    const isCrossed = Boolean(crossed[cell.date]);
                    const out = outs[cell.date];
                    const dayNum = cell.inCurrentMonth ? Number(cell.date.slice(-2)) : '';
                    if (!canMark) {
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
                    const look = isCrossed ? yearXLook(cell.date) : null;
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        className={styles.day}
                        data-in-month="true"
                        data-kind={kind}
                        data-quarter={quarter}
                        data-crossed={isCrossed}
                        data-out={out ?? ''}
                        aria-pressed={isCrossed || Boolean(out)}
                        aria-label={dayAria(cell.date, isCrossed, out)}
                        onClick={(e) => onDayClick(e, cell.date)}
                        onContextMenu={(e) => onDayContext(e, cell.date)}
                      >
                        {dayNum}
                        {look && (
                          <img
                            src={look.src}
                            alt=""
                            className={styles.xMark}
                            data-ink={look.ink}
                            draggable={false}
                            style={{ transform: `rotate(${look.rotate}deg) scale(${look.scale})` }}
                          />
                        )}
                        {out && (
                          <span
                            className={styles.outMark}
                            data-kind={out}
                            style={{ transform: `rotate(${yearOutRotate(cell.date)}deg)` }}
                          >
                            {out === 'sick' ? 'out' : 'sub'}
                          </span>
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
