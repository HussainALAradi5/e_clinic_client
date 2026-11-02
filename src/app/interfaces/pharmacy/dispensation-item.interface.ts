import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';
import { Money } from '@interfaces/common/money.interface';
import { MedicationRef } from '@interfaces/pharmacy/medication-ref.interface';

/** One lot's share of a dispensed medicine, at the price-list price. */
export interface DispensationItem {
  id: string;
  prescriptionItemId: string | null;
  medicationId: string;
  medication: MedicationRef;
  batch: { id: string; code: string; batchNumber: string; expiryDate: string } | null;
  quantity: string;
  unitPrice: Money;
  lineTotal: Money;
  route: MedicationRoute | null;
  dose: string | null;
}
