import { DispenseUnit } from '@enums/pharmacy/dispense-unit.enum';

/** A medication embedded in another record (prescription line, lot, movement). */
export interface MedicationRef {
  id: string;
  code: string;
  name: string;
  unit: DispenseUnit;
  gtin?: string | null;
  isControlled?: boolean;
}
