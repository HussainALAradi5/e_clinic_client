import { AccessRow } from '@interfaces/identity/access-row.interface';

/** Access-matrix rows of one module (editor sections). */
export interface MatrixGroup {
  module: string;
  rows: AccessRow[];
}
