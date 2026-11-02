import { AccountType } from '@enums/accounting/account-type.enum';
import { BalanceSide } from '@enums/accounting/balance-side.enum';
import { AccountRef } from '@interfaces/accounting/account-ref.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';

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
