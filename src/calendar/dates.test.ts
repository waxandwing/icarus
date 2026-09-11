import { describe, expect, it } from 'vitest';
import {
  addSchoolDays,
  formatWeekRange,
  getMonthGrid,
  getWeekDays,
  monthsInInclusiveRange,
  rangeOverlapColumns,
  schoolQuarter,
  schoolWeekNumber,
  schoolYearWindow,
} from './dates';
import type { SchoolCalendar } from '../domain/types';

const calendar: SchoolCalendar = {
  startDate: '2026-08-01',
  endDate: '2027-06-15',
  days: {
    '2026-09-14': { date: '2026-09-14', kind: 'no-school', label: 'Staff development', confidence: 'confirmed' },
  },
  showWeekends: false,
  weekStartsOn: 'monday',
  source: 'test',
};

describe('Week view weekend rules (Master Operating Document \u00a73)', () => {
  it('defaults to Monday\u2013Friday with weekends off', () => {
    const days = getWeekDays('2026-09-10', 'monday', false);
    expect(days).toEqual(['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11']);
  });

  it('renders Sunday\u2013Saturday, Sunday first, only when weekends are explicitly enabled', () => {
    const days = getWeekDays('2026-09-10', 'sunday', true);
    expect(days[0]).toBe('2026-09-06'); // Sunday
    expect(days).toHaveLength(7);
    expect(days[days.length - 1]).toBe('2026-09-12'); // Saturday
  });
});

describe('Year Map / Month Monday alignment (Desktop Interaction Blueprint \u00a72)', () => {
  it('never produces a row with a stray trailing Monday when weekends are off', () => {
    const grid = getMonthGrid('2026-09-01', 'monday', false);
    for (const week of grid) {
      // Every instructional row must be a clean run starting Monday with no
      // orphaned/extra Monday appended at the end of the row.
      expect(week.length).toBeLessThanOrEqual(5);
      const mondayIndices = week
        .map((cell, i) => ({ cell, i }))
        .filter(({ cell }) => new Date(cell.date).getDay() === 1)
        .map(({ i }) => i);
      expect(mondayIndices).toEqual([0]);
    }
  });
});

describe('rangeOverlapColumns', () => {
  const week = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'];

  it('spans a unit that starts before the week and ends inside it', () => {
    expect(rangeOverlapColumns(week, '2026-09-01', '2026-09-09')).toEqual({ from: 0, to: 2 });
  });

  it('returns null when the range misses the week', () => {
    expect(rangeOverlapColumns(week, '2026-09-14', '2026-09-18')).toBeNull();
  });
});

describe('formatWeekRange', () => {
  it('labels the visible Mon–Fri week, not anchor plus six calendar days', () => {
    const days = getWeekDays('2026-09-11', 'monday', false);
    expect(formatWeekRange(days)).toBe('Sep 7 \u2013 Sep 11');
  });
});

describe('school year lens helpers', () => {
  it('counts week 3 from an Aug 24 Monday start to Sep 11', () => {
    expect(schoolWeekNumber('2026-09-11', '2026-08-24', 'monday')).toBe(3);
  });

  it('lists months through the school-year end, including June', () => {
    const months = monthsInInclusiveRange('2026-08-24', '2027-06-11');
    expect(months[0]).toBe('2026-08-01');
    expect(months.at(-1)).toBe('2027-06-01');
    expect(months).toHaveLength(11);
  });

  it('keeps the sample school year around September 2026', () => {
    expect(schoolYearWindow('2026-09-11', '2026-08-24', '2027-06-11')).toEqual({
      start: '2026-08-24',
      end: '2027-06-11',
    });
  });

  it('colors year-lens days by school quarter without inventing a Quarter view', () => {
    expect(schoolQuarter('2026-09-11')).toBe(1);
    expect(schoolQuarter('2026-11-02')).toBe(2);
    expect(schoolQuarter('2027-02-10')).toBe(3);
    expect(schoolQuarter('2027-04-15')).toBe(4);
  });
});

describe('School-day arithmetic for disruption shifts', () => {
  it('skips weekends and confirmed no-school days when stepping forward', () => {
    // Friday 2026-09-11 + 1 school day should skip the weekend to Monday 2026-09-14,
    // but that Monday is a confirmed no-school day, so it should continue to Tuesday.
    const next = addSchoolDays(calendar, '2026-09-11', 1);
    expect(next).toBe('2026-09-15');
  });

  it('steps backward across school days symmetrically', () => {
    const prev = addSchoolDays(calendar, '2026-09-15', -1);
    expect(prev).toBe('2026-09-11');
  });
});
