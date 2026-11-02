import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { silent } from '@middlewares/interceptors/http-context';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { UploadResult } from '@interfaces/attachment/upload-result.interface';
import { SupportTicket } from '@interfaces/communication/support-ticket.interface';
import { TicketComment } from '@interfaces/communication/ticket-comment.interface';
import { TicketPayload } from '@interfaces/communication/ticket-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/**
 * Support tickets. The list goes through `ui-resource-list` (endpoint `support/tickets`, schema `tickets`);
 * this service covers one ticket, opening, replies and the admins' status changes.
 */
@Injectable({ providedIn: 'root' })
export class TicketApi {
  private readonly api = inject(ApiClient);
  readonly path = ENDPOINTS.support.tickets;

  get(id: string, quiet = false): Observable<SupportTicket> {
    return this.api.get<SupportTicket>(`${this.path}/${id}`, quiet ? { context: silent() } : {});
  }

  open(payload: TicketPayload): Observable<SupportTicket> {
    return this.api.post<SupportTicket>(this.path, payload);
  }

  comment(id: string, body: string): Observable<TicketComment> {
    return this.api.post<TicketComment>(`${this.path}/${id}/comments`, { body });
  }

  /** Admins only; marking it solved needs the solution in words, and optionally the steps that fixed it. */
  setStatus(
    ticket: SupportTicket,
    status: GenericStatus,
    solution?: { resolution: string; steps: string[] },
  ): Observable<SupportTicket> {
    return this.api.patch<SupportTicket>(`${this.path}/${ticket.id}/status`, {
      status,
      resolution: solution?.resolution,
      steps: solution?.steps,
      version: ticket.version,
    });
  }

  /** The requester: the fix works. */
  confirm(id: string): Observable<SupportTicket> {
    return this.api.post<SupportTicket>(`${this.path}/${id}/confirm`);
  }

  /** The requester: still broken, and why — back to in progress. */
  decline(id: string, reason: string): Observable<SupportTicket> {
    return this.api.post<SupportTicket>(`${this.path}/${id}/decline`, { reason });
  }

  /** Screenshots, photos or PDFs on a ticket (attachments module, category `ticket_attachment`). */
  attach(id: string, files: File[]): Observable<UploadResult> {
    const form = new FormData();
    files.forEach((file) => form.append('files[]', file, file.name));
    form.append('category', AttachmentCategory.TicketAttachment);
    form.append('attachable_type', 'support_ticket');
    form.append('attachable_id', id);
    return this.api.post<UploadResult>(ENDPOINTS.attachments, form);
  }
}
