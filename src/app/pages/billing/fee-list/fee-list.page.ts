import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { FEE_TEXT } from '@constants/billing/appointment-fee.constants';
import { AppointmentFeeStatus } from '@enums/billing/appointment-fee-status.enum';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { AppointmentFee } from '@interfaces/billing/appointment-fee.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { BillingActions } from '@services/billing/billing-actions.service';
import { defaultQuery } from '@utilities/list-query';

/**
 * `/billing/fees` — fees for missed and late-cancelled visits, newest first, with the visit and the invoice they
 * sit on. Admins and accountants waive a fee (with a reason) while that invoice is still a draft.
 */
@Component({
  selector: 'app-fee-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, MoneyPipe, DatePipe, RouterLink],
  templateUrl: './fee-list.page.html',
})
export class FeeListPage {
  private readonly actions = inject(BillingActions);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly text = FEE_TEXT;
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly columns = [
    'code',
    'created_at',
    'patient',
    'type',
    'amount',
    'invoice',
    'status',
  ];
  protected readonly defaults: ListQuery = defaultQuery({ sort: ['-createdAt'] });

  protected waivable(fee: AppointmentFee): boolean {
    return (
      fee.status === AppointmentFeeStatus.Charged &&
      (fee.invoice === null || fee.invoice.status === InvoiceStatus.Draft)
    );
  }

  protected readonly waive = async (fee: AppointmentFee): Promise<void> => {
    if (await this.actions.waiveFee(fee)) this.list().reload();
  };
}
