import { BillableService } from '@interfaces/billing/billable-service.interface';
import { BillableServicePayload } from '@interfaces/billing/billable-service-payload.interface';

/** New price-list item or edit; closes with the saved item. */
export interface ServiceFormDialogData {
  service: BillableService | null;
  save: (payload: BillableServicePayload) => Promise<BillableService>;
}
