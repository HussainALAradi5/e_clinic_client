import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import { DuplicateCheckPayload } from '@interfaces/identity/duplicate-check-payload.interface';
import { Person } from '@interfaces/identity/person.interface';
import { PersonPayload } from '@interfaces/identity/person-payload.interface';
import { ChangeUserStatusPayload } from '@interfaces/identity/change-user-status-payload.interface';
import { User } from '@interfaces/identity/user.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Identity › People & Users endpoints. Accounts are created by HR / patient flows, never here. */
@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly api = inject(ApiClient);

  index(query: ListQuery): Observable<Page<User>> {
    return this.api.list<User>('users', query);
  }

  show(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }

  changeStatus(id: string, body: ChangeUserStatusPayload): Observable<User> {
    return this.api.patch<User>(`users/${id}/status`, body);
  }

  sendResetLink(id: string): Observable<void> {
    return this.api.post<void>(`users/${id}/send-reset-link`);
  }

  /** `nationalId` is an exact match through the server's blind index. */
  searchPeople(query: ListQuery, nationalId?: string | null): Observable<Page<Person>> {
    return this.api.list<Person>('people', query, { nationalId });
  }

  duplicates(body: DuplicateCheckPayload): Observable<Person[]> {
    return this.api.post<Person[]>('people/duplicates', body);
  }

  updatePerson(id: string, body: PersonPayload): Observable<Person> {
    return this.api.put<Person>(`people/${id}`, body);
  }
}
