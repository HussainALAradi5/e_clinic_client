import { Injectable } from '@angular/core';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { BillableServicePayload } from '@interfaces/billing/billable-service-payload.interface';
import { EntityApi } from '@services/api/entity-api.service';
import { ENDPOINTS } from '@config/endpoints';

/** Billing › Service catalog (price list) — CRUD, archive / delete / restore and bulk. */
@Injectable({ providedIn: 'root' })
export class BillableServiceApi extends EntityApi<BillableService, BillableServicePayload> {
  constructor() {
    super(ENDPOINTS.billing.services);
  }
}
