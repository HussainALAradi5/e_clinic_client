import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProgressBar } from '@components/common/progress-bar/progress-bar.component';
import { INVOICE_PROGRESS_TEXT } from '@constants/billing/invoice-progress.constants';
import { paidPercent, paidTone, InvoiceProgressSource } from '@utilities/billing/invoice-progress';

/** How much of an invoice is paid, as a bar coloured by how far it is (amber → blue → green). */
@Component({
  selector: 'app-invoice-paid-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBar],
  host: { class: 'block' },
  template: `<ui-progress-bar
    [value]="percent()"
    [tone]="tone()"
    [label]="label() ? text.paid : ''"
    [showValue]="label()"
    [height]="label() ? 8 : 4"
  />`,
})
export class InvoicePaidBar {
  readonly invoice = input.required<InvoiceProgressSource>();
  /** Show "Paid" and the percentage above the bar. */
  readonly label = input(false);

  protected readonly text = INVOICE_PROGRESS_TEXT;
  protected readonly percent = computed(() => paidPercent(this.invoice()));
  protected readonly tone = computed(() => paidTone(this.percent()));
}
