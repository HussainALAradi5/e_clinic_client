import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PharmacyActions } from '@services/pharmacy/pharmacy-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { defaultQuery } from '@utilities/list-query';
import { PATIENT_MEDICINES_TEXT } from '@constants/pharmacy/patient-medicines.constants';

/** The patient's prescriptions on the patient file, newest first, with Prescribe. */
@Component({
  selector: 'app-patient-medicines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, StatusChip, MatIconModule, RouterLink, DatePipe],
  host: { class: 'block' },
  templateUrl: './patient-medicines.component.html',
})
export class PatientMedicines implements OnInit {
  protected readonly text = PATIENT_MEDICINES_TEXT;

  readonly patient = input.required<PatientSummary>();

  private readonly api = inject(PrescriptionApi);
  private readonly actions = inject(PharmacyActions);
  protected readonly prescriptions = signal<Prescription[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    const page = await firstValueFrom(
      this.api.list(
        defaultQuery({
          perPage: 50,
          sort: ['-createdAt'],
          filter: { and: [{ patientId: { eq: this.patient().id } }] },
        }),
      ),
    ).catch(() => null);
    this.prescriptions.set(page?.data ?? []);
  }

  protected readonly prescribe = async (): Promise<void> => {
    if (await this.actions.prescribe({ prescription: null, patient: this.patient() }))
      await this.load();
  };
}
