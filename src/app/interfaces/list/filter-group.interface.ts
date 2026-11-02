import { FilterNode } from '@interfaces/list/filter-node.type';

export interface FilterGroup {
  and?: FilterNode[];
  or?: FilterNode[];
  not?: FilterNode[];
}
