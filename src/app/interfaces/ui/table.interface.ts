import { ColumnDef } from '@interfaces/list/column-def.interface';

export interface TableColumn extends ColumnDef {
  sortable?: boolean;
  align?: 'start' | 'end';
}
