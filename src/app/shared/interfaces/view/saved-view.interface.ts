import { ListQuery } from '@shared/interfaces/list/list-query.interface';

/** List query as stored in a view: no paging, `sort` in the compact wire form ('-createdAt,name'). */
export type SavedViewQuery = Omit<ListQuery, 'page' | 'cursor' | 'sort'> & { sort?: string };

/** Mirror of SavedViewResource — a saved list layout. */
export interface SavedView {
  id: string;
  resource: string;
  name: string;
  query: SavedViewQuery;
  columns: string[];
  isShared: boolean;
  isDefault: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /views (PUT accepts the same fields except resource / isDefault). */
export interface SavedViewPayload {
  resource?: string;
  name?: string;
  query?: SavedViewQuery;
  columns?: string[];
  isShared?: boolean;
  isDefault?: boolean;
}
