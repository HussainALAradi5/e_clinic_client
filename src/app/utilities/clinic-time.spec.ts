import { ageInYears, dateRangeFor, daysBetween } from '@utilities/clinic-time';
import { DateRangePreset } from '@enums/shared/date-range-preset.enum';

/** Same cases as the server's EnumsTest (DateRangePreset::range) — Sunday-based weeks. */
describe('dateRangeFor', () => {
  it.each<[DateRangePreset, string, string]>([
    [DateRangePreset.Today, '2026-10-13', '2026-10-13'],
    [DateRangePreset.ThisWeek, '2026-10-11', '2026-10-17'],
    [DateRangePreset.LastWeek, '2026-10-04', '2026-10-10'],
    [DateRangePreset.LastMonth, '2026-09-01', '2026-09-30'],
    [DateRangePreset.Last7Days, '2026-10-07', '2026-10-13'],
    [DateRangePreset.ThisQuarter, '2026-10-01', '2026-12-31'],
  ])('%s', (preset, from, to) => {
    expect(dateRangeFor(preset, '2026-10-13')).toEqual([from, to]);
  });

  it('returns null for custom and computes ages', () => {
    expect(dateRangeFor(DateRangePreset.Custom, '2026-10-13')).toBeNull();
    expect(ageInYears('1990-10-14', '2026-10-13')).toBe(35);
  });
});

describe('daysBetween', () => {
  it('counts whole days across months and backwards, and 0 for empty dates', () => {
    expect(daysBetween('2026-11-01', '2026-11-03')).toBe(2);
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
    expect(daysBetween('2026-11-03', '2026-11-01')).toBe(-2);
    expect(daysBetween('', '2026-11-01')).toBe(0);
  });
});
