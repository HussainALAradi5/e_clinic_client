import { AccountMappingKey } from '@enums/accounting/account-mapping-key.enum';
import { AccountType } from '@enums/accounting/account-type.enum';
import { AccountRef } from '@interfaces/accounting/account-ref.interface';

/** GET /accounting/accounts/mappings — a logical role and the account it posts to. */
export interface AccountMapping {
  key: AccountMappingKey;
  label: string;
  accountType: AccountType;
  account: AccountRef | null;
}
