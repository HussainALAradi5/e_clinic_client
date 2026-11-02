/** POST /billing/invoices/charge — bill a visit (checked in or later) or a clinical order by hand. */
export interface ChargePayload {
  sourceType: 'appointment' | 'clinical_order';
  sourceId: string;
}
