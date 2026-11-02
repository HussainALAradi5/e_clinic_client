import { AccessFlag } from '@enums/identity/access-flag.enum';
import { MatrixDiff } from '@interfaces/identity/matrix-diff.interface';
import { AccessRow } from '@interfaces/identity/access-row.interface';

/** camelCase row key of each flag. */
export const FLAG_KEYS: Record<AccessFlag, 'readOwn' | 'readAll' | 'create' | 'write' | 'delete'> =
  {
    [AccessFlag.ReadOwn]: 'readOwn',
    [AccessFlag.ReadAll]: 'readAll',
    [AccessFlag.Create]: 'create',
    [AccessFlag.Write]: 'write',
    [AccessFlag.Delete]: 'delete',
  };

/**
 * Same rules as the server (RoleService::updateAccessMatrix): `read_all` implies `read_own`;
 * create / write / delete need a read flag, so they turn it on, and removing every read flag removes them.
 */
export function setFlag(row: AccessRow, flag: AccessFlag, value: boolean): AccessRow {
  const next: AccessRow = { ...row, [FLAG_KEYS[flag]]: value };
  if (flag === AccessFlag.ReadAll && value) {
    next.readOwn = true;
  }
  if (flag === AccessFlag.ReadOwn && !value) {
    next.readAll = false;
  }
  if (
    value &&
    [AccessFlag.Create, AccessFlag.Write, AccessFlag.Delete].includes(flag) &&
    !next.readOwn
  ) {
    next.readOwn = true;
  }
  if (!next.readOwn && !next.readAll) {
    next.create = next.write = next.delete = false;
  }
  return next;
}

export function setAction(row: AccessRow, action: string, value: boolean): AccessRow {
  const actions = value
    ? [...new Set([...row.actions, action])]
    : row.actions.filter((a) => a !== action);
  return { ...row, actions: actions.sort() };
}

/** Every flag and special action on (true) or off. */
export function setAll(row: AccessRow, value: boolean): AccessRow {
  return {
    ...row,
    readOwn: value,
    readAll: value,
    create: value,
    write: value,
    delete: value,
    actions: value ? [...row.availableActions].sort() : [],
  };
}

/** Permission names a row grants (`<resource>.<flag|action>`), mirror of AccessRowData::permissions(). */
export function rowPermissions(row: AccessRow): string[] {
  const flags = Object.values(AccessFlag).filter((flag) => row[FLAG_KEYS[flag]]);
  return [...flags, ...row.actions].map((ability) => `${row.resource}.${ability}`);
}

/** Added / removed permissions and the rows to send (only changed rows go to the server). */
export function matrixDiff(original: AccessRow[], draft: AccessRow[]): MatrixDiff {
  const before = new Map(original.map((row) => [row.resource, new Set(rowPermissions(row))]));
  const added: string[] = [];
  const removed: string[] = [];
  const changedRows: AccessRow[] = [];

  for (const row of draft) {
    const old = before.get(row.resource) ?? new Set<string>();
    const now = new Set(rowPermissions(row));
    const plus = [...now].filter((p) => !old.has(p));
    const minus = [...old].filter((p) => !now.has(p));
    if (plus.length || minus.length) {
      added.push(...plus);
      removed.push(...minus);
      changedRows.push(row);
    }
  }
  return { added, removed, changedRows };
}
