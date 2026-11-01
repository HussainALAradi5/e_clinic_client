/** Mirror of App\Enums\Communication\TicketCategory. Status is GenericStatus, priority TreatmentPriority. */
export enum TicketCategory {
  Technical = 'technical',
  Access = 'access',
  Equipment = 'equipment',
  Data = 'data',
  Other = 'other',
}

/** Mirror of App\Enums\Communication\TicketConfirmation — the requester's answer once a ticket is solved. */
export enum TicketConfirmation {
  Awaiting = 'awaiting',
  Confirmed = 'confirmed',
  Declined = 'declined',
}
