import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, map, startWith } from 'rxjs';
import { PaymentDialogData } from '../../interfaces/dialog-data.interface';
import { OpenDrawerDialog } from '../open-drawer-dialog/open-drawer-dialog.component';
import { newIdempotencyKey } from '@core/interceptors/http-context';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { PaymentMethod } from '@shared/enums/shared/payment-method.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Payment } from '@shared/interfaces/billing/payment.interface';
import { CashSession } from '@shared/interfaces/finance/cash-session.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { AccessService } from '@shared/services/auth/access.service';
import { PaymentApi } from '@shared/services/billing/payment-api.service';
import { CashSessionApi } from '@shared/services/finance/cash-session-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { fromMinor, toMinor } from '@shared/utils/money';
import { AppValidators } from '@shared/utils/validators';

type PaymentRow = FormGroup<{
  method: FormControl<PaymentMethod>;
  amount: FormControl<string | null>;
  tendered: FormControl<string | null>;
  referenceNumber: FormControl<string | null>;
  cardLast4: FormControl<string | null>;
}>;

/** Desk methods (insurance settles through claims, never at the desk). */
const METHODS: readonly { value: PaymentMethod; label: string; icon: string }[] = [
  { value: PaymentMethod.Cash, label: 'Cash', icon: 'payments' },
  { value: PaymentMethod.Card, label: 'Card', icon: 'credit_card' },
  { value: PaymentMethod.BenefitPay, label: 'BenefitPay', icon: 'qr_code_2' },
  { value: PaymentMethod.BankTransfer, label: 'Transfer', icon: 'account_balance' },
  { value: PaymentMethod.Cheque, label: 'Cheque', icon: 'receipt' },
];

/**
 * Take payment: the balance is filled in, cash shows the change to give back, and "Split" pays the rest another
 * way. Each part is sent with its own Idempotency-Key, so a retry never charges twice and parts already taken stay
 * taken. Cash needs the cashier's open drawer — it can be opened from here.
 */
@Component({
  selector: 'app-payment-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    AppButton,
    MoneyInput,
    TextField,
    MoneyPipe,
  ],
  templateUrl: './payment-dialog.component.html',
})
export class PaymentDialog implements OnInit {
  protected readonly data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PaymentDialog, Payment[]>);
  private readonly api = inject(PaymentApi);
  private readonly drawers = inject(CashSessionApi);
  private readonly dialogs = inject(DialogService);
  private readonly access = inject(AccessService);

  protected readonly invoice = this.data.invoice;
  protected readonly methods = METHODS;
  protected readonly variants = ButtonVariant;
  protected readonly cash = PaymentMethod.Cash;
  protected readonly card = PaymentMethod.Card;
  protected readonly operatesDrawer = this.access.can('cash_sessions.operate');
  protected readonly drawer = signal<CashSession | null | undefined>(undefined);
  protected readonly recorded = signal<Payment[]>([]);
  private readonly keys = new WeakMap<PaymentRow, string>();

  protected readonly rows = new FormArray<PaymentRow>([this.row(this.invoice.balanceDue.amount)]);
  protected readonly form = new FormGroup({ rows: this.rows });

  private readonly values = toSignal(
    this.rows.valueChanges.pipe(
      startWith(null),
      map(() => this.rows.getRawValue()),
    ),
    { requireSync: true },
  );
  /** Balance still to cover by the rows not yet taken. */
  private readonly balance = computed(() => {
    const paid = this.recorded().reduce((sum, p) => sum + (toMinor(p.amount.amount) ?? 0n), 0n);
    return (toMinor(this.invoice.balanceDue.amount) ?? 0n) - paid;
  });
  protected readonly remaining = computed(() => {
    const entered = this.values().reduce((sum, r) => sum + (toMinor(r.amount) ?? 0n), 0n);
    return fromMinor(this.balance() - entered);
  });
  protected readonly overpaid = computed(() => (toMinor(this.remaining()) ?? 0n) < 0n);
  protected readonly needsDrawer = computed(
    () => this.drawer() === null && this.values().some((r) => r.method === PaymentMethod.Cash),
  );

  constructor() {
    // The parts may never add up to more than the balance (the server refuses an overpayment too).
    this.form.addValidators(() => (this.overpaid() ? { overpaid: true } : null));
  }

  async ngOnInit(): Promise<void> {
    if (!this.operatesDrawer) return;
    this.drawer.set(await firstValueFrom(this.drawers.current()).catch(() => undefined));
  }

  protected change(row: PaymentRow): string | null {
    const v = row.getRawValue();
    const tendered = toMinor(v.tendered);
    const amount = toMinor(v.amount);
    if (
      v.method !== PaymentMethod.Cash ||
      tendered === null ||
      amount === null ||
      tendered < amount
    ) {
      return null;
    }
    return fromMinor(tendered - amount);
  }

  protected split(): void {
    const left = toMinor(this.remaining()) ?? 0n;
    this.rows.push(this.row(left > 0n ? fromMinor(left) : null, PaymentMethod.Card));
  }

  protected removeRow(index: number): void {
    this.rows.removeAt(index);
  }

  protected readonly openDrawer = async (): Promise<void> => {
    const session = await this.dialogs.open<OpenDrawerDialog, null, CashSession>(
      OpenDrawerDialog,
      null,
    );
    if (session) this.drawer.set(session);
  };

  /** Sends the rows one by one; rows already taken leave the form, so a retry only sends what is left. */
  protected readonly submit = async (): Promise<Payment[]> => {
    while (this.rows.length) {
      const row = this.rows.at(0);
      const v = row.getRawValue();
      const payment = await firstValueFrom(
        this.api.record(
          {
            invoiceId: this.invoice.id,
            amount: v.amount as string,
            method: v.method,
            referenceNumber: v.referenceNumber?.trim() || null,
            cardLast4: v.cardLast4?.trim() || null,
          },
          this.key(row),
        ),
      );
      this.recorded.update((list) => [...list, payment]);
      this.rows.removeAt(0);
    }
    this.ref.close(this.recorded());
    return this.recorded();
  };

  protected close(): void {
    this.ref.close(this.recorded().length ? this.recorded() : undefined);
  }

  private key(row: PaymentRow): string {
    let key = this.keys.get(row);
    if (!key) {
      key = newIdempotencyKey();
      this.keys.set(row, key);
    }
    return key;
  }

  private row(amount: string | null, method = PaymentMethod.Cash): PaymentRow {
    const group: PaymentRow = new FormGroup({
      method: new FormControl(method, { nonNullable: true }),
      amount: new FormControl<string | null>(amount, [
        Validators.required,
        AppValidators.money,
        AppValidators.positive,
      ]),
      tendered: new FormControl<string | null>(null, [AppValidators.money]),
      referenceNumber: new FormControl<string | null>(null, [
        Validators.maxLength(100),
        AppValidators.requiredIf((c) =>
          [PaymentMethod.BankTransfer, PaymentMethod.Cheque].includes(
            c.parent?.get('method')?.value as PaymentMethod,
          ),
        ),
      ]),
      cardLast4: new FormControl<string | null>(null, [Validators.pattern(/^\d{4}$/)]),
    });
    // A changed method or amount starts a new attempt (new key); the reference rule follows the method.
    group.controls.method.valueChanges.subscribe(() => {
      this.keys.delete(group);
      group.controls.referenceNumber.updateValueAndValidity();
    });
    group.controls.amount.valueChanges.subscribe(() => this.keys.delete(group));
    return group;
  }
}
