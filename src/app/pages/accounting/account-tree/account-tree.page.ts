import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { AccountType } from '@enums/accounting/account-type.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { ApiError } from '@interfaces/api/api-error.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AccountApi } from '@services/accounting/account-api.service';

/** `/accounting/chart-of-accounts/tree` — the chart as an outline, filterable by type; groups fold. */
@Component({
  selector: 'app-account-tree-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    ErrorState,
    Skeleton,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    RouterLink,
    NgTemplateOutlet,
    EnumLabelPipe,
  ],
  templateUrl: './account-tree.page.html',
})
export class AccountTreePage {
  private readonly api = inject(AccountApi);

  protected readonly types = Object.values(AccountType);
  protected readonly type = signal<AccountType | null>(null);
  protected readonly tree = signal<Account[] | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  /** Folded group ids. */
  protected readonly folded = signal(new Set<string>());

  constructor() {
    void this.load();
  }

  protected async load(type: AccountType | null = this.type()): Promise<void> {
    this.type.set(type);
    this.error.set(null);
    try {
      this.tree.set(await firstValueFrom(this.api.tree(type)));
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  protected toggle(id: string): void {
    const next = new Set(this.folded());
    if (!next.delete(id)) next.add(id);
    this.folded.set(next);
  }
}
