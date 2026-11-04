import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BookingWizard } from '@components/clinic/booking-wizard/booking-wizard.component';
import { CancelDialog } from '@components/clinic/cancel-dialog/cancel-dialog.component';
import { ConsentDialog } from '@components/clinic/consent-dialog/consent-dialog.component';
import { CompleteDialog } from '@components/clinic/complete-dialog/complete-dialog.component';
import { RescheduleDialog } from '@components/clinic/reschedule-dialog/reschedule-dialog.component';
import { AppointmentAction } from '@interfaces/clinic/appointment-action.interface';
import { AppointmentDialogData } from '@interfaces/clinic/appointment-dialog-data.interface';
import { BookingWizardData } from '@interfaces/clinic/booking-wizard-data.interface';
import { ConsentDialogData } from '@interfaces/clinic/consent-dialog-data.interface';
import { ErrorCode } from '@enums/api/error-code.enum';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { PatientApi } from '@services/clinic/patient-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { isApiError } from '@utilities/guards';

/** Grace period after the start before a confirmed booking may be marked no-show (server: 15 min). */
const NO_SHOW_AFTER_MS = 15 * 60_000;

/**
 * The status actions of a booking (confirm, check in, start, complete, cancel, reschedule, no-show) with their
 * dialogs and messages — one implementation for the detail page, the front-desk board and the calendar.
 */
/** Check-in shows from an hour before the start (the server refuses earlier check-ins and other days). */
function checkInOpen(appointment: Appointment): boolean {
  return Date.now() >= new Date(appointment.checkInOpensAt).getTime();
}

@Injectable({ providedIn: 'root' })
export class AppointmentActions {
  private readonly api = inject(AppointmentApi);
  private readonly patients = inject(PatientApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  /** Actions the booking's status allows (the caller's rights are applied by `ui-button [access]`). */
  for(appointment: Appointment): AppointmentAction[] {
    const allowed = new Set(appointment.allowedTransitions);
    const { Filled, Outlined, Tonal, Danger } = ButtonVariant;
    const actions: (AppointmentAction | false)[] = [
      allowed.has(AppointmentStatus.Confirmed) &&
        this.action('confirm', 'Confirm', 'task_alt', 'appointments.write', Tonal, () =>
          this.simple(this.api.confirm(appointment.id), 'Appointment confirmed.'),
        ),
      allowed.has(AppointmentStatus.CheckedIn) &&
        checkInOpen(appointment) &&
        this.action(
          'check-in',
          'Check in',
          'how_to_reg',
          'appointments.write & appointments.check_in',
          Filled,
          () =>
            this.simple(
              this.api.checkIn(appointment.id),
              `${appointment.patient?.fullName ?? 'Patient'} checked in.`,
            ),
        ),
      allowed.has(AppointmentStatus.InProgress) &&
        this.action(
          'start',
          'Start',
          'play_arrow',
          'appointments.write & appointments.treat',
          Filled,
          () => this.start(appointment),
        ),
      allowed.has(AppointmentStatus.Completed) &&
        this.action(
          'complete',
          'Complete',
          'done_all',
          'appointments.write & appointments.treat',
          Filled,
          () => this.complete(appointment),
        ),
      allowed.has(AppointmentStatus.Rescheduled) &&
        this.action('reschedule', 'Reschedule', 'update', 'appointments.write', Outlined, () =>
          this.open(RescheduleDialog, appointment, 'Appointment moved.', '640px'),
        ),
      allowed.has(AppointmentStatus.NoShow) &&
        Date.now() > new Date(appointment.startsAt).getTime() + NO_SHOW_AFTER_MS &&
        this.action('no-show', 'No-show', 'person_off', 'appointments.write', Outlined, () =>
          this.noShow(appointment),
        ),
      allowed.has(AppointmentStatus.Cancelled) &&
        this.action(
          'cancel',
          'Cancel',
          'event_busy',
          'appointments.write & appointments.cancel',
          Danger,
          () => this.open(CancelDialog, appointment, 'Appointment cancelled.'),
        ),
    ];
    return actions.filter((a): a is AppointmentAction => a !== false);
  }

  /** Opens the booking wizard (optionally preset) and confirms the booking; resolves with it, or undefined. */
  async book(preset: BookingWizardData = {}): Promise<Appointment | undefined> {
    const booked = await this.dialogs.open<BookingWizard, BookingWizardData, Appointment>(
      BookingWizard,
      preset,
      { width: '720px' },
    );
    if (booked) {
      this.notify.success(
        `Booked ${booked.patient?.fullName ?? 'the patient'} with ${booked.provider?.fullName ?? 'the doctor'} on ${booked.scheduledDate} at ${booked.startTime}.`,
      );
    }
    return booked;
  }

  private action(
    key: string,
    label: string,
    icon: string,
    access: string,
    variant: ButtonVariant,
    run: () => Promise<Appointment | undefined>,
  ): AppointmentAction {
    return { key, label, icon, access, variant, run };
  }

  private async simple(
    request: ReturnType<AppointmentApi['confirm']>,
    message: string,
  ): Promise<Appointment> {
    const appointment = await firstValueFrom(request);
    this.notify.success(message);
    return appointment;
  }

  /** A service that needs a signed consent: record it on the spot, then start. */
  private async start(appointment: Appointment): Promise<Appointment | undefined> {
    try {
      return await this.simple(this.api.start(appointment.id), 'Visit started.');
    } catch (error) {
      if (!isApiError(error) || error.code !== ErrorCode.ConsentRequired) throw error;
      const ok = await this.dialogs.confirm({
        title: 'Signed consent needed',
        message: `${error.message} Record it now?`,
        confirmLabel: 'Record consent',
      });
      if (!ok) return undefined;
      const patient = await firstValueFrom(this.patients.get(appointment.patientId));
      const consent = await this.dialogs.open<ConsentDialog, ConsentDialogData, PatientConsent>(
        ConsentDialog,
        {
          patient,
          type: (error.meta?.['consentType'] ?? error.meta?.['consent_type']) as ConsentType,
          appointmentId: appointment.id,
          treatmentId: appointment.treatmentId,
        },
        { width: '720px' },
      );
      return consent
        ? this.simple(this.api.start(appointment.id), 'Consent saved — visit started.')
        : undefined;
    }
  }

  private async complete(appointment: Appointment): Promise<Appointment | undefined> {
    const done = await this.dialogs.open<CompleteDialog, AppointmentDialogData, Appointment>(
      CompleteDialog,
      { appointment },
      { width: '560px' },
    );
    if (done) {
      this.notify.success(
        done.followUpSuggestedDate
          ? `Visit completed — suggest a follow-up on ${done.followUpSuggestedDate}.`
          : 'Visit completed.',
      );
    }
    return done;
  }

  private async noShow(appointment: Appointment): Promise<Appointment | undefined> {
    const ok = await this.dialogs.confirm({
      title: 'Mark as no-show?',
      message: `${appointment.patient?.fullName ?? 'The patient'} did not arrive for ${appointment.startTime}.`,
      confirmLabel: 'Mark no-show',
      danger: true,
    });
    return ok ? this.simple(this.api.noShow(appointment.id), 'Marked as no-show.') : undefined;
  }

  private open<C>(
    dialog: ComponentType<C>,
    appointment: Appointment,
    message: string,
    width = '520px',
  ): Promise<Appointment | undefined> {
    return this.dialogs.openAction<C, AppointmentDialogData, Appointment>(
      dialog,
      { appointment },
      () => message,
      width,
    );
  }
}
