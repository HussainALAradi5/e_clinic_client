import { AccessRow } from './role.interface';

/** Access-matrix rows of one module (editor sections). */
export interface MatrixGroup {
  module: string;
  rows: AccessRow[];
}

/** What a matrix edit adds / removes, and the rows to send. */
export interface MatrixDiff {
  added: string[];
  removed: string[];
  changedRows: AccessRow[];
}
