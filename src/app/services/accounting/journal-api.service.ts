import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JournalEntry } from '@interfaces/accounting/journal-entry.interface';
import { JournalEntryPayload } from '@interfaces/accounting/journal-entry-payload.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Accounting › Journal — manual drafts, posting, reversal; automatic entries are read-only. */
@Injectable({ providedIn: 'root' })
export class JournalApi extends EntityApi<JournalEntry, JournalEntryPayload> {
  constructor() {
    super('accounting/journal-entries');
  }

  post(id: string): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`${this.path}/${id}/post`);
  }

  reverse(id: string, date: string, reason: string): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`${this.path}/${id}/reverse`, { date, reason });
  }
}
