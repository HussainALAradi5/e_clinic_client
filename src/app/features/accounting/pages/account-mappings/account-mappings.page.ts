import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { Account, AccountMapping } from '@shared/interfaces/accounting/account.interface';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AccessService } from '@shared/services/auth/access.service';
import { AccountApi } from '@shared/services/accounting/account-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/accounting/chart-of-accounts/mappings` — which posting account each automatic entry uses. */
@Component({
  selector: 'app-account-mappings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    ErrorState,
    Skeleton,
    GenericForm,
    EntitySelect,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    EnumLabelPipe,
  ],
  templateUrl: './account-mappings.page.html',
})
export class AccountMappingsPage {
  private readonly api = inject(AccountApi);
  private readonly notify = inject(NotifyService);
  protected readonly canEdit = inject(AccessService).can('accounts.write');

  protected readonly mappings = signal<AccountMapping[] | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected form = new FormGroup<Record<string, FormControl<string | null>>>({});
  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      const rows = await firstValueFrom(this.api.mappings());
      this.form = new FormGroup(
        Object.fromEntries(
          rows.map((m) => [
            m.key,
            new FormControl<string | null>({
              value: m.account?.id ?? null,
              disabled: !this.canEdit,
            }),
          ]),
        ),
      );
      this.mappings.set(rows);
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  /** Posting accounts of the type the role needs. */
  protected filterFor(mapping: AccountMapping): FilterGroup {
    return { and: [{ isGroup: { eq: false } }, { type: { eq: mapping.accountType } }] };
  }

  protected readonly save = async (): Promise<void> => {
    const changed = Object.entries(this.form.controls)
      .filter(([, control]) => control.dirty && control.value)
      .map(([key, control]) => ({ key, accountId: control.value as string }));
    this.mappings.set(await firstValueFrom(this.api.updateMappings(changed)));
    this.form.markAsPristine();
    this.notify.success('Posting accounts saved.');
  };
}
