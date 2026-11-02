import { ExportFormat } from '@enums/list/export-format.enum';

/** One export format in the Export menu. */
export interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: string;
}
