import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccountFormDialog } from '../../components/account-form-dialog/account-form-dialog.component';
import { AccountFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Account } from '@shared/interfaces/accounting/account.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AccountApi } from '@shared/services/accounting/account-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/accounting/chart-of-accounts` — flat, searchable chart with bulk archive / delete / restore. */
@Component({
  selector: 'app-account-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    EnumLabelPipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './account-list.page.html',
})
export class AccountListPage {
  private readonly api = inject(AccountApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const account = await this.dialogs.open<AccountFormDialog, AccountFormDialogData, Account>(
      AccountFormDialog,
      { account: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '640px' },
    );
    if (account) {
      this.notify.success(`Account ${account.code} ${account.name} created.`);
      await this.router.navigate(['/accounting/chart-of-accounts', account.id]);
    }
  };
}
