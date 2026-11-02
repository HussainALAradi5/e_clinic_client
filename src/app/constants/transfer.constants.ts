import { ExportFormat } from '@enums/list/export-format.enum';
import { ExportFormatOption } from '@interfaces/list/transfer.interface';

/** Export menu entries, in menu order. */
export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  { format: ExportFormat.Xlsx, label: 'Excel (.xlsx)', icon: 'table_view' },
  { format: ExportFormat.Pdf, label: 'PDF', icon: 'picture_as_pdf' },
  { format: ExportFormat.Csv, label: 'CSV', icon: 'description' },
];

/** Import accepts the Excel template only. */
export const IMPORT_ACCEPT =
  '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
