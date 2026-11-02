import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TicketCategory } from '@enums/communication/ticket.enum';

export interface TicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TreatmentPriority;
}
