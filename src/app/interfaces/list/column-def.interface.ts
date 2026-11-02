export interface ColumnDef {
  field: string;
  label: string;
  /** The enum behind the column — the table shows its values as coloured badges. */
  enum?: string;
}
