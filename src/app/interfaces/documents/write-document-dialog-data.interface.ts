/** Opens the write-document dialog for a visit. */
export interface WriteDocumentDialogData {
  appointmentId: string;
  patientName: string;
  /** A nurse (treatment session) may write attendance certificates only. */
  nurseOnly: boolean;
}
