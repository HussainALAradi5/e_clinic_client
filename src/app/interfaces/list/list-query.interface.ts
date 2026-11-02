import { DateRangePreset } from '@enums/shared/date-range-preset.enum';
import { FilterGroup } from '@interfaces/list/filter-group.interface';

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
