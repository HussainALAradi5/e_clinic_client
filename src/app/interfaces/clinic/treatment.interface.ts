import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TreatmentType } from '@enums/clinic/treatment-type.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { TreatmentProgress } from '@interfaces/clinic/treatment-progress.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';

/** Mirror of TreatmentResource. Diagnosis and plan only with `patients.view_medical`. */
export interface Treatment extends GenericEntity, Versioned {
  type: TreatmentType;
  title: string;
  patientId: string;
  patient?: { id: string; code: string; fullName: string; phone: string };
  doctorId: string;
  doctor?: { id: string; fullName: string; specialty: string | null };
  appointmentId: string | null;
  appointment?: { id: string; code: string; scheduledDate: string } | null;
  billableServiceId: string | null;
  billableService?: { id: string; name: string; price: Money } | null;
  diagnosis?: string | null;
  plan?: string | null;
  priority: TreatmentPriority;
  status: GenericStatus;
  allowedTransitions: GenericStatus[];
  plannedSessions: number;
  sessionDurationMinutes: number;
  startDate: string | null;
  endDate: string | null;
  cancellationReason: string | null;
  progress?: TreatmentProgress;
}
