import { TreatmentPriority } from '@shared/enums/clinic/treatment-priority.enum';
import { TicketCategory, TicketConfirmation } from '@shared/enums/communication/ticket.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';

export interface TicketPerson {
  id: string;
  fullName: string;
}

export interface TicketComment {
  id: string;
  body: string;
  author: TicketPerson & { isSupport: boolean };
  isMe: boolean;
  createdAt: string;
}

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

export interface TicketFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: string;
  /** Short-lived link; null until the file passed the scan. */
  url: string | null;
}

export interface TicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TreatmentPriority;
}
