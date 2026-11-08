/** A number edited in a table cell. */
export interface NumberCellChange<T> {
  row: T;
  field: string;
  value: string | null;
}
