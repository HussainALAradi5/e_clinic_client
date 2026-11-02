/** Mirror of App\Enums\Appointments\AppointmentStatus — booking lifecycle (transitions come from GET /meta/enums). */
export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  CheckedIn = 'checked_in',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
  Rescheduled = 'rescheduled',
}
