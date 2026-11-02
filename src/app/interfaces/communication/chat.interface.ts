import { UserType } from '@enums/identity/user-type.enum';

/** GET /chat/contacts — a colleague who can be messaged. */
export interface ChatContact {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  userType: UserType;
}
