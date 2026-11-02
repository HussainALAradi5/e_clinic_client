import { ReportType } from '@enums/accounting/report-type.enum';
import { ReportColumn } from '@interfaces/accounting/report-column.interface';
import { ReportRow } from '@interfaces/accounting/report-row.type';
import { ReportColumnType } from '@interfaces/accounting/report.interface';

/** Mirror of ReportTable::toArray() — one shape for every financial report. */
export interface ReportTable {
  type: ReportType;
  title: string;
  subtitle: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: Record<string, string>;
  summary: { label: string; value: string; type: ReportColumnType }[];
}
