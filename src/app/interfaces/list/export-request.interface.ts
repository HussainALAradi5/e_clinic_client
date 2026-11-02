import { ExportFormat } from '@enums/list/export-format.enum';
import { ExportFilter } from '@interfaces/list/transfer.interface';

/** POST /<endpoint>/export — selected `ids`, or every row matching `filter`, in the given columns. */
export interface ExportRequest {
  format: ExportFormat;
  ids?: string[];
  filter?: ExportFilter;
  columns?: string[];
}
