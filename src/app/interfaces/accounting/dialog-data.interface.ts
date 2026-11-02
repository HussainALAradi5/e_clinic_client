import { Account } from '@interfaces/accounting/account.interface';
import { AccountPayload } from '@interfaces/accounting/account-payload.interface';

/** New account (no `account`, optional preset parent) or edit; closes with the saved account. */
export interface AccountFormDialogData {
  account: Account | null;
  parent?: Account | null;
  save: (payload: AccountPayload) => Promise<Account>;
}
