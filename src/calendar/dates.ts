import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday as isTodayFns,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { DayKind, ISODate, SchoolCalendar } from '../domain/types';

export const ISO_FORMAT = 'yyyy-MM-dd';

export function toISODate(date: Date): ISODate {
  return format(date, ISO_FORMAT);
}

export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Resolves the effective kind of a date, honoring confirmed calendar exceptions. */
export function dayKind(calendar: SchoolCalendar, iso: ISODate): DayKind {
  const override = calendar.days[iso];
  if (override) return override.kind;
  const date = fromISODate(iso);
  return isWeekend(date) ? 'weekend' : 'instructional';
}

export function dayLabel(calendar: SchoolCalendar, iso: ISODate): string | undefined {
  return calendar.days[iso]?.label;
}

export function isInstructionalDay(calendar: SchoolCalendar, iso: ISODate): boolean {
  return dayKind(calendar, iso) === 'instructional' || dayKind(calendar, iso) === 'early-release';
}

export function isToday(iso: ISODate): boolean {
  return isTodayFns(fromISODate(iso));
}

const weekOptions = (weekStartsOn: 'monday' | 'sunday') =>
  ({ weekStartsOn: weekStartsOn === 'monday' ? (1 as const) : (0 as const) });

export function getWeekDays(
  anchorIso: ISODate,
  weekStartsOn: 'monday' | 'sunday',
  showWeekends: boolean,
): ISODate[] {
  const anchor = fromISODate(anchorIso);
  const opts = weekOptions(weekStartsOn);
  const start = startOfWeek(anchor, opts);
  const end = endOfWeek(anchor, opts);
  const all = eachDayOfInterval({ start, end }).map(toISODate);
  if (showWeekends) return all;
  return all.filter((iso) => !isWeekend(fromISODate(iso)));
}

export interface MonthCell {
  date: ISODate;
  inCurrentMonth: boolean;
}

export function getMonthGrid(
  anchorIso: ISODate,
  weekStartsOn: 'monday' | 'sunday',
  showWeekends: boolean,
): MonthCell[][] {
  const anchor = fromISODate(anchorIso);
  const opts = weekOptions(weekStartsOn);
  const gridStart = startOfWeek(startOfMonth(anchor), opts);
  const gridEnd = endOfWeek(endOfMonth(anchor), opts);
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: MonthCell[][] = [];
  let currentWeek: MonthCell[] = [];
  for (const date of allDays) {
    if (!showWeekends && isWeekend(date)) continue;
    currentWeek.push({ date: toISODate(date), inCurrentMonth: isSameMonth(date, anchor) });
    const dow = weekStartsOn === 'monday' ? (date.getDay() + 6) % 7 : date.getDay();
    const lastDowOfRow = showWeekends ? 6 : 4;
    if (dow === lastDowOfRow) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) weeks.push(currentWeek);
  return weeks;
}

export function addCalendarDays(iso: ISODate, amount: number): ISODate {
  return toISODate(addDays(fromISODate(iso), amount));
}

/**
 * Steps forward or backward across school days only (skipping weekends and
 * confirmed no-school days), the unit disruption shifts are measured in.
 */
export function addSchoolDays(calendar: SchoolCalendar, iso: ISODate, amount: number): ISODate {
  let cursor = iso;
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  while (remaining > 0) {
    cursor = addCalendarDays(cursor, step);
    if (isInstructionalDay(calendar, cursor)) {
      remaining -= 1;
    }
  }
  return cursor;
}

export function formatFriendly(iso: ISODate, pattern = 'EEEE, MMMM d'): string {
  return format(fromISODate(iso), pattern);
}

export function formatShort(iso: ISODate): string {
  return format(fromISODate(iso), 'MMM d');
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
