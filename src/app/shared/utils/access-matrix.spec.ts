import { matrixDiff, rowPermissions, setAction, setAll, setFlag } from './access-matrix';
import { AccessFlag } from '@shared/enums/identity/access-flag.enum';
import { AccessRow } from '@shared/interfaces/identity/role.interface';

const row = (overrides: Partial<AccessRow> = {}): AccessRow => ({
  resource: 'invoices',
  module: 'payments',
  readOwn: false,
  readAll: false,
  create: false,
  write: false,
  delete: false,
  actions: [],
  availableActions: ['cancel', 'issue'],
  ...overrides,
});

describe('access matrix', () => {
  it('applies the server normalisation rules', () => {
    expect(setFlag(row(), AccessFlag.ReadAll, true)).toMatchObject({
      readAll: true,
      readOwn: true,
    });
    expect(setFlag(row(), AccessFlag.Write, true)).toMatchObject({ write: true, readOwn: true });
    expect(
      setFlag(row({ readOwn: true, readAll: true, write: true }), AccessFlag.ReadOwn, false),
    ).toMatchObject({
      readOwn: false,
      readAll: false,
      write: false,
    });
    expect(
      setFlag(row({ readOwn: true, readAll: true, write: true }), AccessFlag.ReadAll, false),
    ).toMatchObject({
      readOwn: true,
      write: true,
    });
  });

  it('lists the granted permissions and diffs only changed rows', () => {
    const before = [
      row({ readOwn: true, readAll: true }),
      row({ resource: 'payments', availableActions: [] }),
    ];
    const after = [setAction(setFlag(before[0], AccessFlag.Write, true), 'issue', true), before[1]];

    expect(rowPermissions(after[0])).toEqual([
      'invoices.read_own',
      'invoices.read_all',
      'invoices.write',
      'invoices.issue',
    ]);
    expect(matrixDiff(before, after)).toEqual({
      added: ['invoices.write', 'invoices.issue'],
      removed: [],
      changedRows: [after[0]],
    });
    expect(setAll(row(), true).actions).toEqual(['cancel', 'issue']);
  });
});
