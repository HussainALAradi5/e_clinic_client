import { ExportFormat } from '@enums/list/export-format.enum';
import { BulkActionDef } from '@interfaces/list/bulk-action-def.interface';
import { ColumnDef } from '@interfaces/list/column-def.interface';
import { FilterDef } from '@interfaces/list/filter-def.interface';

/** Mirror of App\Shared\Query\ResourceSchema (GET /meta/resources/{resource}). */
export interface ResourceSchema {
  resource: string;
  filters: FilterDef[];
  sortable: string[];
  search: boolean;
  /** What the search box finds, as column labels ("Code", "Patient", "Doctor") — set by the server. */
  searchHint?: string[];
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
