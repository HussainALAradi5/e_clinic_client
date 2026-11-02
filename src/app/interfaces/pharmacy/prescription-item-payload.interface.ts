import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';

export interface PrescriptionItemPayload {
  medicationId: string;
  dose: string;
  frequency: string;
  route: MedicationRoute;
  durationDays: number;
  quantity: string;
  instructions: string | null;
}
