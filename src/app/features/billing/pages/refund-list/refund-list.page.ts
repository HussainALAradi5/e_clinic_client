import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillingActions } from '../../services/billing-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { ApprovalStatus } from '@shared/enums/shared/approval-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Refund } from '@shared/interfaces/billing/refund.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { defaultQuery } from '@shared/utils/list-query';

/**
 * `/billing/refunds` — the refund queue: approvers see what waits for them, cashiers what is approved and still to
 * pay out. Opens on the requests not yet paid out.
 */
@Component({
  selector: 'app-refund-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    StatusChip,
    EnumLabelPipe,
    MoneyPipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './refund-list.page.html',
})
export class RefundListPage {
  private readonly actions = inject(BillingActions);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  /** Actions sit in the last column. */
  protected readonly columns = [
    'code',
    'created_at',
    'patient',
    'amount',
    'method',
    'reason',
    'processed_at',
    'status',
  ];
  protected readonly defaults: ListQuery = defaultQuery({
    filter: {
      and: [
        { processedAt: { null: true } },
        { status: { in: [ApprovalStatus.Pending, ApprovalStatus.Approved] } },
      ],
    },
  });

  protected pending(r: Refund): boolean {
    return r.status === ApprovalStatus.Pending;
  }

  protected toPayOut(r: Refund): boolean {
    return r.status === ApprovalStatus.Approved && !r.isProcessed;
  }

  protected readonly approve = (r: Refund) => this.run(this.actions.approveRefund(r));
  protected readonly reject = (r: Refund) => this.run(this.actions.rejectRefund(r));
  protected readonly payOut = (r: Refund) => this.run(this.actions.processRefund(r));

  private async run(step: Promise<Refund | undefined>): Promise<void> {
    if (await step) this.list().reload();
  }
}
