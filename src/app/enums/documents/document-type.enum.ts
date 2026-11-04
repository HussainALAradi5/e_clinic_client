/** Mirror of DocumentType — a record that downloads as a branded PDF (`GET /documents/{type}/{id}`). */
export enum DocumentType {
  SickLeave = 'sick_leave',
  Prescription = 'prescription',
  Result = 'result',
  Consent = 'consent',
  Invoice = 'invoice',
  Receipt = 'receipt',
  InsuranceClaim = 'insurance_claim',
  Payslip = 'payslip',
  ZReport = 'z_report',
  AttendanceSlip = 'attendance_slip',
  WrittenDocument = 'written_document',
}
