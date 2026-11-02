import { FilterCondition } from '@interfaces/list/filter-condition.type';
import { FilterGroup } from '@interfaces/list/filter-group.interface';

/** Mirror of FilterGroup — `{ and: [...] }`, `{ or: [...] }`, `{ not: [...] }`, nesting ≤ 3 levels. */
export type FilterNode = FilterCondition | FilterGroup;
