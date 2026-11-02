import { ChangeUserStatusPayload } from '@interfaces/identity/change-user-status-payload.interface';
import { User } from '@interfaces/identity/user.interface';

/** Every dialog gets the record and a `save` callback; it closes itself when `save` resolves. */
export interface ChangeStatusDialogData {
  user: User;
  save: (payload: ChangeUserStatusPayload) => Promise<unknown>;
}
