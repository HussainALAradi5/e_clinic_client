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
}

export interface ColumnDef {
  field: string;
  label: string;
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
  exportFormats: ExportFormat[];
  defaultSort: string;
  /** GenericEntity resource: the list offers "Show archived". */
  archivable: boolean;
}
