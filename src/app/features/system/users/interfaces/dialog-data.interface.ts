import { Person, PersonPayload } from '@shared/interfaces/identity/person.interface';
import { ChangeUserStatusPayload, User } from '@shared/interfaces/identity/user.interface';

/** Every dialog gets the record and a `save` callback; it closes itself when `save` resolves. */
export interface ChangeStatusDialogData {
  user: User;
  save: (payload: ChangeUserStatusPayload) => Promise<unknown>;
}

export interface PersonFormDialogData {
  person: Person;
  save: (payload: PersonPayload) => Promise<unknown>;
}

export interface UserRolesDialogData {
  current: string[];
  save: (roles: string[]) => Promise<unknown>;
}
