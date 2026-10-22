import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { ORDER_DESKS } from '../../utils/clinical';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { ClinicalOrderType } from '@shared/enums/clinic/clinical-order-type.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';

/** Work list refresh — orders arrive from consulting rooms all day. */
const REFRESH_MS = 60_000;

/**
 * `/clinic/clinical-orders/worklist` — the radiology, lab, ECG and referral desks: open orders, urgent first, with
 * the next step (start, record result, book the referred visit).
 */
@Component({
  selector: 'app-order-worklist-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    StatusChip,
    DatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './order-worklist.page.html',
})
export class OrderWorklistPage {
  private readonly api = inject(ClinicalOrderApi);
  private readonly actions = inject(ClinicalActions);

  protected readonly desks = ORDER_DESKS;
  protected readonly desk = signal(0);
  protected readonly orders = signal<ClinicalOrder[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly pending = GenericStatus.Pending;
  protected readonly referral = ClinicalOrderType.Referral;

  constructor() {
    void this.load();
    const timer = setInterval(
      () => document.visibilityState === 'visible' && void this.load(),
      REFRESH_MS,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected pick(index: number): void {
    this.desk.set(index);
    this.orders.set(null);
    void this.load();
  }

  protected async load(): Promise<void> {
    this.orders.set(
      await firstValueFrom(this.api.worklist(this.desks[this.desk()].types)).catch(() => []),
    );
  }

  /** Internal referral → book / link the visit; others: start, then record the result. */
  protected readonly next = async (order: ClinicalOrder): Promise<void> => {
    const internalReferral =
      order.type === ClinicalOrderType.Referral && !order.referredToCompanyId;
    const done =
      order.status === GenericStatus.Pending
        ? internalReferral
          ? await this.actions.linkReferral(order)
          : await this.actions.startOrder(order)
        : await this.actions.recordResult(await firstValueFrom(this.api.get(order.id)));
    if (done) await this.load();
  };

  protected nextLabel(order: ClinicalOrder): string {
    if (order.status !== GenericStatus.Pending)
      return order.type === ClinicalOrderType.Referral ? 'Reply received' : 'Record result';
    if (order.type !== ClinicalOrderType.Referral) return 'Start';
    return order.referredToCompanyId ? 'Letter sent' : 'Book visit';
  }
}
