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
