import { DateRangePreset } from '@enums/shared/date-range-preset.enum';

/** The list's date filter: which date column, and either a rolling preset or fixed (open-ended) dates. */
export interface DateRangeValue {
  field?: string;
  preset?: DateRangePreset;
  from?: string;
  to?: string;
}

/** A date column offered by the filter. */
export interface DateFieldOption {
  value: string;
  label: string;
}
