import { Person } from '@interfaces/identity/person.interface';
import { PersonPayload } from '@interfaces/identity/person-payload.interface';

export interface PersonFormDialogData {
  person: Person;
  save: (payload: PersonPayload) => Promise<unknown>;
}
