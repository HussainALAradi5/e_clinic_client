import { DateRangeValue } from '@interfaces/list/date-range-filter.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';

/** The list-query part of a date filter on [field]: nothing when no dates are chosen (the server filters). */
export function dateRangeQuery(field: string, value: DateRangeValue): Partial<ListQuery> {
  if (!value.from && !value.to && !value.preset) {
    return {};
  }
  return { dateField: field, dateFrom: value.from, dateTo: value.to, dateRange: value.preset };
}
