import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AccountingActions } from '../../services/accounting-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { FiscalStatus } from '@shared/enums/accounting/fiscal-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { FiscalPeriod, FiscalYear } from '@shared/interfaces/accounting/fiscal.interface';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { FiscalApi } from '@shared/services/accounting/fiscal-api.service';

/**
 * `/accounting/fiscal-years` — each year as a strip of months: close them in order once the month is checked,
 * reopen one with a reason, close the year (profit to retained earnings) and lock it after the audit.
 */
@Component({
  selector: 'app-fiscal-years-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, AppButton, ErrorState, Skeleton, StatusChip, MatCardModule, MatIconModule],
  templateUrl: './fiscal-years.page.html',
})
export class FiscalYearsPage implements OnInit {
  private readonly api = inject(FiscalApi);
  private readonly actions = inject(AccountingActions);

  protected readonly variants = ButtonVariant;
  protected readonly states = FiscalStatus;
  protected readonly years = signal<FiscalYear[] | null>(null);
  protected readonly error = signal<ApiError | null>(null);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.error.set(null);
      const years = await firstValueFrom(this.api.years());
      this.years.set([...years].sort((a, b) => b.startDate.localeCompare(a.startDate)));
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  /** Months close in order: only the first open month of the year can close. */
  protected closable(year: FiscalYear, period: FiscalPeriod): boolean {
    const firstOpen = (year.periods ?? []).find((p) => p.status === FiscalStatus.Open);
    return period.status === FiscalStatus.Open && firstOpen?.id === period.id;
  }

  protected yearClosable(year: FiscalYear): boolean {
    return (
      year.status === FiscalStatus.Open &&
      (year.periods ?? []).every((p) => p.status !== FiscalStatus.Open)
    );
  }

  protected readonly create = (): Promise<void> => this.step(this.actions.createYear());
  protected readonly close = (p: FiscalPeriod): Promise<void> =>
    this.step(this.actions.closePeriod(p));
  protected readonly reopen = (p: FiscalPeriod): Promise<void> =>
    this.step(this.actions.reopenPeriod(p));
  protected readonly closeYear = (y: FiscalYear): Promise<void> =>
    this.step(this.actions.closeYear(y));
  protected readonly lockYear = (y: FiscalYear): Promise<void> =>
    this.step(this.actions.lockYear(y));

  private async step(action: Promise<unknown>): Promise<void> {
    if (await action) await this.load();
  }
}
