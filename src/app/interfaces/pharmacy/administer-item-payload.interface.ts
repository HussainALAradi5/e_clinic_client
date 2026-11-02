import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';

export interface AdministerItemPayload {
  medicationId: string;
  quantity: string;
  route: MedicationRoute;
  dose?: string | null;
  batchId?: string | null;
}
