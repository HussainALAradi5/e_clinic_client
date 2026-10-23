import { ExportFormat } from '@shared/enums/list/export-format.enum';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { FilterOperator } from '@shared/enums/shared/filter-operator.enum';

/** Mirror of FilterField in the resource schema. */
export interface FilterDef {
  field: string;
  type: FilterFieldType;
  operators: FilterOperator[];
  enum?: string;
  resource?: string;
  /** What the filter is called on screen (set by the server). */
  label?: string;
  /** Accepted in links (e.g. the orders of one visit) but not offered in the filter panel. */
  hidden?: boolean;
}

export interface ColumnDef {
  field: string;
  label: string;
  /** The enum behind the column — the table shows its values as coloured badges. */
  enum?: string;
}

export interface BulkActionDef {
  name: string;
  needsReason: boolean;
  inverse: string | null;
}

/** Mirror of App\Shared\Query\ResourceSchema (GET /meta/resources/{resource}). */
export interface ResourceSchema {
  resource: string;
  filters: FilterDef[];
  sortable: string[];
  search: boolean;
  dateFields: string[];
  columns: ColumnDef[];
  bulkActions: BulkActionDef[];
  /** Formats the signed-in user may export (empty = no export for them). */
  exportFormats: ExportFormat[];
  defaultSort: string;
  /** GenericEntity resource: the list offers "Show archived". */
  archivable: boolean;
  /** The signed-in user may import this list from Excel. */
  importable: boolean;
}
