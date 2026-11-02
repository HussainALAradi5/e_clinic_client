/** Mirror of App\Enums\Accounting\ReportType — each report has its own route (`trial_balance` → `trial-balance`). */
export enum ReportType {
  TrialBalance = 'trial_balance',
  GeneralLedger = 'general_ledger',
  IncomeStatement = 'income_statement',
  BalanceSheet = 'balance_sheet',
  CashFlow = 'cash_flow',
  RevenueByDoctor = 'revenue_by_doctor',
  RevenueByService = 'revenue_by_service',
  ReceivablesAging = 'receivables_aging',
}
