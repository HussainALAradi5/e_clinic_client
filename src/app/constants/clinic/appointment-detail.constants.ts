import { StatusTone } from '@enums/ui/status-tone.enum';

/** Badge colour of the people on an appointment. */
export const APPOINTMENT_PERSON_TONES = { patient: StatusTone.Teal, doctor: StatusTone.Indigo };

/** Text of clinic/appointment-detail/appointment-detail.page (labels, messages, confirmations). */
export const APPOINTMENT_DETAIL_TEXT = {
  type: 'Type',
  room: 'Room',
  bookedVia: 'Booked via',
  service: 'Service',
  reason: 'Reason',
  notes: 'Notes',
  cancelledBy: 'Cancelled by',
  cancellationReason: 'Cancellation reason',
  billVisit: 'Bill visit',
  treatment: 'Treatment',
  appointments: 'Appointments',
  movedFrom: 'Moved from',
  who: 'Who',
  statusTrail: 'Status trail',
  booked: 'Booked',
  noStatusChangesSince: '— no status changes since.',
  visitNote: 'Visit note',
  openVisit: 'Open visit',
  draftInvoice: 'Draft invoice',
};
