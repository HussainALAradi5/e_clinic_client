import { ColumnDef } from '@interfaces/list/column-def.interface';
import { NumberFieldOptions } from '@interfaces/ui/number-field-options.interface';

export interface TableColumn extends ColumnDef {
  sortable?: boolean;
  align?: 'start' | 'end';
  /** Shows a number field in the cell; each change comes out of the table's (numberChange). */
  number?: Partial<NumberFieldOptions>;
}
