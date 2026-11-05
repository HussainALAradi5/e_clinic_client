import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PortalActions } from '@services/portal/portal-actions.service';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { isOpenGenericStatus } from '@enums/shared/generic-status.enum';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { PRESCRIPTIONS_TEXT } from '@constants/portal/prescriptions.constants';

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

  protected readonly text = PRESCRIPTIONS_TEXT;
  protected readonly prescriptions = signal<Prescription[] | null>(null);
  private readonly today = clinicIsoDate();

  constructor() {
    firstValueFrom(this.api.list({ perPage: 50, sort: ['-createdAt'] }))
      .then((page) => this.prescriptions.set(page.data))
      .catch(() => this.prescriptions.set([]));
  }

  /** Still to collect (not fully dispensed, cancelled or expired). */
  protected collectable(rx: Prescription): boolean {
    return isOpenGenericStatus(rx.status) && rx.validUntil >= this.today;
  }

  protected code(rx: Prescription): void {
    this.actions.showPrescriptionCode(rx);
  }
}
