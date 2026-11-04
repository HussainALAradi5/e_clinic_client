import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ONLINE_PAY_TEXT } from '@constants/portal/online-payment.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { OnlinePaymentApi } from '@services/billing/online-payment-api.service';

/**
 * "Pay online" on an invoice the patient owes: the server opens the charge for what they owe now (their co-pay
 * when insured) and the browser goes to the gateway's secure page in the same tab; they come back to their invoices.
 */
@Component({
  selector: 'app-pay-online-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton],
  template: `<ui-button
    icon="credit_card"
    [variant]="variants.Filled"
    access="online_payments.create"
    lock="once"
    [action]="pay"
    [attr.title]="text.secure"
    >{{ text.pay }}</ui-button
  >`,
})
export class PayOnlineButton {
  readonly invoice = input.required<Invoice>();

  private readonly api = inject(OnlinePaymentApi);
  private readonly key = newIdempotencyKey();
  protected readonly text = ONLINE_PAY_TEXT;
  protected readonly variants = ButtonVariant;

  protected readonly pay = async (): Promise<void> => {
    const online = await firstValueFrom(this.api.start(this.invoice().id, this.key));
    if (online.checkoutUrl) window.location.assign(online.checkoutUrl);
  };
}
