import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@core/interceptors/http-context';
import { Page } from '@shared/interfaces/api/page.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import {
  MedicationBatch,
  ReceiveStockPayload,
  StockAdjustmentPayload,
  StockMovement,
} from '@shared/interfaces/pharmacy/inventory.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Pharmacy › Inventory — lots, the stock ledger, receipts, count corrections and quarantine. */
@Injectable({ providedIn: 'root' })
export class InventoryApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'pharmacy/inventory';

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

  quarantine(batchId: string, quarantined: boolean, reason: string): Observable<MedicationBatch> {
    return this.api.patch<MedicationBatch>(`${this.path}/batches/${batchId}/quarantine`, {
      quarantined,
      reason,
    });
  }
}
