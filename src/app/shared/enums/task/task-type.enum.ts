/** Mirror of TaskType — kind of long-running background task. */
export enum TaskType {
  ReportExport = 'report_export',
  AuditExport = 'audit_export',
  TransactionExport = 'transaction_export',
  PayrollCalculation = 'payroll_calculation',
  PayslipEmailing = 'payslip_emailing',
  FiscalYearClose = 'fiscal_year_close',
  BulkNotification = 'bulk_notification',
  BulkAction = 'bulk_action',
  AttachmentsZip = 'attachments_zip',
  ListExport = 'list_export',
}
