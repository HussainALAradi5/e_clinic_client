import { ListQuery } from '@interfaces/list/list-query.interface';

/** List query as stored in a view: no paging, `sort` in the compact wire form ('-createdAt,name'). */
export type SavedViewQuery = Omit<ListQuery, 'page' | 'cursor' | 'sort'> & { sort?: string };
