import { DateRangePreset } from '@shared/enums/shared/date-range-preset.enum';

/** Period options offered by GenericFilter. */
export const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: DateRangePreset.Today, label: 'Today' },
  { value: DateRangePreset.Yesterday, label: 'Yesterday' },
  { value: DateRangePreset.ThisWeek, label: 'This week' },
  { value: DateRangePreset.LastWeek, label: 'Last week' },
  { value: DateRangePreset.ThisMonth, label: 'This month' },
  { value: DateRangePreset.LastMonth, label: 'Last month' },
  { value: DateRangePreset.Last7Days, label: 'Last 7 days' },
  { value: DateRangePreset.Last30Days, label: 'Last 30 days' },
  { value: DateRangePreset.ThisQuarter, label: 'This quarter' },
  { value: DateRangePreset.ThisYear, label: 'This year' },
  { value: DateRangePreset.Custom, label: 'Custom range' },
];
