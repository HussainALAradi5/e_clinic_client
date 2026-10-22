import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';

/** One status action of a booking, shown only when the transition is allowed and the user may run it. */
export interface AppointmentAction {
  key: string;
  label: string;
  icon: string;
  access: string;
  variant: ButtonVariant;
  run: () => Promise<Appointment | undefined>;
}
