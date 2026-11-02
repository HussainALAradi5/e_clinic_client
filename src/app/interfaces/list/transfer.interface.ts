import { ListQuery } from '@interfaces/list/list-query.interface';

/** The list on screen as sent to the server: no paging, sort as `-name,code`. */
export type ExportFilter = Omit<Partial<ListQuery>, 'sort'> & { sort?: string };
