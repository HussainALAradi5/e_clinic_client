import { inject, Injectable } from '@angular/core';
import { ConsentDialog } from '@components/clinic/consent-dialog/consent-dialog.component';
import { OrderFormDialog } from '@components/clinic/order-form-dialog/order-form-dialog.component';
import { OrderResultDialog } from '@components/clinic/order-result-dialog/order-result-dialog.component';
import { OrderStartDialog } from '@components/clinic/order-start-dialog/order-start-dialog.component';
import { PriorityDialog } from '@components/clinic/priority-dialog/priority-dialog.component';
import { ReferralLinkDialog } from '@components/clinic/referral-link-dialog/referral-link-dialog.component';
import { SessionBookingDialog } from '@components/clinic/session-booking-dialog/session-booking-dialog.component';
import { TreatmentFormDialog } from '@components/clinic/treatment-form-dialog/treatment-form-dialog.component';
import { ConsentDialogData } from '@interfaces/clinic/consent-dialog-data.interface';
import { OrderDialogData } from '@interfaces/clinic/order-dialog-data.interface';
import { OrderFormDialogData } from '@interfaces/clinic/order-form-dialog-data.interface';
import { TreatmentDialogData } from '@interfaces/clinic/treatment-dialog-data.interface';
import { TreatmentFormDialogData } from '@interfaces/clinic/treatment-form-dialog-data.interface';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { Treatment } from '@interfaces/clinic/treatment.interface';
import { DialogService } from '@services/ui/dialog.service';

/**
 * The clinical dialogs (prescribe, book a session, order, record a result, consent …) with their confirmation
 * messages — one place for the visit workspace, patient file, treatment and order pages.
 */
@Injectable({ providedIn: 'root' })
export class ClinicalActions {
  private readonly dialogs = inject(DialogService);

  prescribe(data: Omit<TreatmentFormDialogData, 'treatment'>): Promise<Treatment | undefined> {
    return this.dialogs.openAction(
      TreatmentFormDialog,
      { treatment: null, ...data },
      (t: Treatment) => `${t.title} prescribed (${t.code}). Book the sessions next.`,
      '720px',
    );
  }

  editTreatment(treatment: Treatment): Promise<Treatment | undefined> {
    return this.dialogs.openAction(
      TreatmentFormDialog,
      { treatment },
      () => 'Treatment saved.',
      '720px',
    );
  }

  bookSession(treatment: Treatment): Promise<Appointment | undefined> {
    return this.dialogs.openAction<SessionBookingDialog, TreatmentDialogData, Appointment>(
      SessionBookingDialog,
      { treatment },
      (a) => `Session ${a.sessionNumber} booked on ${a.scheduledDate} at ${a.startTime}.`,
      '680px',
    );
  }

  changePriority(treatment: Treatment): Promise<Treatment | undefined> {
    return this.dialogs.openAction(
      PriorityDialog,
      { treatment },
      (t: Treatment) => `Priority is now ${t.priority}.`,
    );
  }

  order(data: OrderFormDialogData): Promise<ClinicalOrder | undefined> {
    return this.dialogs.openAction(
      OrderFormDialog,
      data,
      (o: ClinicalOrder) => `${o.description} ordered (${o.code}).`,
      '640px',
    );
  }

  startOrder(order: ClinicalOrder): Promise<ClinicalOrder | undefined> {
    return this.dialogs.openAction<OrderStartDialog, OrderDialogData, ClinicalOrder>(
      OrderStartDialog,
      { order },
      (o) => (o.roomId ? `${o.code} started in ${o.room?.code}.` : `${o.code} marked as sent.`),
    );
  }

  recordResult(order: ClinicalOrder): Promise<ClinicalOrder | undefined> {
    return this.dialogs.openAction<OrderResultDialog, OrderDialogData, ClinicalOrder>(
      OrderResultDialog,
      { order },
      (o) =>
        o.isAbnormal
          ? `${o.code} completed — the doctor was alerted (abnormal).`
          : `${o.code} completed — the doctor was told.`,
      '640px',
    );
  }

  linkReferral(order: ClinicalOrder): Promise<ClinicalOrder | undefined> {
    return this.dialogs.openAction<ReferralLinkDialog, OrderDialogData, ClinicalOrder>(
      ReferralLinkDialog,
      { order },
      (o) => `Referral linked to ${o.referralAppointment?.code}.`,
      '600px',
    );
  }

  recordConsent(data: ConsentDialogData): Promise<PatientConsent | undefined> {
    return this.dialogs.openAction(
      ConsentDialog,
      data,
      (c: PatientConsent) => `Consent saved (${c.code}).`,
      '720px',
    );
  }
}
