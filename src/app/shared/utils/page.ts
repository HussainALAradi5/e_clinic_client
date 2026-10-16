import { DEFAULT_PER_PAGE } from '@shared/constants/limits.constants';
import { Page } from '@shared/interfaces/api/page.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';

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
