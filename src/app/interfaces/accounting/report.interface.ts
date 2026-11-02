import { ReportType } from '@enums/accounting/report-type.enum';

export type ReportColumnType = 'text' | 'money' | 'date' | 'number';

export interface ReportColumn {
  /** Server key (snake_case); read the row's cell with `reportCell()` — row keys arrive camelCased. */
  key: string;
  label: string;
  type: ReportColumnType;
}

/** A row's cells plus `_kind` (line | group | total) and an optional `_link` for click-through. */
export type ReportRow = Record<string, unknown>;

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

/** Query of a report: dates and filters by report type (as_of, from / to, account, department, comparison). */
export interface ReportParams {
  asOf?: string;
  from?: string;
  to?: string;
  accountId?: string;
  departmentId?: string | null;
  compareFrom?: string | null;
  compareTo?: string | null;
  includeZero?: boolean;
}

/** Which inputs a report asks for. */
export type ReportInputs = 'as-of' | 'range' | 'ledger' | 'income';

export interface ReportDefinition {
  type: ReportType;
  label: string;
  description: string;
  icon: string;
  inputs: ReportInputs;
}
