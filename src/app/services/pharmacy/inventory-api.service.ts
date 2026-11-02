import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { MedicationBatch } from '@interfaces/pharmacy/inventory.interface';
import { ReceiveStockPayload } from '@interfaces/pharmacy/receive-stock-payload.interface';
import { StockAdjustmentPayload } from '@interfaces/pharmacy/stock-adjustment-payload.interface';
import { StockMovement } from '@interfaces/pharmacy/stock-movement.interface';
import { StockTransferPayload } from '@interfaces/pharmacy/stock-transfer-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Pharmacy › Inventory — lots, the stock ledger, receipts, count corrections and quarantine. */
@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.pharmacy.inventory;

  stock(query: ListQuery): Observable<Page<MedicationBatch>> {
    return this.api.list<MedicationBatch>(`${this.path}/stock`, query);
  }

  batch(id: string): Observable<MedicationBatch> {
    return this.api.get<MedicationBatch>(`${this.path}/batches/${id}`);
  }

  movements(query: ListQuery): Observable<Page<StockMovement>> {
    return this.api.list<StockMovement>(`${this.path}/movements`, query);
  }

  receive(payload: ReceiveStockPayload, idempotencyKey: string): Observable<MedicationBatch> {
    return this.api.post<MedicationBatch>(`${this.path}/receipts`, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  adjust(batchId: string, payload: StockAdjustmentPayload): Observable<StockMovement> {
    return this.api.post<StockMovement>(`${this.path}/batches/${batchId}/adjust`, payload);
  }

  /** Moves units of a lot to the other place (pharmacy ↔ treatment room); returns the lot there. */
  transfer(batchId: string, payload: StockTransferPayload): Observable<MedicationBatch> {
    return this.api.post<MedicationBatch>(`${this.path}/batches/${batchId}/transfer`, payload);
  }

  quarantine(batchId: string, quarantined: boolean, reason: string): Observable<MedicationBatch> {
    return this.api.patch<MedicationBatch>(`${this.path}/batches/${batchId}/quarantine`, {
      quarantined,
      reason,
    });
  }
}
