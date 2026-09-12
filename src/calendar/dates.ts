import {
  addDays,
  addYears,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  eachDayOfInterval,
  eachMonthOfInterval,
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

/** Local calendar date — never UTC `toISOString().slice(0, 10)`. */
export function todayISO(): ISODate {
  return toISODate(new Date());
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

export function addCalendarYears(iso: ISODate, amount: number): ISODate {
  return toISODate(addYears(fromISODate(iso), amount));
}

/** Inclusive check against the loaded school-year range. */
export function isoInLoadedCalendar(iso: ISODate, start: ISODate, end: ISODate): boolean {
  return iso >= start && iso <= end;
}

/**
 * Year prev/next may only move the anchor when the shifted date still falls
 * inside the loaded calendar. Do not invent a neighboring school year.
 */
export function yearShiftStaysLoaded(
  anchor: ISODate,
  direction: -1 | 1,
  start: ISODate,
  end: ISODate,
): boolean {
  return isoInLoadedCalendar(addCalendarYears(anchor, direction), start, end);
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

export function formatMonthTitle(iso: ISODate): string {
  return format(fromISODate(iso), 'MMMM');
}

export function formatMonthYear(iso: ISODate): string {
  return format(fromISODate(iso), 'MMMM yyyy');
}

/** Visible week bounds as an uppercase kicker, e.g. `SEP 7 – 11`. */
export function formatWeekKicker(days: ISODate[]): string {
  if (days.length === 0) return '';
  const start = fromISODate(days[0]);
  const end = fromISODate(days[days.length - 1]);
  const left = format(start, 'MMM d').toUpperCase();
  const right =
    start.getMonth() === end.getMonth()
      ? format(end, 'd')
      : format(end, 'MMM d').toUpperCase();
  return `${left} \u2013 ${right}`;
}

/** 1-based week index from the school-year start, using the same week bounds as the Week lens. */
export function schoolWeekNumber(
  anchorIso: ISODate,
  schoolStartIso: ISODate,
  weekStartsOn: 'monday' | 'sunday',
): number {
  const opts = weekOptions(weekStartsOn);
  const start = startOfWeek(fromISODate(schoolStartIso), opts);
  const current = startOfWeek(fromISODate(anchorIso), opts);
  return Math.max(1, differenceInCalendarWeeks(current, start, opts) + 1);
}

export function formatYearSpan(start: ISODate, end: ISODate): string {
  const a = fromISODate(start).getFullYear();
  const b = fromISODate(end).getFullYear();
  return a === b ? String(a) : `${a}\u2013${b}`;
}

export function monthsInInclusiveRange(start: ISODate, end: ISODate): ISODate[] {
  return eachMonthOfInterval({
    start: startOfMonth(fromISODate(start)),
    end: fromISODate(end),
  }).map(toISODate);
}

/**
 * School-year window shaped like `templateStart`–`templateEnd`, shifted so it
 * contains `anchor`. Display-only — does not mutate the calendar.
 * The Year lens must render the loaded `calendar.startDate`–`endDate` range,
 * not a window shifted into an unloaded year.
 */
export function schoolYearWindow(
  anchor: ISODate,
  templateStart: ISODate,
  templateEnd: ISODate,
): { start: ISODate; end: ISODate } {
  const start0 = fromISODate(templateStart);
  const end0 = fromISODate(templateEnd);
  const a = fromISODate(anchor);
  let years = differenceInCalendarYears(a, start0);
  let start = addYears(start0, years);
  let end = addYears(end0, years);
  if (a < start) {
    start = addYears(start, -1);
    end = addYears(end, -1);
  } else if (a > end) {
    start = addYears(start, 1);
    end = addYears(end, 1);
  }
  return { start: toISODate(start), end: toISODate(end) };
}

/**
 * Quiet year-lens coloring. Not a Quarter product view.
 * Aug–Oct 1, Nov–Jan 2, Feb–Mar 3, Apr–Jul 4.
 */
export function schoolQuarter(iso: ISODate): 1 | 2 | 3 | 4 {
  const month = fromISODate(iso).getMonth();
  if (month >= 7 && month <= 9) return 1;
  if (month >= 10 || month === 0) return 2;
  if (month >= 1 && month <= 2) return 3;
  return 4;
}

/** Visible week bounds, matching `getWeekDays` — not anchor+6. */
export function formatWeekRange(days: ISODate[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return formatShort(days[0]);
  return `${formatShort(days[0])} \u2013 ${formatShort(days[days.length - 1])}`;
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Instructional / early-release days strictly after `fromISO` through the
 * school-year end. Used by the Year lens countdown, not a “Caught up” meter.
 */
export function countSchoolDaysLeft(calendar: SchoolCalendar, fromISO: ISODate): number {
  const start =
    compareISO(fromISO, calendar.startDate) < 0 ? calendar.startDate : addCalendarDays(fromISO, 1);
  if (compareISO(start, calendar.endDate) > 0) return 0;
  let n = 0;
  let cursor = start;
  while (compareISO(cursor, calendar.endDate) <= 0) {
    if (isInstructionalDay(calendar, cursor)) n += 1;
    cursor = addCalendarDays(cursor, 1);
  }
  return n;
}

/** Inclusive column span of [start, end] over an ordered day list, or null if no overlap. */
export function rangeOverlapColumns(
  days: ISODate[],
  start: ISODate,
  end: ISODate,
): { from: number; to: number } | null {
  if (days.length === 0) return null;
  const first = days[0];
  const last = days[days.length - 1];
  if (end < first || start > last) return null;
  let from = 0;
  while (from < days.length && days[from] < start) from += 1;
  if (from === days.length) return null;
  let to = days.length - 1;
  while (to >= from && days[to] > end) to -= 1;
  if (to < from) return null;
  return { from, to };
}
