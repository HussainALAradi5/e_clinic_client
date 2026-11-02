export interface JournalLinePayload {
  accountId: string;
  debit?: string | null;
  credit?: string | null;
  description?: string | null;
  departmentId?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
}
