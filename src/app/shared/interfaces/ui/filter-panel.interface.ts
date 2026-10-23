import { Observable } from 'rxjs';
import { FilterGroup, ListQuery } from '@shared/interfaces/list/list-query.interface';
import { ResourceSchema } from '@shared/interfaces/list/resource-schema.interface';

/** What the filter panel edits: the list's query and the fields it offers. */
export interface FilterPanelData {
  schema: ResourceSchema;
  query: ListQuery;
  /** Field names shown in the panel (the toolbar keeps search, dates and badge pickers). */
  fields: string[];
  /** Names of records already picked in relation filters (id → name). */
  names: Record<string, string>;
  /** Number of rows a query would return, for the "Show N results" button. */
  count?: (query: ListQuery) => Observable<number>;
}

export interface FilterPanelResult {
  filter: FilterGroup;
  names: Record<string, string>;
}
