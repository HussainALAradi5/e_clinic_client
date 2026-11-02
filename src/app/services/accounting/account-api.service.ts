import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountType } from '@enums/accounting/account-type.enum';
import { Account, AccountMapping, AccountPayload } from '@interfaces/accounting/account.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Accounting › Chart of accounts — CRUD, archive / delete / restore, bulk, tree and mappings. */
@Injectable({ providedIn: 'root' })
export class AccountApi extends EntityApi<Account, AccountPayload> {
  constructor() {
    super('accounting/accounts');
  }

  tree(type?: AccountType | null): Observable<Account[]> {
    return this.api.get<Account[]>(`${this.path}/tree`, type ? { params: { type } } : {});
  }

  mappings(): Observable<AccountMapping[]> {
    return this.api.get<AccountMapping[]>(`${this.path}/mappings`);
  }

  updateMappings(mappings: { key: string; accountId: string }[]): Observable<AccountMapping[]> {
    return this.api.put<AccountMapping[]>(`${this.path}/mappings`, { mappings });
  }
}
