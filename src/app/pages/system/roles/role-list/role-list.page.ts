import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RoleFormDialog } from '@components/system/roles/role-form-dialog/role-form-dialog.component';
import { RoleFormDialogData } from '@interfaces/system/roles/role-form-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Role } from '@interfaces/identity/role.interface';
import { RoleApi } from '@services/identity/role-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { DialogService } from '@services/ui/dialog.service';

/** `/system/roles-permissions` — roles with user / permission counts; bulk archive, delete and restore. */
@Component({
  selector: 'app-role-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MatIconModule, RouterLink],
  templateUrl: './role-list.page.html',
})
export class RoleListPage {
  private readonly api = inject(RoleApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const role = await this.dialogs.open<RoleFormDialog, RoleFormDialogData, Role>(RoleFormDialog, {
      role: null,
      save: (payload) => firstValueFrom(this.api.create(payload)),
    });
    if (role) {
      this.notify.success(`Role ${role.displayName} created. Now choose what it may do.`);
      await this.router.navigate(['/system/roles-permissions', role.id, 'access']);
    }
  };
}
