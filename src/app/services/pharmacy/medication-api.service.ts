import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medication } from '@interfaces/pharmacy/medication.interface';
import { MedicationPayload } from '@interfaces/pharmacy/medication-payload.interface';
import { EntityApi } from '@services/api/entity-api.service';
import { ENDPOINTS } from '@config/endpoints';

/** Pharmacy › Medications — the catalogue (priced through the service catalogue), barcode lookup and low stock. */
@Injectable({ providedIn: 'root' })
export class MedicationApi extends EntityApi<
  Medication,
  MedicationPayload,
  Partial<MedicationPayload>
> {
  constructor() {
    super(ENDPOINTS.pharmacy.medications);
  }

  /** Scanned manufacturer barcode (GTIN, 8–14 digits). */
  byBarcode(gtin: string): Observable<Medication> {
    return this.api.get<Medication>(`${this.path}/barcode/${encodeURIComponent(gtin)}`);
  }

  /** Active medicines at or below their reorder level. */
  lowStock(): Observable<Medication[]> {
    return this.api.get<Medication[]>(`${this.path}/low-stock`);
  }
}
