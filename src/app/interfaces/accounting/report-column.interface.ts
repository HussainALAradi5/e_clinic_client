import { ReportColumnType } from '@interfaces/accounting/report.interface';

export interface ReportColumn {
  /** Server key (snake_case); read the row's cell with `reportCell()` — row keys arrive camelCased. */
  key: string;
  label: string;
  type: ReportColumnType;
}
