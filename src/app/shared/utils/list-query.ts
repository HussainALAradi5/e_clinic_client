import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { toSnake } from './case';
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from '@shared/constants/limits.constants';
import { DateRangePreset } from '@shared/enums/shared/date-range-preset.enum';
import {
  FilterGroup,
  FilterNode,
  FilterValue,
  ListQuery,
} from '@shared/interfaces/list/list-query.interface';
import { ExportFilter } from '@shared/interfaces/list/transfer.interface';
import { SavedViewQuery } from '@shared/interfaces/view/saved-view.interface';

const LOGICAL = new Set(['and', 'or', 'not']);

export function defaultQuery(overrides: ListQuery = {}): ListQuery {
  return { page: 1, perPage: DEFAULT_PER_PAGE, ...overrides };
}

function wireValue(value: FilterValue): string {
  return Array.isArray(value) ? value.join(',') : String(value);
}

/** Flattens a filter tree into `filter[field][op]=v`, `filter[or][0][field][op]=v`, `filter[not][field][op]=v`. */
function appendFilter(params: HttpParams, node: FilterNode, prefix: string): HttpParams {
  for (const [key, value] of Object.entries(node)) {
    if (LOGICAL.has(key)) {
      const children = (value ?? []) as FilterNode[];
      if (key === 'not') {
        children.forEach((child) => (params = appendFilter(params, child, `${prefix}[not]`)));
      } else {
        children.forEach(
          (child, i) => (params = appendFilter(params, child, `${prefix}[${key}][${i}]`)),
        );
      }
      continue;
    }
    for (const [op, operand] of Object.entries(value as Record<string, FilterValue>)) {
      params = params.set(`${prefix}[${toSnake(key)}][${op}]`, wireValue(operand));
    }
  }
  return params;
}

/** ListQuery → the server's query-string grammar (API conventions §5), snake_case. */
export function toHttpParams(query: ListQuery): HttpParams {
  let params = new HttpParams();
  const set = (key: string, value: string | number | boolean | undefined | null): void => {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      params = params.set(key, String(value));
    }
  };

  set('page', query.cursor ? undefined : query.page);
  set('per_page', query.perPage ? Math.min(query.perPage, MAX_PER_PAGE) : undefined);
  set('cursor', query.cursor);
  set(
    'sort',
    query.sort?.map((s) => (s.startsWith('-') ? '-' + toSnake(s.slice(1)) : toSnake(s))).join(','),
  );
  set('search', query.search?.trim());
  set('date_field', query.dateField ? toSnake(query.dateField) : undefined);
  set('date_from', query.dateFrom);
  set('date_to', query.dateTo);
  set('date_range', query.dateRange);
  set('include_archived', query.includeArchived);
  set('only_deleted', query.onlyDeleted);
  set('include', query.include?.join(','));

  return query.filter ? appendFilter(params, query.filter, 'filter') : params;
}

/** ListQuery → router query params (bookmarkable list state; filter tree as JSON). */
export function queryToUrl(query: ListQuery, defaults: ListQuery = defaultQuery()): Params {
  const differs = <K extends keyof ListQuery>(key: K): boolean =>
    JSON.stringify(query[key]) !== JSON.stringify(defaults[key]);
  return {
    page: query.page && query.page !== 1 ? query.page : null,
    perPage: differs('perPage') ? query.perPage : null,
    sort: query.sort?.length && differs('sort') ? query.sort.join(',') : null,
    search: query.search || null,
    dateField: query.dateField ?? null,
    dateFrom: query.dateFrom ?? null,
    dateTo: query.dateTo ?? null,
    dateRange: query.dateRange ?? null,
    filter: query.filter && hasConditions(query.filter) ? JSON.stringify(query.filter) : null,
    archived: query.includeArchived ? 'true' : null,
    deleted: query.onlyDeleted ? 'true' : null,
  };
}

/** Router query params → ListQuery (inverse of queryToUrl). Invalid values fall back to the defaults. */
export function queryFromUrl(params: Params, defaults: ListQuery = defaultQuery()): ListQuery {
  const int = (v: unknown): number | undefined =>
    Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : undefined;
  const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v !== '' ? v : undefined;
  let filter: FilterGroup | undefined;
  try {
    filter = str(params['filter'])
      ? (JSON.parse(params['filter']) as FilterGroup)
      : defaults.filter;
  } catch {
    filter = defaults.filter;
  }

  return {
    ...defaults,
    page: int(params['page']) ?? 1,
    perPage: Math.min(int(params['perPage']) ?? defaults.perPage ?? DEFAULT_PER_PAGE, MAX_PER_PAGE),
    sort: str(params['sort'])?.split(',') ?? defaults.sort,
    search: str(params['search']) ?? defaults.search,
    dateField: str(params['dateField']) ?? defaults.dateField,
    dateFrom: str(params['dateFrom']) ?? defaults.dateFrom,
    dateTo: str(params['dateTo']) ?? defaults.dateTo,
    dateRange: (str(params['dateRange']) as DateRangePreset | undefined) ?? defaults.dateRange,
    filter,
    includeArchived: params['archived'] === 'true' || undefined,
    onlyDeleted: params['deleted'] === 'true' || undefined,
  };
}

export function hasConditions(filter: FilterGroup | FilterNode | undefined): boolean {
  return (
    !!filter &&
    Object.values(filter).some((v) =>
      Array.isArray(v) ? v.some((c) => hasConditions(c)) : v !== undefined,
    )
  );
}

/** Root-level AND conditions as `field → { op: value }` (what GenericFilter edits). */
export function rootConditions(
  filter: FilterGroup | undefined,
): Record<string, Record<string, FilterValue>> {
  const result: Record<string, Record<string, FilterValue>> = {};
  for (const node of filter?.and ?? []) {
    for (const [field, ops] of Object.entries(node)) {
      if (!LOGICAL.has(field)) {
        result[field] = { ...(result[field] ?? {}), ...(ops as Record<string, FilterValue>) };
      }
    }
  }
  return result;
}

/** Replaces one field's root-level conditions (empty ops removes the field). Keeps nested groups untouched. */
export function setRootCondition(
  filter: FilterGroup | undefined,
  field: string,
  ops: Record<string, FilterValue> | null,
): FilterGroup {
  const others = (filter?.and ?? []).filter((node) => !(field in node));
  const next = ops && Object.keys(ops).length ? [...others, { [field]: ops }] : others;
  return { ...filter, and: next };
}

/** For bulk "select all matching": the list query without paging, optionally excluding unticked ids. */
export function toBulkFilter(query: ListQuery, excludedIds: readonly string[] = []): ListQuery {
  const {
    page: _page,
    perPage: _perPage,
    cursor: _cursor,
    sort: _sort,
    include: _include,
    ...rest
  } = query;
  if (excludedIds.length === 0) {
    return rest;
  }
  return {
    ...rest,
    filter: {
      ...rest.filter,
      and: [...(rest.filter?.and ?? []), { id: { nin: [...excludedIds] } }],
    },
  };
}

/** ListQuery → the form stored in a saved view (no paging; compact sort string, validated by the server). */
export function toViewQuery(query: ListQuery): SavedViewQuery {
  const { page: _page, cursor: _cursor, sort, ...rest } = query;
  return sort?.length ? { ...rest, sort: sort.join(',') } : rest;
}

/** Saved view query → ListQuery (first page). */
export function fromViewQuery(
  query: SavedViewQuery,
  defaults: ListQuery = defaultQuery(),
): ListQuery {
  const { sort, ...rest } = query;
  return { ...defaults, ...rest, page: 1, sort: sort ? sort.split(',') : defaults.sort };
}

/** Body `filter` of an export: the list on screen (no paging), keeping its sort, minus unticked rows. */
export function toExportFilter(
  query: ListQuery,
  excludedIds: readonly string[] = [],
): ExportFilter {
  const sort = query.sort
    ?.map((s) => (s.startsWith('-') ? '-' + toSnake(s.slice(1)) : toSnake(s)))
    .join(',');
  const { sort: _paged, ...filter } = toBulkFilter(query, excludedIds);
  return sort ? { ...filter, sort } : filter;
}
