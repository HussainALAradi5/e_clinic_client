import { inject, Injectable } from '@angular/core';
import { ConsentDialog } from '../components/consent-dialog/consent-dialog.component';
import { OrderFormDialog } from '../components/order-form-dialog/order-form-dialog.component';
import { OrderResultDialog } from '../components/order-result-dialog/order-result-dialog.component';
import { OrderStartDialog } from '../components/order-start-dialog/order-start-dialog.component';
import { PriorityDialog } from '../components/priority-dialog/priority-dialog.component';
import { ReferralLinkDialog } from '../components/referral-link-dialog/referral-link-dialog.component';
import { SessionBookingDialog } from '../components/session-booking-dialog/session-booking-dialog.component';
import { TreatmentFormDialog } from '../components/treatment-form-dialog/treatment-form-dialog.component';
import {
  ConsentDialogData,
  OrderDialogData,
  OrderFormDialogData,
  TreatmentDialogData,
  TreatmentFormDialogData,
} from '../interfaces/dialog-data.interface';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { PatientConsent } from '@shared/interfaces/clinic/consent.interface';
import { Treatment } from '@shared/interfaces/clinic/treatment.interface';
import { DialogService } from '@shared/services/ui/dialog.service';

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
