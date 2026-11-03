import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, Observable, pipe, switchMap, tap } from 'rxjs';
import { ApiError } from '@interfaces/api/api-error.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ResourceListState } from '@interfaces/list/resource-list-state.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ResourceSchemaService } from '@services/data/resource-schema.service';
import { ListSelection } from '@utilities/list-selection';
import { emptyPage } from '@utilities/page';

/**
 * Component-scoped store behind ResourceListPage (mirror of HasListQuery + BaseEntityService::list):
 * schema, query, current page, loading / error and the multi-select state.
 */
export const ResourceListStore = signalStore(
  withState<ResourceListState>({
    endpoint: '',
    params: {},
    schema: null,
    query: {},
    page: emptyPage<{ id: string }>(),
    loading: false,
    error: null,
  }),
  withComputed(({ page }) => ({
    rows: computed(() => page().data),
    total: computed(() => page().meta.total ?? page().data.length),
    isEmpty: computed(() => page().data.length === 0),
  })),
  withMethods((store, api = inject(ApiClient), schemas = inject(ResourceSchemaService)) => {
    const selection = new ListSelection();

    const fetch = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.list<{ id: string }>(store.endpoint(), store.query(), store.params()).pipe(
            tap((page) => patchState(store, { page, loading: false })),
            catchError((error: ApiError) => {
              patchState(store, { loading: false, error });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      selection: () => selection,
      init(
        resource: string,
        endpoint: string,
        query: ListQuery,
        params: Record<string, string> = {},
      ): void {
        patchState(store, { endpoint, query, params });
        schemas.schema(resource).subscribe({
          next: (schema) => {
            const sort = store.query().sort ?? [schema.defaultSort];
            patchState(store, { schema, query: { ...store.query(), sort } });
            fetch();
          },
          error: (error: ApiError) => patchState(store, { error }),
        });
      },
      setQuery(query: ListQuery): void {
        const filtersChanged =
          JSON.stringify({ ...query, page: 0, perPage: 0, sort: 0 }) !==
          JSON.stringify({ ...store.query(), page: 0, perPage: 0, sort: 0 });
        if (filtersChanged) {
          selection.clear(); // the selection no longer matches what is on screen
        }
        patchState(store, { query });
        fetch();
      },
      reload(): void {
        fetch();
      },
      /** New fixed endpoint parameters (e.g. a quick filter outside the query): back to the first page. */
      setParams(params: Record<string, string>): void {
        selection.clear();
        patchState(store, { params, query: { ...store.query(), page: 1 } });
        fetch();
      },
    };
  }),
);
