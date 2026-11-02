import { DispenseUnit } from '@enums/pharmacy/dispense-unit.enum';
import { MedicationForm } from '@enums/pharmacy/medication-form.enum';

export interface MedicationPayload {
  code: string;
  genericName: string;
  brandName: string | null;
  nameAr: string | null;
  form: MedicationForm;
  strength: string;
  unit: DispenseUnit;
  gtin: string | null;
  manufacturerId: string | null;
  originCountryCode: string | null;
  description: string | null;
  price: string;
  taxRate: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  reorderLevel: number;
  storageNotes: string | null;
}
