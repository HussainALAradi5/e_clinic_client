import { ExportFormat } from '@enums/list/export-format.enum';
import { ListQuery } from './list-query.interface';

/** The list on screen as sent to the server: no paging, sort as `-name,code`. */
export type ExportFilter = Omit<Partial<ListQuery>, 'sort'> & { sort?: string };

/** POST /<endpoint>/export — selected `ids`, or every row matching `filter`, in the given columns. */
export interface ExportRequest {
  format: ExportFormat;
  ids?: string[];
  filter?: ExportFilter;
  columns?: string[];
}

/** The file came back at once, or a background task (`list_export`) is preparing it. */
export type ExportOutcome =
  { downloaded: true } | { downloaded: false; taskId: string; rows: number };

/** One export format in the Export menu. */
export interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: string;
}

/** POST /<endpoint>/import — every row was saved. */
export interface ImportResult {
  resource: string;
  created: number;
  ids: string[];
}

/** One problem of a rejected import (`meta.rows` of IMPORT_FAILED). */
export interface ImportRowError {
  row: number;
  column: string | null;
  message: string;
}

/** Data of the import dialog. */
export interface ImportDialogData {
  endpoint: string;
  title: string;
}
