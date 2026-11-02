import { DEFAULT_PER_PAGE } from '@constants/limits.constants';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';

export function emptyPage<T>(query?: ListQuery): Page<T> {
  return {
    data: [],
    meta: {
      currentPage: query?.page ?? 1,
      perPage: query?.perPage ?? DEFAULT_PER_PAGE,
      total: 0,
      lastPage: 1,
    },
  };
}
