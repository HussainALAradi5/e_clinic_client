import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PharmacyActions } from '@services/pharmacy/pharmacy-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { DispensationKind } from '@enums/pharmacy/dispensation-kind.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { AppointmentMedicines } from '@interfaces/pharmacy/appointment-medicines.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { DispensationApi } from '@services/pharmacy/dispensation-api.service';

/**
 * Medicines of one visit or session, on the appointment page: what the doctor prescribed there (and how much the
 * pharmacy has handed over) and what was given during the session — with Prescribe and Give medicine.
 */
@Component({
  selector: 'app-session-medicines',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppButton,
    StatusChip,
    MatCardModule,
    MatIconModule,
    RouterLink,
    DatePipe,
    EnumLabelPipe,
    QtyPipe,
  ],
  host: { class: 'block' },
  templateUrl: './session-medicines.component.html',
})
export class SessionMedicines implements OnInit {
  readonly appointmentId = input.required<string>();
  readonly patient = input.required<PatientSummary | null>();
  /** Checked in or in progress: medicines can be given now. */
  readonly running = input(false);

  private readonly api = inject(DispensationApi);
  private readonly actions = inject(PharmacyActions);
  protected readonly medicines = signal<AppointmentMedicines | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly administered = DispensationKind.Administered;
  protected readonly cancelled = GenericStatus.Cancelled;
  protected readonly empty = computed(() => {
    const m = this.medicines();
    return !!m && !m.prescriptions.length && !m.dispensations.length;
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.medicines.set(
      await firstValueFrom(this.api.forAppointment(this.appointmentId())).catch(() => null),
    );
  }

  protected readonly prescribe = async (): Promise<void> => {
    if (
      await this.actions.prescribe({
        prescription: null,
        patient: this.patient(),
        appointmentId: this.appointmentId(),
      })
    )
      await this.load();
  };

  protected readonly give = async (): Promise<void> => {
    if (
      await this.actions.administer({
        appointmentId: this.appointmentId(),
        patient: this.patient(),
      })
    )
      await this.load();
  };
}
