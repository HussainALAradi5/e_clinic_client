import { ListSelection } from './list-selection';

describe('ListSelection', () => {
  it('keeps ids across pages and builds an ids bulk request', () => {
    const selection = new ListSelection();
    selection.setPage(['a', 'b'], true);
    selection.toggle('c');
    selection.toggle('a');

    expect(selection.count()).toBe(2);
    expect(selection.toBulkRequest('archive')).toEqual({ action: 'archive', ids: ['b', 'c'] });
  });

  it('switches to "all matching" and excludes unticked rows', () => {
    const selection = new ListSelection();
    selection.selectAllMatching({ page: 3, perPage: 25, search: 'ali' }, 1284);
    selection.toggle('x1');

    expect(selection.count()).toBe(1283);
    expect(selection.isSelected('x1')).toBe(false);
    expect(selection.toBulkRequest('cancel', { reason: 'Closed' })).toEqual({
      reason: 'Closed',
      action: 'cancel',
      filter: { search: 'ali', filter: { and: [{ id: { nin: ['x1'] } }] } },
    });
  });

  it('caps explicit ids at 500', () => {
    const selection = new ListSelection();
    selection.setPage(
      Array.from({ length: 600 }, (_, i) => `id-${i}`),
      true,
    );
    expect(selection.count()).toBe(500);
    expect(selection.limitReached()).toBe(true);
  });
});

describe('ListSelection.pickedIds', () => {
  it('lists ticked ids only in ids mode', () => {
    const selection = new ListSelection();
    selection.toggle('a');
    selection.toggle('b');
    expect(selection.pickedIds()).toEqual(['a', 'b']);

    selection.selectAllMatching({}, 40);
    expect(selection.pickedIds()).toEqual([]);
  });
});
