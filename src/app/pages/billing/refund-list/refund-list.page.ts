import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Refund } from '@interfaces/billing/refund.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { defaultQuery } from '@utilities/list-query';
import { REFUND_LIST_TEXT } from '@constants/billing/refund-list.constants';

/**
 * `/billing/refunds` — the refund queue: approvers see what waits for them, cashiers what is approved and still to
 * pay out. Opens on the requests not yet paid out.
 */
@Component({
  selector: 'app-refund-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, MoneyPipe, DatePipe, RouterLink],
  templateUrl: './refund-list.page.html',
})
export class RefundListPage {
  private readonly actions = inject(BillingActions);

  protected readonly text = REFUND_LIST_TEXT;
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = dateTimeFormat;
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
