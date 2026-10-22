import { formatDate } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CodeDialog } from '../components/code-dialog/code-dialog.component';
import { ProfileDialog } from '../components/profile-dialog/profile-dialog.component';
import { CodeDialogData, ProfileDialogData } from '../interfaces/dialog-data.interface';
import { CLINIC_LOCALE } from '@shared/constants/app.constants';
import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { Attachment } from '@shared/interfaces/attachment/attachment.interface';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { Prescription } from '@shared/interfaces/pharmacy/prescription.interface';
import { AttachmentApi } from '@shared/services/attachment/attachment-api.service';
import { PortalApi } from '@shared/services/portal/portal-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** A booking the patient may still cancel online (the server also enforces the 2-hour window). */
export const CANCELLABLE = [AppointmentStatus.Pending, AppointmentStatus.Confirmed];

/** "Sun 25 Oct 2026" for a clinic date (YYYY-MM-DD). */
export function visitDay(date: string): string {
  return formatDate(`${date}T00:00:00`, 'EEE d MMM yyyy', CLINIC_LOCALE);
}

/**
 * Portal steps with their confirmations and messages: show a code to scan, cancel a visit, edit contact details,
 * open a result file. Each returns the changed record, or undefined when the patient backed out.
 */
@Injectable({ providedIn: 'root' })
export class PortalActions {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly api = inject(PortalApi);
  private readonly files = inject(AttachmentApi);

  showVisitCode(visit: Appointment): void {
    this.showCode({
      entity: 'appointment',
      recordId: visit.id,
      title: 'Check-in code',
      lines: [
        `${visitDay(visit.scheduledDate)}, ${visit.startTime}`,
        visit.provider?.fullName ?? '',
        visit.code,
      ].filter(Boolean),
      hint: 'Show this at the front desk when you arrive. It works only for this visit.',
    });
  }

  showPrescriptionCode(rx: Prescription): void {
    this.showCode({
      entity: 'prescription',
      recordId: rx.id,
      title: 'Prescription code',
      lines: [rx.code, `Valid until ${visitDay(rx.validUntil)}`],
      hint: 'Show this at the clinic pharmacy to collect your medicines.',
    });
  }

  async cancelVisit(visit: Appointment): Promise<Appointment | undefined> {
    const reason = await this.dialogs.reason({
      title: 'Cancel this visit?',
      message: `${visitDay(visit.scheduledDate)} at ${visit.startTime} with ${visit.provider?.fullName ?? 'your doctor'}. Online cancellation closes 2 hours before the start.`,
      reasonLabel: 'Why are you cancelling?',
      confirmLabel: 'Cancel visit',
      cancelLabel: 'Keep it',
      danger: true,
    });
    if (!reason) return undefined;
    const cancelled = await firstValueFrom(this.api.cancel(visit.id, reason));
    this.notify.success('Your visit is cancelled.');
    return cancelled;
  }

  async editProfile(patient: Patient): Promise<Patient | undefined> {
    const saved = await this.dialogs.open<ProfileDialog, ProfileDialogData, Patient>(
      ProfileDialog,
      { patient },
      { width: '640px' },
    );
    if (saved) this.notify.success('Your details are saved.');
    return saved;
  }

  async openFile(file: Attachment): Promise<void> {
    await firstValueFrom(this.files.download(file.id, true));
  }

  private showCode(data: CodeDialogData): void {
    void this.dialogs.open<CodeDialog, CodeDialogData, void>(CodeDialog, data, { width: '400px' });
  }
}
