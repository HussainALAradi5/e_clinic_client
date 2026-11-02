import { DispenseUnit } from '@enums/pharmacy/dispense-unit.enum';
import { MedicationForm } from '@enums/pharmacy/medication-form.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';

/** A medication embedded in another record (prescription line, lot, movement). */
export interface MedicationRef {
  id: string;
  code: string;
  name: string;
  unit: DispenseUnit;
  gtin?: string | null;
  isControlled?: boolean;
}

/**
 * Mirror of MedicationResource. Price and VAT come from its price-list service; `stockOnHand` counts only lots that
 * may be dispensed today (not expired, not quarantined).
 */
export interface Medication extends GenericEntity {
  name: string;
  genericName: string;
  brandName: string | null;
  nameAr: string | null;
  form: MedicationForm;
  strength: string;
  unit: DispenseUnit;
  gtin: string | null;
  manufacturerId: string | null;
  manufacturer?: { id: string; name: string } | null;
  originCountryCode: string | null;
  originCountry?: { code: string; name: string } | null;
  description: string | null;
  billableServiceId: string;
  price?: Money;
  taxRate?: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  reorderLevel: number;
  storageNotes: string | null;
  stockOnHand: string | null;
  /** Of which in the treatment room (the rest is in the pharmacy). */
  stockTreatmentRoom: string | null;
  /** The first usable lot to expire (yyyy-mm-dd). */
  nextExpiry: string | null;
  isLowStock: boolean;
}

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
