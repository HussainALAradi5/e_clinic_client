import { ColumnDef } from '@interfaces/list/resource-schema.interface';

export interface TableColumn extends ColumnDef {
  sortable?: boolean;
  align?: 'start' | 'end';
}

export interface CellContext<T> {
  $implicit: T;
  value: unknown;
}

export interface PageChange {
  page?: number;
  perPage: number;
  cursor?: string;
}
