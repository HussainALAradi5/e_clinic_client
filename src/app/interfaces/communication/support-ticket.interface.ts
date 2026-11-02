import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TicketCategory } from '@enums/communication/ticket.enum';
import { TicketConfirmation } from '@enums/communication/ticket-confirmation.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { TicketComment } from '@interfaces/communication/ticket-comment.interface';
import { TicketFile } from '@interfaces/communication/ticket-file.interface';
import { TicketPerson } from '@interfaces/communication/ticket.interface';

/** GET /support/tickets(/:id). `status` is the shared GenericStatus (completed = solved). */
export interface SupportTicket {
  id: string;
  code: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TreatmentPriority;
  status: GenericStatus;
  /** Where an admin may move it next (the server's ticket flow). */
  allowedTransitions: GenericStatus[];
  requester: TicketPerson | null;
  assignee: TicketPerson | null;
  resolver: TicketPerson | null;
  resolvedAt: string | null;
  resolution: string | null;
  /** The steps that solved it, in order. */
  resolutionSteps: string[];
  /** The requester's answer once solved: awaiting, confirmed or declined (null before). */
  confirmation: TicketConfirmation | null;
  confirmedAt: string | null;
  /** Screenshots, photos and PDFs on the ticket. */
  attachments?: TicketFile[];
  commentsCount?: number;
  comments?: TicketComment[];
  version: number;
  createdAt: string;
  updatedAt: string;
}
