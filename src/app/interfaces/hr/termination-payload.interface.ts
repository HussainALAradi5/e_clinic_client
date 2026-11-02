import { TerminationReason } from '@enums/hr/termination-reason.enum';

/** POST /hr/employees/{id}/terminate. */
export interface TerminationPayload {
  terminationDate: string;
  reason: TerminationReason;
  notes?: string | null;
}
