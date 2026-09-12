import { describe, expect, it } from 'vitest';
import { shouldSeedSampleYearCrosses } from './db';

describe('shouldSeedSampleYearCrosses', () => {
  it('seeds legacy sample calendars that never stored crossedDates', () => {
    expect(
      shouldSeedSampleYearCrosses({
        isSampleWorkspace: true,
        calendar: { startDate: '2026-08-24' },
      }),
    ).toBe(true);
  });

  it('does not re-seed an empty crossedDates map the teacher cleared', () => {
    expect(
      shouldSeedSampleYearCrosses({
        isSampleWorkspace: true,
        calendar: { crossedDates: {} },
      }),
    ).toBe(false);
  });

  it('does not seed a real workspace', () => {
    expect(
      shouldSeedSampleYearCrosses({
        isSampleWorkspace: false,
        calendar: {},
      }),
    ).toBe(false);
  });
});
