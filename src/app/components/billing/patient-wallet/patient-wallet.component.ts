import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { WALLET_TEXT } from '@constants/billing/wallet.constants';
import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Wallet } from '@interfaces/billing/wallet-entry.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { BillingActions } from '@services/billing/billing-actions.service';
import { WalletApi } from '@services/billing/wallet-api.service';
import { money, toMinor } from '@utilities/money';

/**
 * A patient's balance and its latest movements, with deposit / pay-back / adjust for staff whose role allows it
 * (the buttons hide otherwise). Shared by the patient file and the patient's own invoices page.
 */
@Component({
  selector: 'app-patient-wallet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, StatusChip, MatIconModule, MoneyPipe, DatePipe],
  host: { class: 'block' },
  templateUrl: './patient-wallet.component.html',
})
export class PatientWallet implements OnInit {
  readonly patient = input.required<PatientSummary>();
  /** Staff actions; off on the patient portal. */
  readonly manage = input(true);
  /** Emits after any movement so the parent can refresh (e.g. invoices). */
  readonly changed = output<void>();

  private readonly api = inject(WalletApi);
  private readonly actions = inject(BillingActions);
  readonly wallet = signal<Wallet | null>(null);
  protected readonly text = WALLET_TEXT;
  protected readonly movements = WalletMovement;
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_TIME_FORMAT;
  protected readonly hasMoney = computed(() => (toMinor(this.wallet()?.balance.amount) ?? 0n) > 0n);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    const wallet = await firstValueFrom(this.api.get(this.patient().id, 10)).catch(() => null);
    this.wallet.set(wallet ?? { balance: money('0.000'), entries: [] });
  }

  protected readonly move = async (movement: WalletMovement): Promise<void> => {
    const wallet = this.wallet();
    if (!wallet) return;
    const entry = await this.actions.moveWallet({
      movement,
      patient: this.patient(),
      balance: wallet.balance,
    });
    if (!entry) return;
    await this.load();
    this.changed.emit();
  };
}
