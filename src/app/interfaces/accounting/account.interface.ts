import { AccountMappingKey } from '@enums/accounting/account-mapping-key.enum';
import { AccountType } from '@enums/accounting/account-type.enum';
import { BalanceSide } from '@enums/accounting/balance-side.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Short reference to an account (parent, mapping target, revenue account). */
export interface AccountRef {
  id: string;
  code: string;
  name: string;
}

/** Mirror of AccountResource — a group or leaf of the chart of accounts. */
export interface Account extends GenericEntity {
  name: string;
  nameAr: string | null;
  type: AccountType;
  normalBalance: BalanceSide;
  parentId: string | null;
  parent?: AccountRef | null;
  children?: Account[];
  isGroup: boolean;
  isSystem: boolean;
  isPostable: boolean;
  level: number;
  description: string | null;
  /** Detail only: records using the account, e.g. `{ billableServices: 3, childAccounts: 0 }`. */
  usage?: Record<string, number>;
}

/** POST / PUT /accounting/accounts (the code is set once, on create). */
export interface AccountPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  type?: AccountType;
  parentId?: string | null;
  isGroup?: boolean;
  description?: string | null;
}

/** GET /accounting/accounts/mappings — a logical role and the account it posts to. */
export interface AccountMapping {
  key: AccountMappingKey;
  label: string;
  accountType: AccountType;
  account: AccountRef | null;
}
