import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Appointment } from '@interfaces/clinic/appointment.interface';

export type CalendarView = 'day' | 'week';

export /** One calendar column: a doctor (day view) or a date (week view). */
interface Column {
  key: string;
  title: string;
  subtitle: string;
  doctor: Doctor;
  date: string;
  items: Appointment[];
}
