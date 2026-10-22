import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '../../services/billing-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { CashSessionStatus } from '@shared/enums/finance/cash-session-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Payment } from '@shared/interfaces/billing/payment.interface';
import { CashSession, Denomination } from '@shared/interfaces/finance/cash-session.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { AuthStore } from '@shared/services/auth/auth.store';
import { PaymentApi } from '@shared/services/billing/payment-api.service';
import { CashSessionApi } from '@shared/services/finance/cash-session-api.service';
import { clinicDateTime } from '@shared/utils/clinic-time';
import { formatMoney, fromMinor, toMinor } from '@shared/utils/money';
import { defaultQuery } from '@shared/utils/list-query';

/**
 * `/billing/cash-drawers/:id` — one shift: how the expected cash was built, the count note by note, the
 * difference and who accepted it, the deposit, and the payments taken into it.
 */
@Component({
  selector: 'app-cash-session-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    HasAccessDirective,
    EnumLabelPipe,
    MoneyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './cash-session-detail.page.html',
})
export class CashSessionDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(CashSessionApi);
  private readonly payments = inject(PaymentApi);
  private readonly actions = inject(BillingActions);
  private readonly me = inject(AuthStore).user;

  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly session = signal<CashSession | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly taken = signal<Payment[]>([]);

  protected readonly mine = computed(() => this.session()?.cashierId === this.me()?.id);
  protected readonly isOpen = computed(() => this.session()?.status === CashSessionStatus.Open);
  protected readonly waiting = computed(() => this.session()?.status === CashSessionStatus.Closing);
  protected readonly depositable = computed(() => {
    const s = this.session();
    return s?.status === CashSessionStatus.Closed && !s.depositedAt;
  });
  protected readonly facts = computed<Fact[]>(() => {
    const s = this.session();
    if (!s) return [];
    return [
      { label: 'Cashier', value: s.cashier?.fullName },
      { label: 'Opened', value: clinicDateTime(s.openedAt) },
      { label: 'Closed', value: clinicDateTime(s.closedAt) },
      { label: 'Opening float', value: formatMoney(s.openingFloat) },
      {
        label: 'Expected at close',
        value: s.expectedClosing ? formatMoney(s.expectedClosing) : null,
      },
      { label: 'Counted', value: s.countedClosing ? formatMoney(s.countedClosing) : null },
      { label: 'Difference', value: s.difference ? formatMoney(s.difference) : null },
      { label: 'Difference accepted by', value: s.approvedBy?.fullName },
      {
        label: 'Deposit',
        value: s.depositAmount
          ? `${formatMoney(s.depositAmount)} on ${s.depositedAt} · ${s.depositReference}`
          : null,
      },
      { label: 'Notes', value: s.notes },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  protected noteTotal(d: Denomination): string {
    return fromMinor((toMinor(d.value) ?? 0n) * BigInt(d.count));
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected readonly close = async (): Promise<void> => {
    const s = this.session();
    if (s && (await this.actions.closeDrawer(s))) await this.reload();
  };

  protected readonly accept = async (): Promise<void> => {
    const s = this.session();
    if (s && (await this.actions.approveDifference(s))) await this.reload();
  };

  protected readonly deposit = async (): Promise<void> => {
    const s = this.session();
    if (s && (await this.actions.deposit(s))) await this.reload();
  };

  protected async reload(): Promise<void> {
    try {
      this.error.set(null);
      this.session.set(await firstValueFrom(this.api.get(this.id())));
      const page = await firstValueFrom(
        this.payments.list(
          defaultQuery({
            perPage: 100,
            sort: ['paidAt'],
            filter: { and: [{ cashSessionId: { eq: this.id() } }] },
          }),
        ),
      ).catch(() => null);
      this.taken.set(page?.data ?? []);
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }
}
