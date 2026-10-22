import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProgressMeter } from '../progress-meter/progress-meter.component';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { Treatment } from '@shared/interfaces/clinic/treatment.interface';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';

/** Patient file tab: the patient's treatment plans with progress and their orders / results, newest first. */
@Component({
  selector: 'app-patient-care',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppButton,
    StatusChip,
    ProgressMeter,
    HasAccessDirective,
    DatePipe,
    MatCardModule,
    RouterLink,
  ],
  host: { class: 'block' },
  templateUrl: './patient-care.component.html',
})
export class PatientCare implements OnInit {
  readonly patient = input.required<Patient>();

  private readonly treatmentsApi = inject(TreatmentApi);
  private readonly ordersApi = inject(ClinicalOrderApi);
  private readonly actions = inject(ClinicalActions);
  protected readonly treatments = signal<Treatment[] | null>(null);
  protected readonly orders = signal<ClinicalOrder[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

  ngOnInit(): void {
    void this.loadTreatments();
    void this.loadOrders();
  }

  protected readonly prescribe = async (): Promise<void> => {
    if (await this.actions.prescribe({ patient: this.patient() })) await this.loadTreatments();
  };

  protected readonly order = async (): Promise<void> => {
    if (await this.actions.order({ patient: this.patient() })) await this.loadOrders();
  };

  private async loadTreatments(): Promise<void> {
    const query = {
      perPage: 50,
      sort: ['-createdAt'],
      filter: { and: [{ patientId: { eq: this.patient().id } }] },
    };
    this.treatments.set(
      (
        await firstValueFrom(this.treatmentsApi.list(query)).catch(() => ({
          data: [] as Treatment[],
        }))
      ).data,
    );
  }

  private async loadOrders(): Promise<void> {
    const query = {
      perPage: 50,
      sort: ['-createdAt'],
      filter: { and: [{ patientId: { eq: this.patient().id } }] },
    };
    this.orders.set(
      (
        await firstValueFrom(this.ordersApi.list(query)).catch(() => ({
          data: [] as ClinicalOrder[],
        }))
      ).data,
    );
  }
}
