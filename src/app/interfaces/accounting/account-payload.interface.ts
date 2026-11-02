import { AccountType } from '@enums/accounting/account-type.enum';

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
