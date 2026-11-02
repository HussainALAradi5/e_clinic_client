import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';

/** `GET appointments/{id}/medications` — prescribed there, and given / handed over. */
export interface AppointmentMedicines {
  prescriptions: Prescription[];
  dispensations: Dispensation[];
}
