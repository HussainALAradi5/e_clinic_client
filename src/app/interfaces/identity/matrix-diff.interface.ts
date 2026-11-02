import { AccessRow } from '@interfaces/identity/access-row.interface';

/** What a matrix edit adds / removes, and the rows to send. */
export interface MatrixDiff {
  added: string[];
  removed: string[];
  changedRows: AccessRow[];
}
