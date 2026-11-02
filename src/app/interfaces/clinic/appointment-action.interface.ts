import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';

/** One status action of a booking, shown only when the transition is allowed and the user may run it. */
export interface AppointmentAction {
  key: string;
  label: string;
  icon: string;
  access: string;
  variant: ButtonVariant;
  run: () => Promise<Appointment | undefined>;
}
