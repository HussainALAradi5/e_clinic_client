import { DateRangePreset } from '@enums/shared/date-range-preset.enum';
import { FilterOperator } from '@enums/shared/filter-operator.enum';
import { SortDirection } from '@enums/shared/sort-direction.enum';

/** Mirror of App\Shared\Query\FilterCondition: `{ field: { op: value } }`. */
export type FilterValue = string | number | boolean | null | (string | number)[];
export type FilterOperators = Partial<Record<FilterOperator, FilterValue>>;
export type FilterCondition = Record<string, FilterOperators>;

/** Mirror of FilterGroup — `{ and: [...] }`, `{ or: [...] }`, `{ not: [...] }`, nesting ≤ 3 levels. */
export type FilterNode = FilterCondition | FilterGroup;
export interface FilterGroup {
  and?: FilterNode[];
  or?: FilterNode[];
  not?: FilterNode[];
}

/** Mirror of App\Shared\Query\ListQuery (API conventions §5). camelCase here; the case interceptor sends snake_case. */
export interface ListQuery {
  page?: number;
  perPage?: number;
  cursor?: string;
  /** Compact form: ['-priority', 'createdAt'] — '-' = desc. */
  sort?: string[];
  search?: string;
  dateField?: string;
  dateFrom?: string;
  dateTo?: string;
  dateRange?: DateRangePreset;
  filter?: FilterGroup;
  includeArchived?: boolean;
  onlyDeleted?: boolean;
  include?: string[];
}

export interface SortField {
  field: string;
  dir: SortDirection;
}
