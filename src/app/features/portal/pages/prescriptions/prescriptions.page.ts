import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PortalActions } from '../../services/portal-actions.service';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { Prescription } from '@shared/interfaces/pharmacy/prescription.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { PrescriptionApi } from '@shared/services/pharmacy/prescription-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

const OPEN = [GenericStatus.Pending, GenericStatus.InProgress];

/** `/portal/prescriptions` — medicines with how to take them; open ones carry the code for the pharmacy. */
@Component({
  selector: 'app-my-prescriptions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    LowerCasePipe,
    MatButtonModule,
    MatIconModule,
    EmptyState,
    Skeleton,
    StatusChip,
    EnumLabelPipe,
    QtyPipe,
  ],
  templateUrl: './prescriptions.page.html',
})
export class MyPrescriptionsPage {
  private readonly api = inject(PrescriptionApi);
  private readonly actions = inject(PortalActions);

  protected readonly prescriptions = signal<Prescription[] | null>(null);
  private readonly today = clinicIsoDate();

  constructor() {
    firstValueFrom(this.api.list({ perPage: 50, sort: ['-createdAt'] }))
      .then((page) => this.prescriptions.set(page.data))
      .catch(() => this.prescriptions.set([]));
  }

  /** Still to collect (not fully dispensed, cancelled or expired). */
  protected collectable(rx: Prescription): boolean {
    return OPEN.includes(rx.status) && rx.validUntil >= this.today;
  }

  protected code(rx: Prescription): void {
    this.actions.showPrescriptionCode(rx);
  }
}
