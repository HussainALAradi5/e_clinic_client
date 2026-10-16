import { Injectable } from '@angular/core';
import { Company, CompanyPayload } from '@shared/interfaces/reference/company.interface';
import { EntityApi } from '@shared/services/api/entity-api.service';

/** Reference › Companies — CRUD, archive / delete / restore and bulk (EntityApi). */
@Injectable({ providedIn: 'root' })
export class CompanyApi extends EntityApi<Company, CompanyPayload> {
  constructor() {
    super('reference/companies');
  }
}
