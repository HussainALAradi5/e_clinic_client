import { UserStatus } from '@enums/identity/user-status.enum';

/** PATCH /users/{user}/status — reason required for locked / inactive. */
export interface ChangeUserStatusPayload {
  status: UserStatus;
  reason?: string | null;
}
