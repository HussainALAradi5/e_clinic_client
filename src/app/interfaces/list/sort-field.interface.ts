import { SortDirection } from '@enums/shared/sort-direction.enum';

export interface SortField {
  field: string;
  dir: SortDirection;
}
