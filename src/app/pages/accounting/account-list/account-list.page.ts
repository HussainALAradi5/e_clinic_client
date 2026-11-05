import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccountFormDialog } from '@components/accounting/account-form-dialog/account-form-dialog.component';
import { AccountFormDialogData } from '@interfaces/accounting/dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Account } from '@interfaces/accounting/account.interface';
import { AccountApi } from '@services/accounting/account-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { ACCOUNT_LIST_TEXT } from '@constants/accounting/account-list.constants';

/** `/accounting/chart-of-accounts` — flat, searchable chart with bulk archive / delete / restore. */
@Component({
  selector: 'app-account-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './account-list.page.html',
})
export class AccountListPage {
  private readonly api = inject(AccountApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly text = ACCOUNT_LIST_TEXT;
  protected readonly create = async (): Promise<void> => {
    const account = await this.dialogs.open<AccountFormDialog, AccountFormDialogData, Account>(
      AccountFormDialog,
      { account: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '640px' },
    );
    if (account) {
      this.notify.success(ACCOUNT_LIST_TEXT.accountCreated(account.code, account.name));
      await this.router.navigate(['/accounting/chart-of-accounts', account.id]);
    }
  };
}
