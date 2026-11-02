import { FilterOperator } from '@enums/shared/filter-operator.enum';
import { FilterValue } from '@interfaces/list/filter-value.type';

export type FilterOperators = Partial<Record<FilterOperator, FilterValue>>;
