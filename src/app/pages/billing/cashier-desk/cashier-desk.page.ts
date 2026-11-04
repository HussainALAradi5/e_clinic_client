import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { CashSessionStatus } from '@enums/finance/cash-session-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { DailySummary } from '@interfaces/billing/daily-summary.interface';
import { CashSession } from '@interfaces/finance/cash-session.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { AccessService } from '@services/auth/access.service';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { PaymentApi } from '@services/billing/payment-api.service';
import { CashSessionApi } from '@services/finance/cash-session-api.service';
import { defaultQuery } from '@utilities/list-query';

/**
 * `/billing/cashier` — the cashier's workplace: the drawer (open, running expected cash, count and close), drafts
 * waiting to be issued, issued invoices with a balance (search by patient or number, take payment), and today's
 * takings per method.
 */
import { WALLET_TEXT } from '@constants/billing/wallet.constants';
@Component({
  selector: 'app-cashier-desk-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    EmptyState,
    Skeleton,
    StatusChip,
    EnumLabelPipe,
    MoneyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './cashier-desk.page.html',
})
export class CashierDeskPage implements OnInit {
  protected readonly walletText = WALLET_TEXT;
  private readonly invoices = inject(InvoiceApi);
  private readonly payments = inject(PaymentApi);
  private readonly drawers = inject(CashSessionApi);
  private readonly actions = inject(BillingActions);
  private readonly access = inject(AccessService);

  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly timeFormat = TIME_FORMAT;
  protected readonly drawerStates = CashSessionStatus;
  protected readonly invoiceStates = InvoiceStatus;
  protected readonly operatesDrawer = this.access.can('cash_sessions.operate');

  /** undefined = loading; null = no open drawer. */
  protected readonly drawer = signal<CashSession | null | undefined>(undefined);
  protected readonly drafts = signal<Invoice[] | undefined>(undefined);
  protected readonly takings = signal<DailySummary | null>(null);
  private readonly refreshed = signal(0);

  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly term = toSignal(
    this.search.valueChanges.pipe(startWith(''), debounceTime(250), distinctUntilChanged()),
    { initialValue: '' },
  );
  /** Issued invoices with a balance, oldest first; reloads on search and after every payment. */
  protected readonly outstanding = toSignal(
    toObservable(computed(() => ({ term: this.term(), tick: this.refreshed() }))).pipe(
      switchMap(({ term }) =>
        this.invoices
          .outstanding(
            defaultQuery({ perPage: 25, search: term.trim() || undefined, sort: ['issueDate'] }),
          )
          .pipe(catchError(() => of(null))),
      ),
    ),
  );

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected readonly openDrawer = async (): Promise<void> => {
    if (await this.actions.openDrawer()) await this.reloadDrawer();
  };

  protected readonly closeDrawer = async (): Promise<void> => {
    const session = this.drawer();
    if (session && (await this.actions.closeDrawer(session))) await this.reloadDrawer();
  };

  protected readonly pay = async (invoice: Invoice): Promise<void> => {
    const full = await firstValueFrom(this.invoices.get(invoice.id));
    if (await this.actions.takePayment(full)) await this.reload();
  };

  protected readonly issue = async (invoice: Invoice): Promise<void> => {
    const full = await firstValueFrom(this.invoices.get(invoice.id));
    const issued = await this.actions.issue(full);
    if (!issued) return;
    await this.reload();
    if (this.access.can('payments.create') && (await this.actions.takePayment(issued)))
      await this.reload();
  };

  private async reload(): Promise<void> {
    this.refreshed.update((n) => n + 1);
    await Promise.all([this.reloadDrawer(), this.reloadDrafts(), this.reloadTakings()]);
  }

  private async reloadDrawer(): Promise<void> {
    if (!this.operatesDrawer) {
      this.drawer.set(null);
      return;
    }
    this.drawer.set(await firstValueFrom(this.drawers.current()).catch(() => null));
  }

  private async reloadDrafts(): Promise<void> {
    const page = await firstValueFrom(
      this.invoices.list(
        defaultQuery({
          perPage: 10,
          sort: ['-createdAt'],
          filter: { and: [{ status: { eq: InvoiceStatus.Draft } }] },
        }),
      ),
    ).catch(() => null);
    this.drafts.set(page?.data ?? []);
  }

  private async reloadTakings(): Promise<void> {
    this.takings.set(await firstValueFrom(this.payments.dailySummary()).catch(() => null));
  }
}
