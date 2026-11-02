import {
  fromViewQuery,
  queryFromUrl,
  queryToUrl,
  setRootCondition,
  toBulkFilter,
  toHttpParams,
  toViewQuery,
} from '@utilities/list-query';
import { DateRangePreset } from '@enums/shared/date-range-preset.enum';
import { ListQuery } from '@interfaces/list/list-query.interface';

describe('list query', () => {
  const query: ListQuery = {
    page: 2,
    perPage: 25,
    sort: ['-scheduledDate', 'startTime'],
    search: 'ali',
    dateField: 'scheduledDate',
    dateRange: DateRangePreset.ThisMonth,
    filter: {
      and: [
        { status: { in: ['pending', 'confirmed'] } },
        { or: [{ providerId: { eq: 'd1' } }, { roomId: { null: true } }] },
      ],
    },
    includeArchived: true,
  };

  it('serialises to the server grammar (API conventions §5)', () => {
    const params = toHttpParams(query);

    expect(params.get('page')).toBe('2');
    expect(params.get('per_page')).toBe('25');
    expect(params.get('sort')).toBe('-scheduled_date,start_time');
    expect(params.get('date_field')).toBe('scheduled_date');
    expect(params.get('date_range')).toBe('this_month');
    expect(params.get('filter[and][0][status][in]')).toBe('pending,confirmed');
    expect(params.get('filter[and][1][or][0][provider_id][eq]')).toBe('d1');
    expect(params.get('filter[and][1][or][1][room_id][null]')).toBe('true');
    expect(params.get('include_archived')).toBe('true');
    expect(params.has('only_deleted')).toBe(false);
  });

  it('sends fixed days as one open-ended date range', () => {
    expect(toHttpParams({ dateFrom: '2026-10-01', dateTo: '2026-10-22' }).get('date_range')).toBe(
      '2026-10-01..2026-10-22',
    );
    expect(toHttpParams({ dateFrom: '2026-10-01' }).get('date_range')).toBe('2026-10-01..');
    expect(
      toHttpParams({ dateRange: DateRangePreset.Custom, dateTo: '2026-10-22' }).get('date_range'),
    ).toBe('..2026-10-22');
  });

  it('round-trips through the URL', () => {
    expect(queryFromUrl(queryToUrl(query))).toEqual({
      ...query,
      onlyDeleted: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  });

  it('edits root conditions without touching nested groups', () => {
    const next = setRootCondition(query.filter, 'status', { eq: 'pending' });
    expect(next.and).toEqual([
      { or: [{ providerId: { eq: 'd1' } }, { roomId: { null: true } }] },
      { status: { eq: 'pending' } },
    ]);
    expect(setRootCondition(next, 'status', null).and).toHaveLength(1);
  });

  it('builds the bulk "select all matching" filter without paging and with exclusions', () => {
    const bulk = toBulkFilter(query, ['x1']);
    expect(bulk.page).toBeUndefined();
    expect(bulk.sort).toBeUndefined();
    expect(bulk.filter?.and?.at(-1)).toEqual({ id: { nin: ['x1'] } });
  });
});

describe('saved view query', () => {
  it('drops paging and stores sort in the compact wire form', () => {
    const stored = toViewQuery({
      page: 3,
      perPage: 25,
      cursor: 'abc',
      sort: ['-createdAt', 'name'],
      search: 'ali',
    });

    expect(stored).toEqual({ perPage: 25, sort: '-createdAt,name', search: 'ali' });
  });

  it('restores a list query on the first page', () => {
    expect(
      fromViewQuery({ sort: '-createdAt', search: 'x' }, { page: 4, perPage: 15, sort: ['name'] }),
    ).toEqual({
      page: 1,
      perPage: 15,
      sort: ['-createdAt'],
      search: 'x',
    });
    expect(fromViewQuery({}, { sort: ['name'] }).sort).toEqual(['name']);
  });
});
