import { FilterFieldType } from '@enums/list/filter-field-type.enum';
import { FilterOperator } from '@enums/shared/filter-operator.enum';
import { EnumOption } from '@interfaces/common/enum-option.interface';

/** Mirror of FilterField in the resource schema. */
export interface FilterDef {
  field: string;
  type: FilterFieldType;
  operators: FilterOperator[];
  enum?: string;
  resource?: string;
  /** Named values of a Choice filter (`BH` → Bahraini). */
  options?: EnumOption[];
  /** What the filter is called on screen (set by the server). */
  label?: string;
  /** Accepted in links (e.g. the orders of one visit) but not offered in the filter panel. */
  hidden?: boolean;
}
