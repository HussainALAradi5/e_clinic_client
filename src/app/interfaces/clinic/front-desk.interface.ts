import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';

export /** One board column: the statuses it holds and what the desk does there. */
interface Lane {
  title: string;
  hint: string;
  statuses: AppointmentStatus[];
}
