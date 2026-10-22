import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { OrderDialogData } from '../../interfaces/dialog-data.interface';
import { AppointmentActions } from '../../services/appointment-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { ApiClient } from '@shared/services/api/api-client.service';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';
import { DoctorApi } from '@shared/services/clinic/doctor-api.service';
import { PatientApi } from '@shared/services/clinic/patient-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/**
 * Close the loop of an internal referral: link one of the patient's upcoming visits, or book a new one with the
 * referred doctor (the booking window opens preset) and link it.
 */
@Component({
  selector: 'app-referral-link-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, AppButton, DatePipe],
  templateUrl: './referral-link-dialog.component.html',
})
export class ReferralLinkDialog implements OnInit {
  protected readonly data = inject<OrderDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ReferralLinkDialog, ClinicalOrder>);
  private readonly api = inject(ClinicalOrderApi);
  private readonly client = inject(ApiClient);
  private readonly patients = inject(PatientApi);
  private readonly doctors = inject(DoctorApi);
  private readonly bookings = inject(AppointmentActions);

  protected readonly upcoming = signal<Appointment[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(
      this.client.list<Appointment>('appointments', {
        perPage: 50,
        sort: ['scheduledDate', 'startTime'],
        filter: {
          and: [
            { patientId: { eq: this.data.order.patientId } },
            { status: { in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] } },
            { scheduledDate: { gte: clinicIsoDate() } },
          ],
        },
      }),
    ).catch(() => ({ data: [] as Appointment[] }));
    const doctorId = this.data.order.referredToDoctorId;
    this.upcoming.set(doctorId ? page.data.filter((a) => a.providerId === doctorId) : page.data);
  }

  protected readonly link = async (appointment: Appointment): Promise<void> => {
    this.ref.close(
      await firstValueFrom(this.api.linkReferralAppointment(this.data.order.id, appointment.id)),
    );
  };

  protected readonly bookNew = async (): Promise<void> => {
    const order = this.data.order;
    const [patient, doctor] = await Promise.all([
      firstValueFrom(this.patients.get(order.patientId)),
      order.referredToDoctorId
        ? firstValueFrom(this.doctors.get(order.referredToDoctorId))
        : Promise.resolve(null),
    ]);
    const booked = await this.bookings.book({ patient, doctor });
    if (booked) await this.link(booked);
  };
}
