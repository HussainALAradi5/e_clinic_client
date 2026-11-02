/** Mirror of SickLeaveResource — a sick leave certificate (`SLV-…`). */
export interface SickLeave {
  id: string;
  code: string;
  patient: { id: string; code: string; fullName: string; dateOfBirth: string; gender: string };
  doctor: { id: string; fullName: string; jobTitle: string };
  appointmentId: string | null;
  startDate: string;
  endDate: string;
  days: number;
  /** Only for the patient and doctors, or when it is printed (`showReason`). */
  reason?: string | null;
  showReason: boolean;
  notes: string | null;
  issuedAt: string;
  isCancelled: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
}

/** `POST appointments/{id}/sick-leaves`. */
export interface SickLeavePayload {
  startDate: string;
  endDate: string;
  reason?: string | null;
  showReason?: boolean;
  notes?: string | null;
}
