import { Injectable } from '@angular/core';
import {
  BillableService,
  BillableServicePayload,
} from '@interfaces/billing/billable-service.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Billing › Service catalog (price list) — CRUD, archive / delete / restore and bulk. */
@Injectable({ providedIn: 'root' })
export class BillableServiceApi extends EntityApi<BillableService, BillableServicePayload> {
  constructor() {
    super('billing/services');
  }
}
