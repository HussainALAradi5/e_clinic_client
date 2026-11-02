import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';
import { MedicationRef } from '@interfaces/pharmacy/medication-ref.interface';

/** A prescribed medicine; `dispensedQuantity` / `remainingQuantity` are computed on the detail view. */
export interface PrescriptionItem {
  id: string;
  medicationId: string;
  medication: MedicationRef;
  dose: string;
  frequency: string;
  route: MedicationRoute;
  durationDays: number;
  quantity: string;
  dispensedQuantity: string | null;
  remainingQuantity: string | null;
  instructions: string | null;
}
