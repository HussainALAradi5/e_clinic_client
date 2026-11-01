import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { silent } from '@core/interceptors/http-context';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import {
  SupportTicket,
  TicketComment,
  TicketPayload,
} from '@shared/interfaces/communication/ticket.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/**
 * Support tickets. The list goes through `ui-resource-list` (endpoint `support/tickets`, schema `tickets`);
 * this service covers one ticket, opening, replies and the admins' status changes.
 */
@Injectable({ providedIn: 'root' })
export class TicketApi {
  private readonly api = inject(ApiClient);
  readonly path = 'support/tickets';

  get(id: string, quiet = false): Observable<SupportTicket> {
    return this.api.get<SupportTicket>(`${this.path}/${id}`, quiet ? { context: silent() } : {});
  }

  open(payload: TicketPayload): Observable<SupportTicket> {
    return this.api.post<SupportTicket>(this.path, payload);
  }

  comment(id: string, body: string): Observable<TicketComment> {
    return this.api.post<TicketComment>(`${this.path}/${id}/comments`, { body });
  }

  /** Admins only; `resolution` is required to mark it solved (completed). */
  setStatus(
    ticket: SupportTicket,
    status: GenericStatus,
    resolution?: string,
  ): Observable<SupportTicket> {
    return this.api.patch<SupportTicket>(`${this.path}/${ticket.id}/status`, {
      status,
      resolution,
      version: ticket.version,
    });
  }
}
