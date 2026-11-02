import { Injectable } from '@angular/core';
import { Company } from '@interfaces/reference/company.interface';
import { CompanyPayload } from '@interfaces/reference/company-payload.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Reference › Companies — CRUD, archive / delete / restore and bulk (EntityApi). */
@Injectable({ providedIn: 'root' })
export class CompanyApi extends EntityApi<Company, CompanyPayload> {
  constructor() {
    super('reference/companies');
  }
}
