import { TicketPerson } from '@interfaces/communication/ticket.interface';

export interface TicketComment {
  id: string;
  body: string;
  author: TicketPerson & { isSupport: boolean };
  isMe: boolean;
  createdAt: string;
}
