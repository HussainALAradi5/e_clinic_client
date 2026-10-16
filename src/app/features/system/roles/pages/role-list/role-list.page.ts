import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RoleFormDialog } from '../../components/role-form-dialog/role-form-dialog.component';
import { RoleFormDialogData } from '../../interfaces/role-form-dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Role } from '@shared/interfaces/identity/role.interface';
import { RoleApi } from '@shared/services/identity/role-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { DialogService } from '@shared/services/ui/dialog.service';

/** `/system/roles-permissions` — roles with user / permission counts; bulk archive, delete and restore. */
@Component({
  selector: 'app-role-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MatIconModule],
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
